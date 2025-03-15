from fastapi import APIRouter, Depends, HTTPException, Query
from app.services.export_service import ExportService
from typing import Optional

# ... (existing imports and endpoints)

@router.get("/export")
async def export_analytics(
    format: str = Query(..., regex="^(csv|excel|pdf)$"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    industry: Optional[str] = None,
    mentoring_style: Optional[str] = None,
    goal_category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export analytics data in specified format"""
    export_service = ExportService(db)
    
    filters = {
        "start_date": start_date,
        "end_date": end_date,
        "industry": industry,
        "mentoring_style": mentoring_style,
        "goal_category": goal_category
    }
    
    try:
        if format == "csv":
            return export_service.export_to_csv(filters)
        elif format == "excel":
            return export_service.export_to_excel(filters)
        elif format == "pdf":
            return export_service.export_to_pdf(filters)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to export data: {str(e)}"
        )