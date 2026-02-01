const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  /**
   * Generate meal plan PDF
   */
  async generateMealPlanPDF(mealPlan, userProfile) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        // Collect PDF data in memory
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('NutriCare Meal Plan', { align: 'center' })
          .moveDown();

        doc
          .fontSize(16)
          .font('Helvetica')
          .text(mealPlan.title, { align: 'center' })
          .moveDown();

        // User Info & Plan Details
        doc.fontSize(12).font('Helvetica');
        doc.text(`Duration: ${mealPlan.duration} days`);
        doc.text(`Budget: $${mealPlan.budget}`);
        doc.text(`Estimated Cost: $${mealPlan.totalEstimatedCost?.toFixed(2) || 'N/A'}`);
        doc.text(`Created: ${new Date(mealPlan.createdAt).toLocaleDateString()}`);
        doc.moveDown();

        // Nutrition Summary
        if (mealPlan.nutritionSummary) {
          doc.fontSize(14).font('Helvetica-Bold').text('Nutrition Summary (Daily Average)');
          doc.fontSize(11).font('Helvetica');
          doc.text(`Calories: ${Math.round(mealPlan.nutritionSummary.avgDailyCalories)} kcal`);
          doc.text(`Protein: ${Math.round(mealPlan.nutritionSummary.avgDailyProtein)}g`);
          doc.text(`Carbs: ${Math.round(mealPlan.nutritionSummary.avgDailyCarbs)}g`);
          doc.text(`Fat: ${Math.round(mealPlan.nutritionSummary.avgDailyFat)}g`);
          doc.moveDown();
        }

        // Preferences
        if (mealPlan.preferences) {
          const prefs = [];
          if (mealPlan.preferences.vegetarian) prefs.push('Vegetarian');
          if (mealPlan.preferences.vegan) prefs.push('Vegan');
          if (mealPlan.preferences.glutenFree) prefs.push('Gluten-Free');
          if (mealPlan.preferences.dairyFree) prefs.push('Dairy-Free');
          if (mealPlan.preferences.halal) prefs.push('Halal');

          if (prefs.length > 0) {
            doc.fontSize(12).font('Helvetica-Bold').text('Dietary Preferences: ');
            doc.fontSize(11).font('Helvetica').text(prefs.join(', '));
            doc.moveDown();
          }
        }

        doc.addPage();

        // Daily Meals
        mealPlan.meals.forEach((dailyMeal, index) => {
          if (index > 0 && index % 2 === 0) {
            doc.addPage();
          }

          doc
            .fontSize(16)
            .font('Helvetica-Bold')
            .text(`Day ${dailyMeal.day}`, { underline: true })
            .moveDown(0.5);

          const mealTypes = [
            { key: 'breakfast', label: 'Breakfast' },
            { key: 'morningSnack', label: 'Morning Snack' },
            { key: 'lunch', label: 'Lunch' },
            { key: 'afternoonSnack', label: 'Afternoon Snack' },
            { key: 'dinner', label: 'Dinner' },
          ];

          mealTypes.forEach((mealType) => {
            const meal = dailyMeal[mealType.key];
            if (meal && meal.name) {
              doc.fontSize(12).font('Helvetica-Bold').text(`${mealType.label}: ${meal.name}`);
              doc.fontSize(10).font('Helvetica');

              if (meal.calories) {
                doc.text(`Calories: ${meal.calories} kcal | Protein: ${meal.protein}g | Carbs: ${meal.carbs}g | Fat: ${meal.fat}g`);
              }

              if (meal.prepTime) {
                doc.text(`Prep Time: ${meal.prepTime} minutes`);
              }

              doc.moveDown(0.3);
            }
          });

          doc.fontSize(11).font('Helvetica-Bold');
          doc.text(`Total: ${dailyMeal.totalCalories} kcal`);
          doc.moveDown();
        });

        // Shopping List
        doc.addPage();
        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('Shopping List', { align: 'center' })
          .moveDown();

        if (mealPlan.shoppingList && mealPlan.shoppingList.length > 0) {
          mealPlan.shoppingList.forEach((category) => {
            doc.fontSize(14).font('Helvetica-Bold').text(category.category.toUpperCase());
            doc.fontSize(11).font('Helvetica');

            category.items.forEach((item) => {
              const cost = item.estimatedCost ? ` - $${item.estimatedCost.toFixed(2)}` : '';
              doc.text(`  • ${item.name}: ${item.amount}${cost}`);
            });

            doc.moveDown(0.5);
          });
        }

        // Recipes Section
        doc.addPage();
        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('Recipes', { align: 'center' })
          .moveDown();

        mealPlan.meals.forEach((dailyMeal) => {
          const mealTypes = ['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner'];

          mealTypes.forEach((mealType) => {
            const meal = dailyMeal[mealType];
            if (meal && meal.name && meal.instructions) {
              doc.addPage();

              doc.fontSize(16).font('Helvetica-Bold').text(meal.name, { underline: true });
              doc.moveDown(0.5);

              if (meal.ingredients && meal.ingredients.length > 0) {
                doc.fontSize(12).font('Helvetica-Bold').text('Ingredients:');
                doc.fontSize(10).font('Helvetica');
                meal.ingredients.forEach((ing) => {
                  doc.text(`  • ${ing.name}: ${ing.amount}`);
                });
                doc.moveDown(0.5);
              }

              if (meal.instructions) {
                doc.fontSize(12).font('Helvetica-Bold').text('Instructions:');
                doc.fontSize(10).font('Helvetica').text(meal.instructions, {
                  align: 'left',
                  width: 500,
                });
                doc.moveDown();
              }
            }
          });
        });

        // Footer
        doc
          .fontSize(8)
          .font('Helvetica')
          .text('Generated by NutriCare - Your AI-Powered Nutrition Assistant', 50, doc.page.height - 50, {
            align: 'center',
          });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new PDFService();
