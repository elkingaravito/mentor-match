from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.models.export_templates import ExportTemplate
from app.models.user import User
from datetime import datetime

class TemplateService:
    def __init__(self, db: Session):
        self.db = db

    def create_template(self, user_id: int, template_data: Dict[str, Any]) -> ExportTemplate:
        """Create a new export template"""
        template = ExportTemplate(
            user_id=user_id,
            name=template_data["name"],
            description=template_data.get("description"),
            format=template_data["format"],
            filters=template_data.get("filters", {}),
            columns=template_data.get("columns", []),
            styling=template_data.get("styling", {}),
            is_public=template_data.get("is_public", False)
        )
        
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        return template

    def get_templates(self, user_id: int, include_public: bool = True) -> List[ExportTemplate]:
        """Get all templates available to a user"""
        query = self.db.query(ExportTemplate).filter(
            (ExportTemplate.user_id == user_id) |
            (ExportTemplate.is_public == True if include_public else False)
        )
        return query.all()

    def get_template(self, template_id: int, user_id: int) -> Optional[ExportTemplate]:
        """Get a specific template"""
        return self.db.query(ExportTemplate).filter(
            ExportTemplate.id == template_id,
            (ExportTemplate.user_id == user_id) | (ExportTemplate.is_public == True)
        ).first()

    def update_template(self, template_id: int, user_id: int, template_data: Dict[str, Any]) -> Optional[ExportTemplate]:
        """Update an existing template"""
        template = self.db.query(ExportTemplate).filter(
            ExportTemplate.id == template_id,
            ExportTemplate.user_id == user_id
        ).first()
        
        if template:
            for key, value in template_data.items():
                if hasattr(template, key):
                    setattr(template, key, value)
            
            template.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(template)
            
        return template

    def delete_template(self, template_id: int, user_id: int) -> bool:
        """Delete a template"""
        template = self.db.query(ExportTemplate).filter(
            ExportTemplate.id == template_id,
            ExportTemplate.user_id == user_id
        ).first()
        
        if template:
            self.db.delete(template)
            self.db.commit()
            return True
        return False

    def apply_template(self, template: ExportTemplate, data: Any) -> Any:
        """Apply template formatting to data"""
        # Apply column selection and ordering
        if template.columns:
            data = self._apply_column_selection(data, template.columns)
        
        # Apply styling if format supports it
        if template.styling and template.format in ["excel", "pdf"]:
            data = self._apply_styling(data, template.styling, template.format)
        
        return data

    def _apply_column_selection(self, data: Any, columns: List[str]) -> Any:
        """Apply column selection and ordering to data"""
        if isinstance(data, list):
            return [{col: row[col] for col in columns if col in row} for row in data]
        return data

    def _apply_styling(self, data: Any, styling: Dict[str, Any], format: str) -> Any:
        """Apply styling to data based on format"""
        # Implementation depends on export format
        if format == "excel":
            return self._apply_excel_styling(data, styling)
        elif format == "pdf":
            return self._apply_pdf_styling(data, styling)
        return data

    def _apply_excel_styling(self, data: Any, styling: Dict[str, Any]) -> Any:
        """Apply Excel-specific styling"""
        # Implementation for Excel styling
        return data

    def _apply_pdf_styling(self, data: Any, styling: Dict[str, Any]) -> Any:
        """Apply PDF-specific styling"""
        # Implementation for PDF styling
        return data