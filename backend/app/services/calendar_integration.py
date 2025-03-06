from typing import Dict, Any, Optional, List
import json
from datetime import datetime, timedelta
import os
from sqlalchemy.orm import Session

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app.models import User, Mentor, Session, Mentee
from app.core.config import settings

# Definir los scopes necesarios para Google Calendar
SCOPES = ['https://www.googleapis.com/auth/calendar']

class CalendarIntegrationService:
    """
    Servicio para integración con Google Calendar.
    """
    
    @staticmethod
    def get_auth_url() -> str:
        """
        Genera la URL para autorizar la aplicación a acceder al calendario del usuario.
        """
        # Crear el flujo de OAuth2
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
            scopes=SCOPES
        )
        
        # Establecer la URI de redirección
        flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
        
        # Generar la URL de autorización
        auth_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        
        return auth_url
    
    @staticmethod
    def exchange_code_for_tokens(code: str) -> Dict[str, Any]:
        """
        Intercambia el código de autorización por tokens de acceso y refresco.
        """
        # Crear el flujo de OAuth2
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
            scopes=SCOPES
        )
        
        # Establecer la URI de redirección
        flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
        
        # Intercambiar el código por tokens
        flow.fetch_token(code=code)
        
        # Obtener las credenciales
        credentials = flow.credentials
        
        # Convertir las credenciales a un diccionario
        return {
            "token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri,
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
            "scopes": credentials.scopes,
            "expiry": credentials.expiry.isoformat() if credentials.expiry else None
        }
    
    @staticmethod
    def save_calendar_integration(user_id: int, tokens: Dict[str, Any], db: Session) -> None:
        """
        Guarda los tokens de integración con el calendario para un usuario.
        """
        mentor = db.query(Mentor).filter(Mentor.user_id == user_id).first()
        if mentor:
            mentor.calendar_integration = json.dumps(tokens)
            db.commit()
    
    @staticmethod
    def _get_credentials(user_id: int, db: Session) -> Optional[Credentials]:
        """
        Obtiene las credenciales de Google Calendar para un usuario.
        """
        mentor = db.query(Mentor).filter(Mentor.user_id == user_id).first()
        if not mentor or not mentor.calendar_integration:
            return None
        
        # Cargar los tokens desde la base de datos
        tokens = json.loads(mentor.calendar_integration)
        
        # Crear las credenciales
        credentials = Credentials(
            token=tokens.get("token"),
            refresh_token=tokens.get("refresh_token"),
            token_uri=tokens.get("token_uri"),
            client_id=tokens.get("client_id"),
            client_secret=tokens.get("client_secret"),
            scopes=tokens.get("scopes")
        )
        
        # Si las credenciales han expirado, actualizarlas
        if tokens.get("expiry"):
            expiry = datetime.fromisoformat(tokens.get("expiry"))
            if expiry < datetime.utcnow():
                # Actualizar las credenciales
                credentials.refresh(None)
                
                # Actualizar los tokens en la base de datos
                tokens = {
                    "token": credentials.token,
                    "refresh_token": credentials.refresh_token,
                    "token_uri": credentials.token_uri,
                    "client_id": credentials.client_id,
                    "client_secret": credentials.client_secret,
                    "scopes": credentials.scopes,
                    "expiry": credentials.expiry.isoformat() if credentials.expiry else None
                }
                mentor.calendar_integration = json.dumps(tokens)
                db.commit()
        
        return credentials
    
    @staticmethod
    def get_calendar_events(user_id: int, start_date: datetime, end_date: datetime, db: Session) -> List[Dict[str, Any]]:
        """
        Obtiene los eventos del calendario del usuario en un rango de fechas.
        """
        credentials = CalendarIntegrationService._get_credentials(user_id, db)
        if not credentials:
            return []
        
        try:
            # Crear el servicio de Google Calendar
            service = build('calendar', 'v3', credentials=credentials)
            
            # Obtener los eventos
            events_result = service.events().list(
                calendarId='primary',
                timeMin=start_date.isoformat() + 'Z',
                timeMax=end_date.isoformat() + 'Z',
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            return events_result.get('items', [])
        
        except HttpError as error:
            print(f"Error al obtener eventos: {error}")
            return []
    
    @staticmethod
    def create_calendar_event(session_id: int, db: Session) -> Optional[str]:
        """
        Crea un evento en el calendario para una sesión de mentoría.
        Retorna el ID del evento creado.
        """
        session = db.query(Session).filter(Session.id == session_id).first()
        if not session:
            return None
        
        # Obtener información del mentor y mentil
        mentor = db.query(Mentor).filter(Mentor.user_id == session.mentor_id).first()
        mentee = db.query(User).filter(User.id == session.mentee_id).first()
        mentee_profile = db.query(Mentee).filter(Mentee.user_id == session.mentee_id).first()
        
        if not mentor or not mentee:
            return None
        
        credentials = CalendarIntegrationService._get_credentials(session.mentor_id, db)
        if not credentials:
            return None
        
        try:
            # Crear el servicio de Google Calendar
            service = build('calendar', 'v3', credentials=credentials)
            
            # Crear el evento
            event = {
                'summary': f'Mentoría con {mentee.name}',
                'description': f'Sesión de mentoría con {mentee.name}' + 
                               (f'\n\nObjetivos del mentil: {mentee_profile.goals}' if mentee_profile and mentee_profile.goals else ''),
                'start': {
                    'dateTime': session.start_time.isoformat(),
                    'timeZone': 'America/Mexico_City',
                },
                'end': {
                    'dateTime': session.end_time.isoformat(),
                    'timeZone': 'America/Mexico_City',
                },
                'attendees': [
                    {'email': mentee.email},
                ],
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},
                        {'method': 'popup', 'minutes': 30},
                    ],
                },
                'conferenceData': {
                    'createRequest': {
                        'requestId': f'mentor-match-{session_id}',
                        'conferenceSolutionKey': {
                            'type': 'hangoutsMeet'
                        }
                    }
                }
            }
            
            # Insertar el evento
            event = service.events().insert(
                calendarId='primary',
                body=event,
                conferenceDataVersion=1,
                sendUpdates='all'
            ).execute()
            
            # Actualizar la sesión con el ID del evento y el enlace de la reunión
            session.calendar_event_id = event.get('id')
            
            # Obtener el enlace de Google Meet
            for entry_point in event.get('conferenceData', {}).get('entryPoints', []):
                if entry_point.get('entryPointType') == 'video':
                    session.meeting_link = entry_point.get('uri')
                    break
            
            db.commit()
            
            return event.get('id')
        
        except HttpError as error:
            print(f"Error al crear evento: {error}")
            return None
    
    @staticmethod
    def update_calendar_event(session_id: int, db: Session) -> bool:
        """
        Actualiza un evento en el calendario para una sesión de mentoría.
        """
        session = db.query(Session).filter(Session.id == session_id).first()
        if not session or not session.calendar_event_id:
            return False
        
        credentials = CalendarIntegrationService._get_credentials(session.mentor_id, db)
        if not credentials:
            return False
        
        try:
            # Crear el servicio de Google Calendar
            service = build('calendar', 'v3', credentials=credentials)
            
            # Obtener el evento actual
            event = service.events().get(
                calendarId='primary',
                eventId=session.calendar_event_id
            ).execute()
            
            # Actualizar los campos necesarios
            event['start'] = {
                'dateTime': session.start_time.isoformat(),
                'timeZone': 'America/Mexico_City',
            }
            event['end'] = {
                'dateTime': session.end_time.isoformat(),
                'timeZone': 'America/Mexico_City',
            }
            
            # Si la sesión está cancelada, actualizar el estado del evento
            if session.status == "cancelled":
                event['status'] = 'cancelled'
            
            # Actualizar el evento
            updated_event = service.events().update(
                calendarId='primary',
                eventId=session.calendar_event_id,
                body=event,
                sendUpdates='all'
            ).execute()
            
            return True
        
        except HttpError as error:
            print(f"Error al actualizar evento: {error}")
            return False
    
    @staticmethod
    def delete_calendar_event(session_id: int, db: Session) -> bool:
        """
        Elimina un evento del calendario para una sesión de mentoría.
        """
        session = db.query(Session).filter(Session.id == session_id).first()
        if not session or not session.calendar_event_id:
            return False
        
        credentials = CalendarIntegrationService._get_credentials(session.mentor_id, db)
        if not credentials:
            return False
        
        try:
            # Crear el servicio de Google Calendar
            service = build('calendar', 'v3', credentials=credentials)
            
            # Eliminar el evento
            service.events().delete(
                calendarId='primary',
                eventId=session.calendar_event_id,
                sendUpdates='all'
            ).execute()
            
            # Actualizar la sesión para eliminar el ID del evento
            session.calendar_event_id = None
            session.meeting_link = None
            db.commit()
            
            return True
        
        except HttpError as error:
            print(f"Error al eliminar evento: {error}")
            return False
