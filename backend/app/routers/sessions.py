from typing import Any, List, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.core.database import get_db
from app.core.auth import get_current_user, get_current_mentor, get_current_mentee
from app.models import Session as SessionModel, Mentor, Mentee, User, SessionFeedback
from app.services.calendar_integration import CalendarIntegrationService

router = APIRouter()

@router.get("/", response_model=List[schemas.Session])
def read_sessions(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve sessions for the current user.
    """
    try:
        if current_user.role == "mentor":
            sessions = db.query(SessionModel).filter(SessionModel.mentor_id == current_user.id).offset(skip).limit(limit).all()
        elif current_user.role == "mentee":
            sessions = db.query(SessionModel).filter(SessionModel.mentee_id == current_user.id).offset(skip).limit(limit).all()
        else:  # admin
            sessions = db.query(SessionModel).offset(skip).limit(limit).all()
        
        return sessions
    except Exception as e:
        print(f"Error retrieving sessions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving sessions"
        )

@router.post("/", response_model=schemas.Session)
def create_session(
    session_in: schemas.SessionCreate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create new session.
    """
    try:
        # Verificar que el usuario actual es el mentor o el mentil de la sesión
        if current_user.role == "mentor" and session_in.mentor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only create sessions where you are the mentor",
            )
        
        if current_user.role == "mentee" and session_in.mentee_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only create sessions where you are the mentee",
            )
        
        # Verificar que el mentor existe
        mentor = db.query(Mentor).filter(Mentor.user_id == session_in.mentor_id).first()
        if not mentor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mentor not found",
            )
        
        # Verificar que el mentil existe
        mentee = db.query(Mentee).filter(Mentee.user_id == session_in.mentee_id).first()
        if not mentee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mentee not found",
            )
        
        # Crear la sesión
        session = SessionModel(
            mentor_id=session_in.mentor_id,
            mentee_id=session_in.mentee_id,
            start_time=session_in.start_time,
            end_time=session_in.end_time,
            status="scheduled",
            topic=session_in.topic if hasattr(session_in, 'topic') else None
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        
        # Crear evento en el calendario si el mentor tiene integración
        try:
            mentor_user = db.query(User).filter(User.id == session_in.mentor_id).first()
            if mentor_user and mentor.calendar_integration:
                calendar_event_id = CalendarIntegrationService.create_calendar_event(session.id, db)
                if calendar_event_id:
                    # La sesión ya se actualizó en create_calendar_event
                    db.refresh(session)
        except Exception as e:
            print(f"Error creating calendar event: {e}")
            # No fallar si hay un error con el calendario
        
        return session
    except HTTPException:
        # Re-lanzar excepciones HTTP
        raise
    except Exception as e:
        print(f"Error creating session: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating session"
        )

@router.get("/{session_id}", response_model=schemas.Session)
def read_session(
    session_id: int, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a specific session by id.
    """
    try:
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        
        # Verificar que el usuario actual es el mentor, el mentil o un admin
        if (current_user.role == "mentor" and session.mentor_id != current_user.id) or \
           (current_user.role == "mentee" and session.mentee_id != current_user.id) and \
           current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this session",
            )
        
        return session
    except HTTPException:
        # Re-lanzar excepciones HTTP
        raise
    except Exception as e:
        print(f"Error retrieving session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving session"
        )

@router.put("/{session_id}", response_model=schemas.Session)
def update_session(
    session_id: int, session_in: schemas.SessionUpdate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a session.
    """
    try:
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        
        # Verificar que el usuario actual es el mentor, el mentil o un admin
        if (current_user.role == "mentor" and session.mentor_id != current_user.id) or \
           (current_user.role == "mentee" and session.mentee_id != current_user.id) and \
           current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this session",
            )
        
        update_data = session_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(session, field, value)
        
        db.commit()
        db.refresh(session)
        
        # Actualizar evento en el calendario si es necesario
        try:
            mentor = db.query(Mentor).filter(Mentor.user_id == session.mentor_id).first()
            if mentor and mentor.calendar_integration and session.calendar_event_id:
                if session.status != "cancelled":
                    CalendarIntegrationService.update_calendar_event(session.id, db)
                else:
                    CalendarIntegrationService.delete_calendar_event(session.id, db)
        except Exception as e:
            print(f"Error updating calendar event: {e}")
            # No fallar si hay un error con el calendario
        
        return session
    except HTTPException:
        # Re-lanzar excepciones HTTP
        raise
    except Exception as e:
        print(f"Error updating session: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating session"
        )

@router.delete("/{session_id}", response_model=schemas.Session)
def delete_session(
    session_id: int, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Delete a session.
    """
    try:
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        
        # Verificar que el usuario actual es el mentor, el mentil o un admin
        if (current_user.role == "mentor" and session.mentor_id != current_user.id) or \
           (current_user.role == "mentee" and session.mentee_id != current_user.id) and \
           current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this session",
            )
        
        # Eliminar evento del calendario si existe
        try:
            if session.calendar_event_id:
                CalendarIntegrationService.delete_calendar_event(session.id, db)
        except Exception as e:
            print(f"Error deleting calendar event: {e}")
            # No fallar si hay un error con el calendario
        
        db.delete(session)
        db.commit()
        return session
    except HTTPException:
        # Re-lanzar excepciones HTTP
        raise
    except Exception as e:
        print(f"Error deleting session: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting session"
        )

@router.post("/{session_id}/feedback", response_model=schemas.SessionFeedback)
def create_session_feedback(
    session_id: int, feedback_in: schemas.SessionFeedbackCreate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create feedback for a session.
    """
    try:
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        
        # Verificar que el usuario es el mentor o el mentil de la sesión
        if current_user.id != session.mentor_id and current_user.id != session.mentee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to provide feedback for this session",
            )
        
        # Verificar que la sesión está completada
        if session.status != "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot provide feedback for a session that is not completed",
            )
        
        # Verificar que el usuario no ha proporcionado feedback anteriormente
        existing_feedback = db.query(SessionFeedback).filter(
            SessionFeedback.session_id == session_id,
            SessionFeedback.created_by == current_user.id
        ).first()
        
        if existing_feedback:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User has already provided feedback for this session",
            )
        
        feedback = SessionFeedback(
            session_id=session_id,
            rating=feedback_in.rating,
            comments=feedback_in.comments,
            created_by=current_user.id
        )
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return feedback
    except HTTPException:
        # Re-lanzar excepciones HTTP
        raise
    except Exception as e:
        print(f"Error creating feedback: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating feedback"
        )

@router.get("/{session_id}/feedback", response_model=List[schemas.SessionFeedback])
def read_session_feedback(
    session_id: int, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get feedback for a session.
    """
    try:
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )
        
        # Verificar que el usuario es el mentor, el mentil o un admin
        if (current_user.role == "mentor" and session.mentor_id != current_user.id) or \
           (current_user.role == "mentee" and session.mentee_id != current_user.id) and \
           current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this session's feedback",
            )
        
        feedback = db.query(SessionFeedback).filter(SessionFeedback.session_id == session_id).all()
        return feedback
    except HTTPException:
        # Re-lanzar excepciones HTTP
        raise
    except Exception as e:
        print(f"Error retrieving feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving feedback"
        )
