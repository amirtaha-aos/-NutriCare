const OpenAI = require('openai');
const fs = require('fs').promises;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class LabAnalysisService {
  /**
   * Analyze lab test image using GPT-4 Vision
   * @param {String} imageBase64 - Base64 encoded image
   * @param {String} testType - Type of lab test
   * @param {Object} patientInfo - Patient information
   * @returns {Object} Analysis results
   */
  async analyzeLabImage(imageBase64, testType, patientInfo = {}) {
    try {
      // Prepare patient context
      const patientContext = {
        age: patientInfo.age || 'Not specified',
        gender: patientInfo.gender || 'Not specified',
        weight: patientInfo.weight || 'Not specified',
        diseases: patientInfo.diseases?.map(d => d.name).join(', ') || 'None',
        medications: patientInfo.medications?.map(m => m.name).join(', ') || 'None'
      };

      const prompt = `You are an expert medical laboratory analyst. Analyze this laboratory test result image.

**Test Type:** ${testType || 'General Lab Test'}

**Patient Information:**
- Age: ${patientContext.age} years
- Gender: ${patientContext.gender}
- Weight: ${patientContext.weight} kg
- Medical Conditions: ${patientContext.diseases}
- Current Medications: ${patientContext.medications}

**Please analyze the lab results and provide:**

1. **Extracted Values:** Read and extract all test parameters and their values from the image
2. **Normal Ranges:** Compare each value with age and gender-appropriate normal ranges
3. **Abnormalities:** Identify any values outside normal range (mark as low, normal, or high)
4. **Clinical Significance:** Explain what abnormal values might indicate
5. **Correlations:** Identify patterns or correlations between different test results
6. **Risk Assessment:** Assess potential health risks based on the results
7. **Recommendations:** Provide actionable health and lifestyle recommendations
8. **Dietary Advice:** Suggest dietary modifications based on the results
9. **Follow-up:** Recommend if patient should see a doctor or get additional tests

**IMPORTANT:** If the image is unclear or doesn't contain lab results, indicate this clearly.

Format response as JSON:
{
  "imageQuality": "clear" | "unclear" | "not_lab_results",
  "testType": "identified test type",
  "testDate": "date if visible in image",
  "extractedValues": [
    {
      "parameter": "test parameter name",
      "value": "measured value",
      "unit": "unit of measurement",
      "normalRange": "normal range for this parameter",
      "status": "low" | "normal" | "high" | "critical",
      "interpretation": "what this value means"
    }
  ],
  "abnormalities": [
    {
      "parameter": "parameter name",
      "value": "value",
      "status": "low" | "high" | "critical",
      "significance": "clinical significance",
      "possibleCauses": ["array of possible causes"]
    }
  ],
  "overallAssessment": {
    "severity": "normal" | "mild" | "moderate" | "concerning" | "critical",
    "summary": "overall summary of results",
    "keyFindings": ["array of key findings"]
  },
  "healthRisks": [
    {
      "risk": "risk name",
      "level": "low" | "medium" | "high",
      "description": "description of the risk",
      "prevention": "how to prevent or mitigate"
    }
  ],
  "dietaryRecommendations": [
    {
      "recommendation": "specific dietary advice",
      "reason": "why this is recommended",
      "foods": {
        "increase": ["foods to eat more"],
        "decrease": ["foods to avoid or reduce"],
        "avoid": ["foods to strictly avoid"]
      }
    }
  ],
  "lifestyleRecommendations": ["array of lifestyle modifications"],
  "followUp": {
    "urgency": "none" | "routine" | "soon" | "urgent" | "immediate",
    "action": "recommended action",
    "timeframe": "when to take action",
    "additionalTests": ["suggested additional tests if any"]
  },
  "medicationConsiderations": [
    "any relevant notes about current medications affecting results"
  ],
  "disclaimer": "This is an AI analysis and should not replace professional medical advice."
}`;

      // Ensure image is in correct format
      let imageData = imageBase64;
      if (!imageData.startsWith('data:image')) {
        imageData = `data:image/jpeg;base64,${imageBase64}`;
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o', // GPT-4 with vision
        messages: [
          {
            role: 'system',
            content: 'You are an expert medical laboratory analyst with deep knowledge of clinical pathology. Provide accurate, evidence-based analysis of laboratory test results. Always include disclaimers about seeking professional medical advice.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(completion.choices[0].message.content);

      return {
        ...analysis,
        analyzedAt: new Date(),
        testType: testType || analysis.testType
      };

    } catch (error) {
      console.error('Lab analysis error:', error);
      throw new Error(`Failed to analyze lab results: ${error.message}`);
    }
  }

  /**
   * Analyze trends in multiple lab tests over time
   * @param {Array} labTests - Array of lab test objects
   * @returns {Object} Trend analysis
   */
  async analyzeTrends(labTests) {
    try {
      if (!labTests || labTests.length < 2) {
        return {
          hasTrends: false,
          message: 'At least 2 test results are required for trend analysis'
        };
      }

      // Sort tests by date
      const sortedTests = labTests
        .filter(test => test.results && test.testDate)
        .sort((a, b) => new Date(a.testDate) - new Date(b.testDate));

      if (sortedTests.length < 2) {
        return {
          hasTrends: false,
          message: 'Insufficient valid test results for trend analysis'
        };
      }

      // Prepare test data for analysis
      const testSummary = sortedTests.map(test => ({
        date: test.testDate,
        type: test.testType,
        values: test.results.extractedValues || []
      }));

      const prompt = `Analyze the following laboratory test results over time to identify trends and patterns.

**Test Results Timeline:**
${JSON.stringify(testSummary, null, 2)}

**Please provide:**
1. **Trends:** Identify improving, worsening, or stable parameters
2. **Patterns:** Note any concerning patterns or correlations
3. **Progression:** Assess disease progression or improvement
4. **Risk Assessment:** Evaluate changing health risks
5. **Recommendations:** Suggest actions based on trends

Format as JSON:
{
  "trends": [
    {
      "parameter": "parameter name",
      "direction": "improving" | "worsening" | "stable" | "fluctuating",
      "change": "description of change over time",
      "significance": "clinical significance of this trend"
    }
  ],
  "patterns": ["identified patterns"],
  "overallProgression": "improving" | "stable" | "declining",
  "riskAssessment": {
    "current": "current risk level",
    "trend": "risk trend",
    "concerns": ["specific concerns"]
  },
  "recommendations": ["recommendations based on trends"],
  "summary": "overall summary of trends"
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a medical data analyst expert in laboratory medicine and disease progression analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(completion.choices[0].message.content);

      return {
        ...analysis,
        analyzedAt: new Date(),
        testCount: sortedTests.length,
        timespan: {
          from: sortedTests[0].testDate,
          to: sortedTests[sortedTests.length - 1].testDate
        }
      };

    } catch (error) {
      console.error('Trend analysis error:', error);
      throw new Error(`Failed to analyze trends: ${error.message}`);
    }
  }

  /**
   * Get personalized health insights based on lab results and health profile
   * @param {Object} labResults - Latest lab results
   * @param {Object} healthProfile - User's health profile
   * @returns {Object} Personalized insights
   */
  async getPersonalizedInsights(labResults, healthProfile) {
    try {
      const prompt = `Based on the following lab results and health profile, provide personalized health insights and actionable recommendations.

**Lab Results:**
${JSON.stringify(labResults, null, 2)}

**Health Profile:**
- Diseases: ${healthProfile.diseases?.map(d => d.name).join(', ') || 'None'}
- Medications: ${healthProfile.medications?.map(m => m.name).join(', ') || 'None'}
- Allergies: ${healthProfile.allergies?.map(a => a.allergen).join(', ') || 'None'}
- BMI: ${healthProfile.bmi || 'Not calculated'}

Provide personalized insights in JSON format:
{
  "insights": [
    {
      "category": "cardiovascular" | "metabolic" | "kidney" | "liver" | "nutrition" | "other",
      "insight": "specific insight",
      "actionable": "what user can do",
      "priority": "low" | "medium" | "high"
    }
  ],
  "nutritionFocus": {
    "increase": ["nutrients or foods to increase"],
    "decrease": ["nutrients or foods to decrease"],
    "supplements": ["suggested supplements if any"]
  },
  "exerciseRecommendations": ["specific exercise recommendations"],
  "monitoringPlan": {
    "parameters": ["what to monitor"],
    "frequency": "how often",
    "targets": ["target values or goals"]
  }
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a preventive medicine specialist providing personalized health insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(completion.choices[0].message.content);

    } catch (error) {
      console.error('Personalized insights error:', error);
      throw new Error(`Failed to generate insights: ${error.message}`);
    }
  }
}

module.exports = new LabAnalysisService();
