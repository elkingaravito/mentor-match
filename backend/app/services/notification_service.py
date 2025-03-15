from typing import List, Optional, Dict
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.models.user import User
from app.models.session import Session
from app.models.notification import Notification
from app.core.config import settings
import firebase_admin
from firebase_admin import messaging
from firebase_admin import credentials
import json

class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.email_config = ConnectionConfig(
            MAIL_USERNAME=settings.MAIL_USERNAME,
            MAIL_PASSWORD=settings.MAIL_PASSWORD,
            MAIL_FROM=settings.MAIL_FROM,
            MAIL_PORT=settings.MAIL_PORT,
            MAIL_SERVER=settings.MAIL_SERVER,
            MAIL_TLS=True,
            MAIL_SSL=False,
            USE_CREDENTIALS=True
        )
        self.fastmail = FastMail(self.email_config)
        
        # Inicializar Firebase Admin para notificaciones push
        if not firebase_admin._apps:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)

    async def create_notification(
        self,
        user_id: int,
        title: str,
        message: str,
        type: str,
        related_id: Optional[int] = None,
        send_email: bool = False,
        send_push: bool = False
    ) -> Notification:
        """Crea una nueva notificación y la envía por los canales especificados."""
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            related_id=related_id,
            created_at=datetime.utcnow(),
            read=False
        )
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)

        # Enviar por email si está especificado
        if send_email:
            await self._send_email_notification(notification)

        # Enviar push notification si está especificado
        if send_push:
            await self._send_push_notification(notification)

        return notification

    async def create_session_notifications(self, session: Session) -> List[Notification]:
        """Crea notificaciones relacionadas con una sesión."""
        notifications = []
        
        # Notificar al mentor y al mentee
        for user_id in [session.mentor_id, session.mentee_id]:
            notification = await self.create_notification(
                user_id=user_id,
                title="Nueva sesión programada",
                message=f"Tienes una nueva sesión programada para {session.start_time}",
                type="session_scheduled",
                related_id=session.id,
                send_email=True,
                send_push=True
            )
            notifications.append(notification)

        return notifications

    async def create_session_reminder(self, session: Session, minutes_before: int = 30) -> List[Notification]:
        """Crea recordatorios para una sesión próxima."""
        notifications = []
        reminder_time = session.start_time - timedelta(minutes=minutes_before)

        for user_id in [session.mentor_id, session.mentee_id]:
            notification = await self.create_notification(
                user_id=user_id,
                title="Recordatorio de sesión",
                message=f"Tu sesión comenzará en {minutes_before} minutos",
                type="session_reminder",
                related_id=session.id,
                send_email=True,
                send_push=True
            )
            notifications.append(notification)

        return notifications

    async def _send_email_notification(self, notification: Notification):
        """Envía una notificación por email."""
        user = self.db.query(User).filter(User.id == notification.user_id).first()
        if not user or not user.email:
            return

        message = MessageSchema(
            subject=notification.title,
            recipients=[user.email],
            body=notification.message,
            subtype="html"
        )

        await self.fastmail.send_message(message)

    async def _send_push_notification(self, notification: Notification):
        """Envía una notificación push usando Firebase."""
        user = self.db.query(User).filter(User.id == notification.user_id).first()
        if not user or not user.fcm_token:
            return

        message = messaging.Message(
            notification=messaging.Notification(
                title=notification.title,
                body=notification.message,
            ),
            data={
                "type": notification.type,
                "related_id": str(notification.related_id) if notification.related_id else "",
            },
            token=user.fcm_token,
        )

        try:
            messaging.send(message)
        except Exception as e:
            print(f"Error sending push notification: {e}")

    async def mark_as_read(self, notification_id: int, user_id: int) -> Notification:
        """Marca una notificación como leída."""
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()

        if notification:
            notification.read = True
            notification.read_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(notification)

        return notification

    async def get_user_notifications(
        self,
        user_id: int,
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Notification]:
        """Obtiene las notificaciones de un usuario."""
        query = self.db.query(Notification).filter(Notification.user_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.read == False)
        
        return query.order_by(Notification.created_at.desc()).limit(limit).all()

    async def delete_notification(self, notification_id: int, user_id: int) -> bool:
        """Elimina una notificación."""
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()

        if notification:
            self.db.delete(notification)
            self.db.commit()
            return True
        return False
