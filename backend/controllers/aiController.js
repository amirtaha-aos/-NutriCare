const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get models - using gemini-2.0-flash for both text and vision (multimodal)
const getTextModel = () => genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
const getVisionModel = () => genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Chat with AI (text only)
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    const model = getTextModel();

    const prompt = `You are NutriCare AI, an expert nutrition and health assistant. You provide:
- Detailed nutrition advice
- Calorie and macro information
- Health recommendations
- Disease prevention tips
- Exercise suggestions

Always be helpful, accurate, and remind users to consult healthcare professionals for serious concerns.
Respond in the same language the user writes in (Persian/English).

User question: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.json({
      success: true,
      response: response.text()
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Analyze food image for calories
exports.analyzeFood = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    const model = getVisionModel();

    const prompt = `Analyze this food image and provide detailed nutritional information in JSON format:
{
  "foods": ["list of identified foods"],
  "totalCalories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "fiber": number (grams),
  "sugar": number (grams),
  "sodium": number (mg),
  "healthScore": number (1-10),
  "verdict": "healthy/moderate/unhealthy",
  "tips": ["nutritional tips about this meal"],
  "alternatives": ["healthier alternatives if applicable"]
}

Be accurate with calorie estimates. If you can't identify the food clearly, provide your best estimate.`;

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    let text = response.text();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        res.json({ success: true, data });
      } else {
        res.json({ success: true, data: { rawAnalysis: text } });
      }
    } catch {
      res.json({ success: true, data: { rawAnalysis: text } });
    }
  } catch (err) {
    console.error('Food analysis error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Analyze lab test results
exports.analyzeLabTest = async (req, res) => {
  try {
    const { image, manualData } = req.body;

    const prompt = `You are a medical lab test analyzer. Analyze the following lab test results and provide:

1. **Values Analysis**: For each test value, indicate if it's:
   - Normal (within range)
   - Borderline (slightly out of range)
   - Concerning (significantly out of range)

2. **Health Risks**: Based on abnormal values, list potential health conditions the person might be at risk for or should monitor.

3. **Recommendations**:
   - Which specialists to consult
   - Lifestyle changes
   - Dietary recommendations
   - Follow-up tests needed

4. **Nutritional Advice**: Specific foods and supplements that could help improve concerning values.

IMPORTANT: Always emphasize that this is informational only and they should consult a doctor.

Respond in the same language as the input (Persian/English).
Format your response clearly with headers and bullet points.`;

    let result;

    if (image) {
      const model = getVisionModel();
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      result = await model.generateContent([
        prompt + '\n\nAnalyze this lab test image:',
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data
          }
        }
      ]);
    } else if (manualData) {
      const model = getTextModel();
      result = await model.generateContent(prompt + '\n\nLab test values:\n' + manualData);
    } else {
      return res.status(400).json({ success: false, error: 'No data provided' });
    }

    const response = await result.response;
    res.json({ success: true, analysis: response.text() });
  } catch (err) {
    console.error('Lab analysis error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Analyze drug interactions
exports.analyzeDrugs = async (req, res) => {
  try {
    const { drugs } = req.body;

    if (!drugs || drugs.length === 0) {
      return res.status(400).json({ success: false, error: 'No drugs provided' });
    }

    const model = getTextModel();
    const drugList = drugs.map(d => `- ${d.name}: ${d.dose}, ${d.frequency}`).join('\n');

    const prompt = `You are a pharmaceutical and nutrition expert. Analyze these medications:

${drugList}

Provide:

1. **Drug Interactions**:
   - Any dangerous interactions between these medications
   - Severity level (low/medium/high)
   - What to watch for

2. **Food Interactions**:
   - Foods to AVOID with these medications
   - Foods that may reduce effectiveness
   - Best times to take each medication

3. **Nutritional Deficiencies**:
   - Vitamins/minerals these drugs may deplete
   - Supplements to consider

4. **Personalized Nutrition Plan**:
   - Foods that support your health while on these medications
   - Meal timing recommendations

5. **Warnings**:
   - Side effects to monitor
   - When to contact a doctor

Respond in the same language the user writes in (Persian/English).
Be thorough but clear. Use headers and bullet points.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.json({ success: true, analysis: response.text() });
  } catch (err) {
    console.error('Drug analysis error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Generate weekly meal plan
exports.generateMealPlan = async (req, res) => {
  try {
    const {
      weight, height, age, gender, goal, activityLevel,
      allergies = [], preferences = [], conditions = []
    } = req.body;

    const model = getTextModel();

    const prompt = `You are an expert nutritionist. Create a detailed 7-day meal plan based on:

**User Profile:**
- Weight: ${weight} kg
- Height: ${height} cm
- Age: ${age}
- Gender: ${gender}
- Goal: ${goal}
- Activity Level: ${activityLevel}
- Allergies: ${allergies.join(', ') || 'None'}
- Preferences: ${preferences.join(', ') || 'None'}
- Health Conditions: ${conditions.join(', ') || 'None'}

**Requirements:**
1. Calculate daily calorie needs (TDEE) based on the profile
2. Adjust calories based on goal (+300 for gain, -500 for loss)
3. Provide macro breakdown (protein, carbs, fats)

**Create a meal plan with:**
- Breakfast, Lunch, Dinner, and 2 Snacks for each day
- Exact portions and calories for each meal
- Total daily macros
- Shopping list for the week
- Meal prep tips

Format as JSON:
{
  "dailyCalories": number,
  "macros": { "protein": number, "carbs": number, "fat": number },
  "days": [
    {
      "day": "Day 1",
      "meals": {
        "breakfast": { "name": "", "items": [], "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
        "snack1": { "name": "", "items": [], "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
        "lunch": { "name": "", "items": [], "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
        "snack2": { "name": "", "items": [], "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
        "dinner": { "name": "", "items": [], "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }
      },
      "totalCalories": 0
    }
  ],
  "shoppingList": ["item1", "item2"],
  "tips": ["tip1", "tip2"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        res.json({ success: true, data });
      } else {
        res.json({ success: true, data: { rawPlan: text } });
      }
    } catch {
      res.json({ success: true, data: { rawPlan: text } });
    }
  } catch (err) {
    console.error('Meal plan error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Calculate BMI and health analysis
exports.healthAnalysis = async (req, res) => {
  try {
    const { weight, height, age, gender, waist, hip } = req.body;

    const heightM = height / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);

    let bmiCategory;
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25) bmiCategory = 'Normal';
    else if (bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';

    const minIdeal = (18.5 * heightM * heightM).toFixed(1);
    const maxIdeal = (24.9 * heightM * heightM).toFixed(1);

    let bodyFat = null;
    if (waist && hip && gender) {
      if (gender === 'male') {
        bodyFat = (86.010 * Math.log10(waist) - 70.041 * Math.log10(height) + 36.76).toFixed(1);
      } else {
        bodyFat = (163.205 * Math.log10(waist + hip) - 97.684 * Math.log10(height) - 78.387).toFixed(1);
      }
    }

    const model = getTextModel();

    const prompt = `Based on these health metrics, provide a brief health analysis:

- BMI: ${bmi} (${bmiCategory})
- Age: ${age}
- Gender: ${gender}
- Weight: ${weight} kg
- Height: ${height} cm
- Ideal Weight Range: ${minIdeal}-${maxIdeal} kg
${bodyFat ? `- Estimated Body Fat: ${bodyFat}%` : ''}

Provide:
1. Health status assessment (2-3 sentences)
2. Main health risks based on BMI
3. 3-5 actionable recommendations
4. Ideal daily calorie intake estimate

Keep it concise and actionable. Respond in Persian if user data suggests Persian context, otherwise English.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.json({
      success: true,
      data: {
        bmi: parseFloat(bmi),
        bmiCategory,
        idealWeightRange: { min: parseFloat(minIdeal), max: parseFloat(maxIdeal) },
        bodyFat: bodyFat ? parseFloat(bodyFat) : null,
        analysis: response.text()
      }
    });
  } catch (err) {
    console.error('Health analysis error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
