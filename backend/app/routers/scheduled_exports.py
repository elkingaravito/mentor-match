from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.scheduled_exports import ScheduledExport, ExportFrequency, ExportFormat
from app.services.scheduler_service import SchedulerService
from pydantic import BaseModel, EmailStr
from datetime import datetime

router = APIRouter()

class ScheduledExportCreate(BaseModel):
    name: str
    description: Optional[str] = None
    frequency: ExportFrequency
    format: ExportFormat
    filters: dict
    recipients: List[EmailStr]

class ScheduledExportUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[ExportFrequency] = None
    format: Optional[ExportFormat] = None
    filters: Optional[dict] = None
    recipients: Optional[List[EmailStr]] = None
    is_active: Optional[bool] = None

@router.post("/scheduled-exports", response_model=dict)
async def create_scheduled_export(
    export_data: ScheduledExportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new scheduled export"""
    scheduler = SchedulerService(db)
    
    new_export = ScheduledExport(
        user_id=current_user.id,
        name=export_data.name,
        description=export_data.description,
        frequency=export_data.frequency,
        format=export_data.format,
        filters=export_data.filters,
        recipients=export_data.recipients,
        next_run=scheduler.calculate_next_run(export_data.frequency)
    )
    
    db.add(new_export)
    db.commit()
    db.refresh(new_export)
    
    return {"message": "Scheduled export created successfully", "id": new_export.id}

@router.get("/scheduled-exports", response_model=List[dict])
async def list_scheduled_exports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all scheduled exports for the current user"""
    exports = db.query(ScheduledExport).filter(
        ScheduledExport.user_id == current_user.id
    ).all()
    
    return [
        {
            "id": export.id,
            "name": export.name,
            "description": export.description,
            "frequency": export.frequency,
            "format": export.format,
            "filters": export.filters,
            "recipients": export.recipients,
            "last_run": export.last_run,
            "next_run": export.next_run,
            "is_active": export.is_active
        }
        for export in exports
    ]

@router.put("/scheduled-exports/{export_id}")
async def update_scheduled_export(
    export_id: int,
    export_data: ScheduledExportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a scheduled export"""
    export = db.query(ScheduledExport).filter(
        ScheduledExport.id == export_id,
        ScheduledExport.user_id == current_user.id
    ).first()
    
    if not export:
        raise HTTPException(status_code=404, detail="Scheduled export not found")
    
    # Update fields if provided
    for field, value in export_data.dict(exclude_unset=True).items():
        setattr(export, field, value)
    
    if export_data.frequency:
        scheduler = SchedulerService(db)
        export.next_run = scheduler.calculate_next_run(export_data.frequency)
    
    db.commit()
    return {"message": "Scheduled export updated successfully"}

@router.delete("/scheduled-exports/{export_id}")
async def delete_scheduled_export(
    export_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a scheduled export"""
    export = db.query(ScheduledExport).filter(
        ScheduledExport.id == export_id,
        ScheduledExport.user_id == current_user.id
    ).first()
    
    if not export:
        raise HTTPException(status_code=404, detail="Scheduled export not found")
    
    db.delete(export)
    db.commit()
    return {"message": "Scheduled export deleted successfully"}