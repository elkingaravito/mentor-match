from app.services.preview_service import PreviewService

# ... (existing code)

@router.post("/templates/preview")
async def preview_template(
    template_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate preview for a template"""
    preview_service = PreviewService()
    preview = preview_service.generate_preview(template_data)
    return preview