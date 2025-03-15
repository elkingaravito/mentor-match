from typing import Dict, Optional, List
from sqlalchemy.orm import Session
from google.oauth2.credentials import Credentials
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from datetime import datetime, timedelta
import json
import os
from app.models.user import User
from app.models.availability import CalendarIntegration
from app.core.config import settings

class CalendarService:
    def __init__(self, db: Session):
        self.db = db
        self.admin_credentials = self._load_admin_credentials()

    def _load_admin_credentials(self) -> Credentials:
        """Carga las credenciales del servicio para el calendario administrativo."""
        try:
            return service_account.Credentials.from_service_account_file(
                settings.GOOGLE_SERVICE_ACCOUNT_FILE,
                scopes=['https://www.googleapis.com/auth/calendar']
            )
        except Exception as e:
            print(f"Error loading admin credentials: {e}")
            return None

    def _get_user_credentials(self, user_id: int) -> Optional[Credentials]:
        """Obtiene las credenciales de Google Calendar del usuario."""
        integration = self.db.query(CalendarIntegration).filter(
            CalendarIntegration.user_id == user_id,
            CalendarIntegration.provider == "google",
            CalendarIntegration.is_active == True
        ).first()

        if not integration or not integration.credentials:
            return None

        creds_dict = json.loads(integration.credentials)
        return Credentials(
            token=creds_dict.get('token'),
            refresh_token=creds_dict.get('refresh_token'),
            token_uri=creds_dict.get('token_uri'),
            client_id=creds_dict.get('client_id'),
            client_secret=creds_dict.get('client_secret'),
            scopes=creds_dict.get('scopes')
        )

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
    ) -> Dict:
        """
        Crea un evento en el calendario para una sesión de mentoría.
        Si use_admin_calendar es True o los usuarios no tienen integración,
        usa el calendario administrativo.
        """
        mentor = self.db.query(User).get(mentor_id)
        mentee = self.db.query(User).get(mentee_id)

        mentor_creds = None if use_admin_calendar else self._get_user_credentials(mentor_id)
        mentee_creds = None if use_admin_calendar else self._get_user_credentials(mentee_id)

        # Si algún usuario no tiene credenciales, usar el calendario administrativo
        if not mentor_creds or not mentee_creds:
            return await self._create_admin_calendar_event(
                mentor=mentor,
                mentee=mentee,
                start_time=start_time,
                end_time=end_time,
                title=title,
                description=description,
                meeting_link=meeting_link
            )

        # Crear evento en el calendario del mentor
        mentor_event = await self._create_user_calendar_event(
            credentials=mentor_creds,
            title=title,
            start_time=start_time,
            end_time=end_time,
            description=description,
            attendees=[
                {'email': mentee.email},
                {'email': mentor.email}
            ],
            meeting_link=meeting_link
        )

        return mentor_event

    async def _create_admin_calendar_event(
        self,
        mentor: User,
        mentee: User,
        start_time: datetime,
        end_time: datetime,
        title: str,
        description: str,
        meeting_link: Optional[str] = None
    ) -> Dict:
        """Crea un evento usando el calendario administrativo."""
        if not self.admin_credentials:
            raise ValueError("Admin calendar credentials not available")

        service = build('calendar', 'v3', credentials=self.admin_credentials)

        event = {
            'summary': title,
            'description': description,
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'UTC',
            },
            'attendees': [
                {'email': mentor.email},
                {'email': mentee.email}
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
                    'requestId': f"mentor-match-{datetime.now().timestamp()}",
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
                'id': event['id'],
                'htmlLink': event['htmlLink'],
                'meetingLink': event.get('conferenceData', {}).get('entryPoints', [{}])[0].get('uri'),
                'status': 'confirmed'
            }
        except HttpError as error:
            print(f"Error creating admin calendar event: {error}")
            raise

    async def _create_user_calendar_event(
        self,
        credentials: Credentials,
        title: str,
        start_time: datetime,
        end_time: datetime,
        description: str,
        attendees: List[Dict],
        meeting_link: Optional[str] = None
    ) -> Dict:
        """Crea un evento en el calendario del usuario."""
        service = build('calendar', 'v3', credentials=credentials)

        event = {
            'summary': title,
            'description': description,
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'UTC',
            },
            'attendees': attendees,
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
                    'requestId': f"mentor-match-{datetime.now().timestamp()}",
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
                'id': event['id'],
                'htmlLink': event['htmlLink'],
                'meetingLink': event.get('conferenceData', {}).get('entryPoints', [{}])[0].get('uri'),
                'status': 'confirmed'
            }
        except HttpError as error:
            print(f"Error creating user calendar event: {error}")
            raise

    async def sync_user_calendar(self, user_id: int) -> Dict:
        """Sincroniza el calendario del usuario."""
        credentials = self._get_user_credentials(user_id)
        if not credentials:
            return {"status": "error", "message": "No calendar integration found"}

        service = build('calendar', 'v3', credentials=credentials)
        
        try:
            # Obtener eventos de las próximas 2 semanas
            now = datetime.utcnow()
            time_max = now + timedelta(days=14)
            
            events_result = service.events().list(
                calendarId='primary',
                timeMin=now.isoformat() + 'Z',
                timeMax=time_max.isoformat() + 'Z',
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            # Actualizar la disponibilidad del usuario
            busy_times = []
            for event in events:
                start = event['start'].get('dateTime', event['start'].get('date'))
                end = event['end'].get('dateTime', event['end'].get('date'))
                busy_times.append({
                    'start': start,
                    'end': end
                })
            
            return {
                "status": "success",
                "events_synced": len(events),
                "busy_times": busy_times
            }
        except HttpError as error:
            print(f"Error syncing calendar: {error}")
            return {"status": "error", "message": str(error)}
