from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.session import Session
from app.services.calendar_integration import CalendarService
from app.schemas.session import (
    SessionCreate,
    SessionUpdate,
    SessionResponse,
    SessionWithCalendar
)

router = APIRouter()

@router.post("/", response_model=SessionWithCalendar)
async def create_session(
    session: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crea una nueva sesión de mentoría y agenda en el calendario.
    Los administradores pueden crear sesiones para cualquier par mentor-mentee.
    """
    # Verificar permisos
    if not current_user.is_admin and current_user.id not in [session.mentor_id, session.mentee_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para crear esta sesión"
        )

    # Verificar que los usuarios existen
    mentor = db.query(User).filter(User.id == session.mentor_id).first()
    mentee = db.query(User).filter(User.id == session.mentee_id).first()

    if not mentor or not mentee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor o mentee no encontrado"
        )

    # Crear la sesión en la base de datos
    db_session = Session(
        mentor_id=session.mentor_id,
        mentee_id=session.mentee_id,
        start_time=session.start_time,
        end_time=session.end_time,
        title=session.title,
        description=session.description,
        status="scheduled"
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    # Crear evento en el calendario
    calendar_service = CalendarService(db)
    try:
        calendar_event = await calendar_service.create_calendar_event(
            mentor_id=session.mentor_id,
            mentee_id=session.mentee_id,
            start_time=session.start_time,
            end_time=session.end_time,
            title=session.title,
            description=session.description,
            meeting_link=session.meeting_link,
            use_admin_calendar=current_user.is_admin
        )

        # Actualizar la sesión con la información del calendario
        db_session.calendar_event_id = calendar_event.get('id')
        db_session.meeting_link = calendar_event.get('meetingLink')
        db.commit()
        db.refresh(db_session)

        return SessionWithCalendar(
            **db_session.__dict__,
            calendar_link=calendar_event.get('htmlLink')
        )

    except Exception as e:
        # Si falla la creación del evento, eliminar la sesión
        db.delete(db_session)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear el evento en el calendario: {str(e)}"
        )

@router.get("/", response_model=List[SessionResponse])
async def list_sessions(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista las sesiones del usuario actual o todas las sesiones para administradores.
    """
    query = db.query(Session)

    if not current_user.is_admin:
        query = query.filter(
            (Session.mentor_id == current_user.id) |
            (Session.mentee_id == current_user.id)
        )

    if start_date:
        query = query.filter(Session.start_time >= start_date)
    if end_date:
        query = query.filter(Session.end_time <= end_date)

    return query.all()

@router.put("/{session_id}", response_model=SessionWithCalendar)
async def update_session(
    session_id: int,
    session_update: SessionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza una sesión existente y su evento en el calendario.
    """
    db_session = db.query(Session).filter(Session.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    if not current_user.is_admin and current_user.id not in [db_session.mentor_id, db_session.mentee_id]:
        raise HTTPException(status_code=403, detail="No tienes permiso para actualizar esta sesión")

    # Actualizar la sesión
    for field, value in session_update.dict(exclude_unset=True).items():
        setattr(db_session, field, value)

    # Actualizar el evento en el calendario
    if session_update.start_time or session_update.end_time or session_update.title or session_update.description:
        calendar_service = CalendarService(db)
        try:
            calendar_event = await calendar_service.create_calendar_event(
                mentor_id=db_session.mentor_id,
                mentee_id=db_session.mentee_id,
                start_time=db_session.start_time,
                end_time=db_session.end_time,
                title=db_session.title,
                description=db_session.description,
                meeting_link=db_session.meeting_link,
                use_admin_calendar=current_user.is_admin
            )

            db_session.calendar_event_id = calendar_event.get('id')
            db_session.meeting_link = calendar_event.get('meetingLink')

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al actualizar el evento en el calendario: {str(e)}"
            )

    db.commit()
    db.refresh(db_session)

    return SessionWithCalendar(
        **db_session.__dict__,
        calendar_link=calendar_event.get('htmlLink') if 'calendar_event' in locals() else None
    )

@router.delete("/{session_id}")
async def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Elimina una sesión y su evento en el calendario.
    """
    db_session = db.query(Session).filter(Session.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    if not current_user.is_admin and current_user.id not in [db_session.mentor_id, db_session.mentee_id]:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar esta sesión")

    # Eliminar el evento del calendario
    if db_session.calendar_event_id:
        calendar_service = CalendarService(db)
        try:
            await calendar_service.delete_calendar_event(
                mentor_id=db_session.mentor_id,
                mentee_id=db_session.mentee_id,
                event_id=db_session.calendar_event_id,
                use_admin_calendar=current_user.is_admin
            )
        except Exception as e:
            print(f"Error al eliminar evento del calendario: {e}")

    # Eliminar la sesión
    db.delete(db_session)
    db.commit()

    return {"message": "Sesión eliminada correctamente"}
