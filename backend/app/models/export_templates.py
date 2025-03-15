from sqlalchemy import Column, Integer, String, JSON, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.models.base import Base
from app.models.scheduled_exports import ExportFormat
from datetime import datetime

class ExportTemplate(Base):
    __tablename__ = "export_templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    description = Column(String)
    format = Column(Enum(ExportFormat), nullable=False)
    filters = Column(JSON)  # Store filters configuration
    columns = Column(JSON)  # Store selected columns and their order
    styling = Column(JSON)  # Store styling preferences (colors, fonts, etc.)
    is_public = Column(Boolean, default=False)  # Whether template is shared with other users
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="export_templates")