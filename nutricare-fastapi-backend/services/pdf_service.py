from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_RIGHT, TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime
from typing import Dict
import os


class PDFService:
    def __init__(self):
        # Register Persian font (you need to add a Persian TTF font file)
        # For now, using default fonts
        self.styles = getSampleStyleSheet()
        self.setup_styles()

    def setup_styles(self):
        """Setup custom styles for Persian PDF"""
        # Title style
        self.title_style = ParagraphStyle(
            'TitleStyle',
            parent=self.styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            alignment=TA_CENTER,
            spaceAfter=30,
        )

        # Heading style
        self.heading_style = ParagraphStyle(
            'HeadingStyle',
            parent=self.styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            alignment=TA_RIGHT,
            spaceAfter=12,
        )

        # Normal text style
        self.normal_style = ParagraphStyle(
            'NormalStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            alignment=TA_RIGHT,
            spaceAfter=6,
        )

    async def generate_meal_plan_pdf(
        self, meal_plan_data: Dict, output_path: str
    ) -> str:
        """
        Generate PDF for meal plan
        """
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm,
        )

        story = []

        # Title
        title = f"NutriCare - Meal Plan"
        story.append(Paragraph(title, self.title_style))
        story.append(Spacer(1, 12))

        # User Info
        user_info = meal_plan_data.get('user_info', {})
        info_text = f"""
        <b>User Information:</b><br/>
        Age: {user_info.get('age', 'N/A')}<br/>
        Gender: {user_info.get('gender', 'N/A')}<br/>
        Weight: {user_info.get('weight', 'N/A')} kg<br/>
        Height: {user_info.get('height', 'N/A')} cm<br/>
        Goal: {user_info.get('goal', 'N/A')}<br/>
        Daily Calorie Target: {user_info.get('daily_calorie_target', 'N/A')} kcal
        """
        story.append(Paragraph(info_text, self.normal_style))
        story.append(Spacer(1, 20))

        # Duration
        duration = meal_plan_data.get('duration_days', 7)
        story.append(Paragraph(f"<b>Duration:</b> {duration} days", self.heading_style))
        story.append(Spacer(1, 12))

        # Daily Plans
        daily_plans = meal_plan_data.get('daily_plans', [])
        for day_plan in daily_plans:
            day_num = day_plan.get('day', 1)
            date = day_plan.get('date', '')

            story.append(Paragraph(f"<b>Day {day_num}</b> - {date}", self.heading_style))
            story.append(Spacer(1, 6))

            meals = day_plan.get('meals', {})

            # Breakfast
            breakfast = meals.get('breakfast', {})
            if breakfast:
                story.append(Paragraph("<b>Breakfast:</b>", self.normal_style))
                story.append(Paragraph(f"- {breakfast.get('name', 'N/A')}", self.normal_style))
                story.append(Paragraph(
                    f"  Calories: {breakfast.get('calories', 0)} | "
                    f"Protein: {breakfast.get('protein', 0)}g | "
                    f"Carbs: {breakfast.get('carbs', 0)}g | "
                    f"Fats: {breakfast.get('fats', 0)}g",
                    self.normal_style
                ))
                story.append(Spacer(1, 6))

            # Lunch
            lunch = meals.get('lunch', {})
            if lunch:
                story.append(Paragraph("<b>Lunch:</b>", self.normal_style))
                story.append(Paragraph(f"- {lunch.get('name', 'N/A')}", self.normal_style))
                story.append(Paragraph(
                    f"  Calories: {lunch.get('calories', 0)} | "
                    f"Protein: {lunch.get('protein', 0)}g | "
                    f"Carbs: {lunch.get('carbs', 0)}g | "
                    f"Fats: {lunch.get('fats', 0)}g",
                    self.normal_style
                ))
                story.append(Spacer(1, 6))

            # Dinner
            dinner = meals.get('dinner', {})
            if dinner:
                story.append(Paragraph("<b>Dinner:</b>", self.normal_style))
                story.append(Paragraph(f"- {dinner.get('name', 'N/A')}", self.normal_style))
                story.append(Paragraph(
                    f"  Calories: {dinner.get('calories', 0)} | "
                    f"Protein: {dinner.get('protein', 0)}g | "
                    f"Carbs: {dinner.get('carbs', 0)}g | "
                    f"Fats: {dinner.get('fats', 0)}g",
                    self.normal_style
                ))
                story.append(Spacer(1, 6))

            # Snacks
            snacks = meals.get('snacks', [])
            if snacks:
                story.append(Paragraph("<b>Snacks:</b>", self.normal_style))
                for snack in snacks:
                    story.append(Paragraph(f"- {snack.get('name', 'N/A')}", self.normal_style))
                story.append(Spacer(1, 6))

            story.append(Spacer(1, 20))

        # Shopping List
        story.append(PageBreak())
        story.append(Paragraph("<b>Shopping List</b>", self.heading_style))
        story.append(Spacer(1, 12))

        shopping_list = meal_plan_data.get('shopping_list', {})
        for category, items in shopping_list.items():
            if category != 'total_cost' and items:
                story.append(Paragraph(f"<b>{category.capitalize()}:</b>", self.normal_style))
                for item in items:
                    story.append(Paragraph(f"  - {item}", self.normal_style))
                story.append(Spacer(1, 6))

        total_cost = shopping_list.get('total_cost', 0)
        story.append(Spacer(1, 12))
        story.append(Paragraph(f"<b>Total Cost:</b> {total_cost} Toman", self.heading_style))

        # Nutritional Summary
        story.append(Spacer(1, 20))
        story.append(Paragraph("<b>Nutritional Summary</b>", self.heading_style))
        summary = meal_plan_data.get('nutritional_summary', {})
        summary_text = f"""
        <b>Daily Averages:</b><br/>
        Calories: {summary.get('daily_avg_calories', 0)} kcal<br/>
        Protein: {summary.get('daily_avg_protein', 0)}g<br/>
        Carbs: {summary.get('daily_avg_carbs', 0)}g<br/>
        Fats: {summary.get('daily_avg_fats', 0)}g
        """
        story.append(Paragraph(summary_text, self.normal_style))

        # Recommendations
        recommendations = meal_plan_data.get('recommendations', [])
        if recommendations:
            story.append(Spacer(1, 20))
            story.append(Paragraph("<b>Recommendations:</b>", self.heading_style))
            for rec in recommendations:
                story.append(Paragraph(f"- {rec}", self.normal_style))

        # Footer
        story.append(Spacer(1, 30))
        footer_text = f"Generated by NutriCare on {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        story.append(Paragraph(footer_text, self.normal_style))

        # Build PDF
        doc.build(story)
        return output_path


# Singleton instance
pdf_service = PDFService()
