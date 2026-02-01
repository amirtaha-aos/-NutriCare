const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class DrugInteractionService {
  /**
   * Check for drug interactions among user's medications
   * @param {Array} medications - Array of medication objects
   * @param {Array} diseases - Array of disease objects
   * @param {Object} user - User object with age, weight, etc.
   * @returns {Object} Analysis results with interactions and recommendations
   */
  async checkInteractions(medications, diseases = [], user = {}) {
    try {
      if (!medications || medications.length === 0) {
        return {
          hasInteractions: false,
          interactions: [],
          recommendations: ['No medications to analyze'],
          summary: 'No active medications found'
        };
      }

      // Prepare medication list
      const medicationList = medications.map(med =>
        `${med.name} (${med.dosage}, ${med.frequency})`
      ).join(', ');

      // Prepare disease list
      const diseaseList = diseases.length > 0
        ? diseases.map(d => `${d.name} (${d.severity})`).join(', ')
        : 'None reported';

      // Prepare user info
      const userInfo = {
        age: user.age || 'Not specified',
        weight: user.weight || 'Not specified',
        gender: user.gender || 'Not specified'
      };

      const prompt = `You are a clinical pharmacist AI assistant. Analyze the following medications for potential drug interactions, contraindications, and safety concerns.

**Patient Information:**
- Age: ${userInfo.age} years
- Weight: ${userInfo.weight} kg
- Gender: ${userInfo.gender}
- Medical Conditions: ${diseaseList}

**Current Medications:**
${medicationList}

**Please provide a comprehensive analysis including:**

1. **Drug Interactions:** Identify any potential interactions between these medications (minor, moderate, or severe). Explain the mechanism and clinical significance.

2. **Disease-Drug Interactions:** Check if any medication is contraindicated or requires caution given the patient's medical conditions.

3. **Dosage Concerns:** Evaluate if dosages are appropriate given patient's age, weight, and conditions.

4. **Side Effects:** List common and serious side effects to watch for.

5. **Recommendations:** Provide actionable recommendations for the patient and suggest if they should consult their doctor.

6. **Food/Nutrient Interactions:** Mention any foods or nutrients that should be avoided or taken with these medications.

Please format your response in JSON with the following structure:
{
  "hasInteractions": boolean,
  "severity": "none" | "minor" | "moderate" | "severe",
  "interactions": [
    {
      "type": "drug-drug" | "drug-disease" | "drug-food",
      "severity": "minor" | "moderate" | "severe",
      "drugs": ["drug1", "drug2"],
      "description": "detailed description",
      "clinicalSignificance": "what this means for the patient"
    }
  ],
  "dosageConcerns": [
    {
      "medication": "medication name",
      "concern": "description of concern",
      "recommendation": "suggested action"
    }
  ],
  "sideEffects": {
    "common": ["list of common side effects"],
    "serious": ["list of serious side effects to watch"]
  },
  "foodInteractions": [
    {
      "medication": "medication name",
      "foods": ["foods to avoid or take with"],
      "instruction": "specific instruction"
    }
  ],
  "recommendations": [
    "list of actionable recommendations"
  ],
  "urgency": "none" | "monitor" | "consult_doctor" | "urgent",
  "summary": "brief summary of key findings"
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert clinical pharmacist AI. Provide accurate, evidence-based medication interaction analysis. Always prioritize patient safety.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent medical advice
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(completion.choices[0].message.content);

      return {
        ...analysis,
        analyzedAt: new Date(),
        medicationCount: medications.length
      };

    } catch (error) {
      console.error('Drug interaction check error:', error);
      throw new Error(`Failed to analyze drug interactions: ${error.message}`);
    }
  }

  /**
   * Get detailed information about a specific medication
   * @param {String} medicationName - Name of the medication
   * @returns {Object} Detailed medication information
   */
  async getMedicationInfo(medicationName) {
    try {
      const prompt = `Provide comprehensive information about the medication: ${medicationName}

Please include:
1. Generic and brand names
2. Drug class and mechanism of action
3. Common uses and indications
4. Standard dosing information
5. Common and serious side effects
6. Important contraindications
7. Drug interactions (common ones)
8. Special precautions
9. Food/alcohol interactions

Format as JSON:
{
  "genericName": "string",
  "brandNames": ["array of brand names"],
  "drugClass": "string",
  "mechanism": "string",
  "indications": ["array of uses"],
  "dosing": "string",
  "commonSideEffects": ["array"],
  "seriousSideEffects": ["array"],
  "contraindications": ["array"],
  "interactions": ["array of common interactions"],
  "precautions": ["array"],
  "foodInteractions": "string"
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a clinical pharmacology expert. Provide accurate, evidence-based medication information.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(completion.choices[0].message.content);

    } catch (error) {
      console.error('Get medication info error:', error);
      throw new Error(`Failed to get medication information: ${error.message}`);
    }
  }
}

module.exports = new DrugInteractionService();
