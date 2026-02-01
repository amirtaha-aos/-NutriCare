/**
 * Health Metrics Calculation Service
 * Calculates BMI, BMR, and TDEE based on user profile
 */

class CalculationService {
  /**
   * Calculate Body Mass Index (BMI)
   * BMI = weight(kg) / height(m)^2
   * @param {number} weight - Weight in kilograms
   * @param {number} height - Height in centimeters
   * @returns {number} BMI value
   */
  calculateBMI(weight, height) {
    if (!weight || !height || weight <= 0 || height <= 0) {
      throw new Error('Valid weight and height required for BMI calculation');
    }

    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10; // Round to 1 decimal
  }

  /**
   * Get BMI category
   * @param {number} bmi - BMI value
   * @returns {object} Category info with label and color
   */
  getBMICategory(bmi) {
    if (bmi < 18.5) {
      return { category: 'underweight', label: 'Underweight', color: '#FFA500' };
    } else if (bmi < 25) {
      return { category: 'normal', label: 'Normal', color: '#4CAF50' };
    } else if (bmi < 30) {
      return { category: 'overweight', label: 'Overweight', color: '#FFA500' };
    } else {
      return { category: 'obese', label: 'Obese', color: '#F44336' };
    }
  }

  /**
   * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
   * Men: BMR = 10 * weight + 6.25 * height - 5 * age + 5
   * Women: BMR = 10 * weight + 6.25 * height - 5 * age - 161
   * @param {object} params - User parameters
   * @returns {number} BMR value in kcal/day
   */
  calculateBMR({ weight, height, age, gender }) {
    if (!weight || !height || !age || !gender) {
      throw new Error('Weight, height, age, and gender required for BMR calculation');
    }

    if (weight <= 0 || height <= 0 || age <= 0) {
      throw new Error('Weight, height, and age must be positive values');
    }

    let bmr = 10 * weight + 6.25 * height - 5 * age;

    if (gender === 'male') {
      bmr += 5;
    } else if (gender === 'female') {
      bmr -= 161;
    } else {
      // For 'other', use average of male and female
      const maleBMR = bmr + 5;
      const femaleBMR = bmr - 161;
      bmr = (maleBMR + femaleBMR) / 2;
    }

    return Math.round(bmr);
  }

  /**
   * Calculate Total Daily Energy Expenditure (TDEE)
   * TDEE = BMR * activity factor
   * @param {number} bmr - Basal Metabolic Rate
   * @param {string} activityLevel - Activity level
   * @returns {number} TDEE value in kcal/day
   */
  calculateTDEE(bmr, activityLevel) {
    if (!bmr || bmr <= 0) {
      throw new Error('Valid BMR required for TDEE calculation');
    }

    const activityFactors = {
      sedentary: 1.2,        // Little or no exercise
      light: 1.375,          // Light exercise 1-3 days/week
      moderate: 1.55,        // Moderate exercise 3-5 days/week
      active: 1.725,         // Heavy exercise 6-7 days/week
      very_active: 1.9,      // Very heavy exercise, physical job
    };

    const factor = activityFactors[activityLevel] || activityFactors.moderate;
    const tdee = bmr * factor;

    return Math.round(tdee);
  }

  /**
   * Calculate all health metrics at once
   * @param {object} userProfile - User profile data
   * @returns {object} All calculated metrics
   */
  calculateAllMetrics(userProfile) {
    const { weight, height, age, gender, activityLevel } = userProfile;

    const bmi = this.calculateBMI(weight, height);
    const bmiCategory = this.getBMICategory(bmi);
    const bmr = this.calculateBMR({ weight, height, age, gender });
    const tdee = this.calculateTDEE(bmr, activityLevel || 'moderate');

    return {
      bmi,
      bmiCategory,
      bmr,
      tdee,
      lastCalculated: new Date(),
    };
  }

  /**
   * Calculate ideal weight range based on height
   * @param {number} height - Height in centimeters
   * @returns {object} Min and max healthy weight
   */
  calculateIdealWeightRange(height) {
    if (!height || height <= 0) {
      throw new Error('Valid height required for ideal weight calculation');
    }

    const heightInMeters = height / 100;
    const minWeight = Math.round(18.5 * heightInMeters * heightInMeters);
    const maxWeight = Math.round(24.9 * heightInMeters * heightInMeters);

    return {
      min: minWeight,
      max: maxWeight,
    };
  }

  /**
   * Estimate calories needed for weight goal
   * @param {object} params - User parameters and goals
   * @returns {number} Recommended daily calories
   */
  calculateCaloriesForGoal({ tdee, goalType, targetWeight, currentWeight }) {
    if (!tdee || !goalType) {
      throw new Error('TDEE and goal type required');
    }

    switch (goalType) {
      case 'lose_weight':
        // Deficit of 500 kcal/day for ~0.5kg/week loss
        return Math.round(tdee - 500);

      case 'gain_muscle':
        // Surplus of 300-500 kcal/day for muscle gain
        return Math.round(tdee + 400);

      case 'maintain':
      default:
        return Math.round(tdee);
    }
  }
}

module.exports = new CalculationService();
