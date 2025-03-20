from typing import Optional, Dict, Any
from datetime import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.user import User
from app.models.session import Session as MentorSession
import os

class CalendarService:
    def __init__(self, db: Session):
        self.db = db
        self.scopes = ['https://www.googleapis.com/auth/calendar']
        self.api_version = 'v3'
        
    def create_oauth_flow(self, state: Optional[str] = None) -> Flow:
        """Create and configure OAuth flow"""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
                }
            },
            scopes=self.scopes,
            state=state
        )
        flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
        return flow

    def get_calendar_service(self, credentials_dict: Dict[str, Any]):
        """Build and return Google Calendar service"""
        credentials = Credentials.from_authorized_user_info(credentials_dict, self.scopes)
        return build('calendar', self.api_version, credentials=credentials)

    async def create_calendar_event(
        self,
        mentor_id: int,
        mentee_id: int,
        start_time: datetime,
        end_time: datetime,
        title: str,
        description: str,
        meeting_link: Optional[str] = None,
        use_admin_calendar: bool = False
    ) -> Dict[str, Any]:
        """Create a calendar event for a mentoring session"""
        # Get mentor and mentee
        mentor = self.db.query(User).filter(User.id == mentor_id).first()
        mentee = self.db.query(User).filter(User.id == mentee_id).first()
        
        if not mentor or not mentee:
            raise ValueError("Mentor or mentee not found")

        # Get calendar credentials
        user = mentor if not use_admin_calendar else self.db.query(User).filter(User.role == "admin").first()
        if not user or not user.calendar_credentials:
            raise ValueError("Calendar credentials not found")

        service = self.get_calendar_service(user.calendar_credentials)
        
        event = {
            'summary': title,
            'description': description,
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': mentor.timezone or 'UTC',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': mentor.timezone or 'UTC',
            },
            'attendees': [
                {'email': mentor.email},
                {'email': mentee.email},
            ],
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 30},
                ],
            },
        }

        if meeting_link:
            event['conferenceData'] = {
                'createRequest': {
                    'requestId': f"mentor-match-{mentor_id}-{mentee_id}-{int(datetime.now().timestamp())}",
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'},
                }
            }

        try:
            event = service.events().insert(
                calendarId='primary',
                body=event,
                conferenceDataVersion=1 if meeting_link else 0,
                sendUpdates='all'
            ).execute()
            
            return {
                'id': event.get('id'),
                'htmlLink': event.get('htmlLink'),
                'meetingLink': event.get('conferenceData', {}).get('entryPoints', [{}])[0].get('uri')
                if meeting_link else None
            }
            
        except Exception as e:
            raise Exception(f"Failed to create calendar event: {str(e)}")

    async def update_calendar_event(
        self,
        event_id: str,
        user_id: int,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        title: Optional[str] = None,
        description: Optional[str] = None,
        use_admin_calendar: bool = False
    ) -> Dict[str, Any]:
        """Update an existing calendar event"""
        user = (
            self.db.query(User).filter(User.id == user_id).first()
            if not use_admin_calendar
            else self.db.query(User).filter(User.role == "admin").first()
        )
        
        if not user or not user.calendar_credentials:
            raise ValueError("Calendar credentials not found")

        service = self.get_calendar_service(user.calendar_credentials)
        
        # Get existing event
        event = service.events().get(calendarId='primary', eventId=event_id).execute()
        
        # Update fields if provided
        if start_time:
            event['start']['dateTime'] = start_time.isoformat()
        if end_time:
            event['end']['dateTime'] = end_time.isoformat()
        if title:
            event['summary'] = title
        if description:
            event['description'] = description

        try:
            updated_event = service.events().update(
                calendarId='primary',
                eventId=event_id,
                body=event,
                sendUpdates='all'
            ).execute()
            
            return {
                'id': updated_event.get('id'),
                'htmlLink': updated_event.get('htmlLink'),
                'meetingLink': updated_event.get('conferenceData', {}).get('entryPoints', [{}])[0].get('uri')
            }
            
        except Exception as e:
            raise Exception(f"Failed to update calendar event: {str(e)}")

    async def delete_calendar_event(
        self,
        event_id: str,
        user_id: int,
        use_admin_calendar: bool = False
    ) -> bool:
        """Delete a calendar event"""
        user = (
            self.db.query(User).filter(User.id == user_id).first()
            if not use_admin_calendar
            else self.db.query(User).filter(User.role == "admin").first()
        )
        
        if not user or not user.calendar_credentials:
            raise ValueError("Calendar credentials not found")

        service = self.get_calendar_service(user.calendar_credentials)
        
        try:
            service.events().delete(
                calendarId='primary',
                eventId=event_id,
                sendUpdates='all'
            ).execute()
            return True
        except Exception as e:
            raise Exception(f"Failed to delete calendar event: {str(e)}")

    async def get_user_availability(
        self,
        user_id: int,
        start_time: datetime,
        end_time: datetime,
        use_admin_calendar: bool = False
    ) -> list:
        """Get user's calendar availability"""
        user = (
            self.db.query(User).filter(User.id == user_id).first()
            if not use_admin_calendar
            else self.db.query(User).filter(User.role == "admin").first()
        )
        
        if not user or not user.calendar_credentials:
            raise ValueError("Calendar credentials not found")

        service = self.get_calendar_service(user.calendar_credentials)
        
        try:
            events = service.events().list(
                calendarId='primary',
                timeMin=start_time.isoformat() + 'Z',
                timeMax=end_time.isoformat() + 'Z',
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            return events.get('items', [])
            
        except Exception as e:
            raise Exception(f"Failed to get calendar availability: {str(e)}")