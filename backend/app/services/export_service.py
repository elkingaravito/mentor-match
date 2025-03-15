from typing import List, Dict, Any
import pandas as pd
from io import BytesIO
from fastapi.responses import StreamingResponse
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import (
    MatchScore, User, Industry, UserIndustryExperience,
    MentoringPreference, MentorshipGoal, Session as MentorSession
)

class ExportService:
    def __init__(self, db: Session):
        self.db = db

    def _prepare_matching_data(self, filters: Dict[str, Any] = None) -> pd.DataFrame:
        """Prepare matching analytics data for export"""
        query = self.db.query(
            MatchScore,
            User.name.label('mentor_name'),
            Industry.name.label('industry'),
            MentoringPreference.preferred_style,
            MentorshipGoal.category.label('goal_category')
        ).join(
            User, MatchScore.mentor_id == User.id
        ).join(
            UserIndustryExperience, User.id == UserIndustryExperience.user_id
        ).join(
            Industry, UserIndustryExperience.industry_id == Industry.id
        ).join(
            MentoringPreference, User.id == MentoringPreference.user_id
        ).join(
            MentorshipGoal, MatchScore.mentee_id == MentorshipGoal.user_id
        )

        # Apply filters
        if filters:
            if filters.get('start_date'):
                query = query.filter(MatchScore.created_at >= filters['start_date'])
            if filters.get('end_date'):
                query = query.filter(MatchScore.created_at <= filters['end_date'])
            if filters.get('industry'):
                query = query.filter(Industry.name == filters['industry'])
            if filters.get('mentoring_style'):
                query = query.filter(MentoringPreference.preferred_style == filters['mentoring_style'])
            if filters.get('goal_category'):
                query = query.filter(MentorshipGoal.category == filters['goal_category'])

        results = query.all()
        
        # Convert to DataFrame
        data = []
        for result in results:
            data.append({
                'Match Date': result.MatchScore.created_at,
                'Mentor': result.mentor_name,
                'Industry': result.industry,
                'Mentoring Style': result.preferred_style,
                'Goal Category': result.goal_category,
                'Match Score': result.MatchScore.score,
                'Expertise Match': result.MatchScore.expertise_match,
                'Availability Match': result.MatchScore.availability_match
            })
        
        return pd.DataFrame(data)

    def export_to_csv(self, filters: Dict[str, Any] = None) -> StreamingResponse:
        """Export analytics data to CSV"""
        df = self._prepare_matching_data(filters)
        
        # Create CSV buffer
        output = BytesIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        # Generate filename with timestamp
        filename = f"mentor_match_analytics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    def export_to_excel(self, filters: Dict[str, Any] = None) -> StreamingResponse:
        """Export analytics data to Excel"""
        df = self._prepare_matching_data(filters)
        
        # Create Excel buffer
        output = BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, sheet_name='Matching Analytics', index=False)
            
            # Get workbook and worksheet objects
            workbook = writer.book
            worksheet = writer.sheets['Matching Analytics']
            
            # Add formatting
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#4B0082',
                'font_color': 'white'
            })
            
            # Apply header format
            for col_num, value in enumerate(df.columns.values):
                worksheet.write(0, col_num, value, header_format)
                worksheet.set_column(col_num, col_num, 15)  # Set column width
        
        output.seek(0)
        
        filename = f"mentor_match_analytics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    def export_to_pdf(self, filters: Dict[str, Any] = None) -> StreamingResponse:
        """Export analytics data to PDF with charts"""
        import matplotlib.pyplot as plt
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        
        df = self._prepare_matching_data(filters)
        
        # Create PDF buffer
        output = BytesIO()
        
        # Create the PDF document
        doc = SimpleDocTemplate(output, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Add title
        elements.append(Paragraph("Mentor Match Analytics Report", styles['Title']))
        elements.append(Spacer(1, 20))
        
        # Add summary statistics
        summary_data = [
            ["Total Matches", len(df)],
            ["Average Match Score", f"{df['Match Score'].mean():.2f}"],
            ["Top Industry", df['Industry'].mode().iloc[0] if not df.empty else "N/A"]
        ]
        
        summary_table = Table(summary_data)
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 20))
        
        # Create and add charts
        plt.figure(figsize=(8, 4))
        df['Match Score'].hist()
        plt.title('Distribution of Match Scores')
        
        chart_buffer = BytesIO()
        plt.savefig(chart_buffer, format='png')
        chart_buffer.seek(0)
        
        # Add chart to PDF
        elements.append(Paragraph("Match Score Distribution", styles['Heading2']))
        elements.append(Image(chart_buffer))
        
        # Build PDF
        doc.build(elements)
        output.seek(0)
        
        filename = f"mentor_match_analytics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )