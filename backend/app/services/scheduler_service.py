from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.scheduled_exports import ScheduledExport, ExportFrequency
from app.services.export_service import ExportService
from app.services.email_service import EmailService
from app.core.config import settings
import asyncio
import logging

logger = logging.getLogger(__name__)

class SchedulerService:
    def __init__(self, db: Session):
        self.db = db
        self.export_service = ExportService(db)
        self.email_service = EmailService()

    def calculate_next_run(self, frequency: ExportFrequency, current: datetime = None) -> datetime:
        """Calculate the next run time based on frequency"""
        if not current:
            current = datetime.utcnow()

        if frequency == ExportFrequency.DAILY:
            next_run = current + timedelta(days=1)
            return next_run.replace(hour=0, minute=0, second=0, microsecond=0)
        
        elif frequency == ExportFrequency.WEEKLY:
            days_ahead = 7 - current.weekday()
            next_run = current + timedelta(days=days_ahead)
            return next_run.replace(hour=0, minute=0, second=0, microsecond=0)
        
        elif frequency == ExportFrequency.MONTHLY:
            if current.month == 12:
                next_run = current.replace(year=current.year + 1, month=1, day=1)
            else:
                next_run = current.replace(month=current.month + 1, day=1)
            return next_run.replace(hour=0, minute=0, second=0, microsecond=0)
        
        elif frequency == ExportFrequency.QUARTERLY:
            current_quarter = (current.month - 1) // 3
            next_quarter_month = (current_quarter + 1) * 3 + 1
            if next_quarter_month > 12:
                next_run = current.replace(year=current.year + 1, month=1, day=1)
            else:
                next_run = current.replace(month=next_quarter_month, day=1)
            return next_run.replace(hour=0, minute=0, second=0, microsecond=0)

    async def process_scheduled_export(self, export: ScheduledExport):
        """Process a single scheduled export"""
        try:
            # Generate export based on format
            if export.format == "csv":
                export_file = self.export_service.export_to_csv(export.filters)
            elif export.format == "excel":
                export_file = self.export_service.export_to_excel(export.filters)
            else:  # PDF
                export_file = self.export_service.export_to_pdf(export.filters)

            # Send email with attachment
            await self.email_service.send_export(
                recipients=export.recipients,
                subject=f"Scheduled Analytics Export: {export.name}",
                export_file=export_file,
                format=export.format
            )

            # Update export record
            export.last_run = datetime.utcnow()
            export.next_run = self.calculate_next_run(export.frequency)
            self.db.commit()

            logger.info(f"Successfully processed scheduled export {export.id}")

        except Exception as e:
            logger.error(f"Error processing scheduled export {export.id}: {str(e)}")
            # Optionally notify admin or user about the failure

    async def run_scheduled_exports(self):
        """Run all due scheduled exports"""
        current_time = datetime.utcnow()
        
        # Get all active exports that are due
        due_exports = self.db.query(ScheduledExport).filter(
            ScheduledExport.is_active == True,
            ScheduledExport.next_run <= current_time
        ).all()

        # Process each export
        for export in due_exports:
            await self.process_scheduled_export(export)

    async def start_scheduler(self):
        """Start the scheduler loop"""
        while True:
            try:
                await self.run_scheduled_exports()
                # Wait for 5 minutes before next check
                await asyncio.sleep(300)
            except Exception as e:
                logger.error(f"Scheduler error: {str(e)}")
                await asyncio.sleep(60)  # Wait a minute before retrying