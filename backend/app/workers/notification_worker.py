from celery import Celery
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.services.notification_service import NotificationService
from app.models.session import Session as SessionModel
from app.models.user import User
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configurar Celery
celery = Celery('notification_worker')
celery.conf.broker_url = 'redis://localhost:6379/0'
celery.conf.result_backend = 'redis://localhost:6379/0'

@celery.task
def send_session_reminders():
    """Envía recordatorios para sesiones próximas."""
    db = SessionLocal()
    try:
        # Obtener sesiones que comenzarán en los próximos 30 minutos
        now = datetime.utcnow()
        reminder_window = now + timedelta(minutes=30)
        
        upcoming_sessions = db.query(SessionModel).filter(
            SessionModel.start_time.between(now, reminder_window),
            SessionModel.status == "scheduled"
        ).all()

        notification_service = NotificationService(db)
        
        for session in upcoming_sessions:
            try:
                # Verificar preferencias de notificación de los usuarios
                for user_id in [session.mentor_id, session.mentee_id]:
                    user = db.query(User).get(user_id)
                    if user and user.notification_settings.get('session_reminders', True):
                        await notification_service.create_session_reminder(
                            session=session,
                            minutes_before=30
                        )
                logger.info(f"Sent reminders for session {session.id}")
            except Exception as e:
                logger.error(f"Error sending reminder for session {session.id}: {e}")

    except Exception as e:
        logger.error(f"Error in send_session_reminders: {e}")
    finally:
        db.close()

@celery.task
def clean_old_notifications():
    """Limpia notificaciones antiguas."""
    db = SessionLocal()
    try:
        # Eliminar notificaciones leídas más antiguas de 30 días
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        db.query(Notification).filter(
            Notification.read == True,
            Notification.created_at < thirty_days_ago
        ).delete()
        
        # Eliminar notificaciones no leídas más antiguas de 90 días
        ninety_days_ago = datetime.utcnow() - timedelta(days=90)
        db.query(Notification).filter(
            Notification.created_at < ninety_days_ago
        ).delete()
        
        db.commit()
        logger.info("Cleaned old notifications")
    except Exception as e:
        logger.error(f"Error in clean_old_notifications: {e}")
        db.rollback()
    finally:
        db.close()

# Programar tareas periódicas
@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Enviar recordatorios cada 5 minutos
    sender.add_periodic_task(300.0, send_session_reminders.s())
    
    # Limpiar notificaciones antiguas diariamente
    sender.add_periodic_task(
        86400.0,  # 24 horas en segundos
        clean_old_notifications.s()
    )
