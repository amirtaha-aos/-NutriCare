const { openaiClient, MODELS, DEFAULT_PARAMS } = require('../config/openai');
const {
  getFoodAnalysisPrompt,
  getPartialConsumptionPrompt,
  getChatbotPrompt,
  getMealPlanPrompt,
  getWorkoutPlanPrompt,
} = require('../utils/prompts');

/**
 * OpenAI Service
 * Handles all AI-powered features: food analysis, chatbot, meal planning, workout generation
 */
class OpenAIService {
  /**
   * Analyze food image and return detailed nutritional information
   * @param {string} imageBase64 - Base64 encoded image
   * @param {Object} userContext - User's health profile and preferences
   * @returns {Promise<Object>} Food analysis result
   */
  async analyzeFoodImage(imageBase64, userContext = {}) {
    try {
      const systemPrompt = getFoodAnalysisPrompt(userContext);

      const response = await openaiClient.chat.completions.create({
        model: MODELS.VISION,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this food image and provide detailed nutritional information.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent analysis
        max_tokens: 1500,
      });

      const content = response.choices[0].message.content;

      // Try to parse JSON response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            analysis,
            rawResponse: content,
            tokensUsed: response.usage.total_tokens,
          };
        }
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
      }

      // If JSON parsing fails, return raw response
      return {
        success: false,
        error: 'Failed to parse AI response',
        rawResponse: content,
        tokensUsed: response.usage.total_tokens,
      };
    } catch (error) {
      console.error('OpenAI food analysis error:', error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  /**
   * Calculate partial consumption by comparing before/after images
   * @param {string} beforeImageBase64 - Base64 encoded before image
   * @param {string} afterImageBase64 - Base64 encoded after image
   * @param {Object} originalAnalysis - Original food analysis
   * @param {Object} userContext - User context
   * @returns {Promise<Object>} Consumption analysis
   */
  async calculatePartialConsumption(
    beforeImageBase64,
    afterImageBase64,
    originalAnalysis,
    userContext = {}
  ) {
    try {
      const systemPrompt = getPartialConsumptionPrompt(userContext);

      const response = await openaiClient.chat.completions.create({
        model: MODELS.VISION,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Original food analysis: ${JSON.stringify(originalAnalysis)}\n\nCompare these BEFORE and AFTER images to calculate consumption:`,
              },
              {
                type: 'text',
                text: 'BEFORE eating:',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${beforeImageBase64}`,
                },
              },
              {
                type: 'text',
                text: 'AFTER eating:',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${afterImageBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content;

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            analysis,
            tokensUsed: response.usage.total_tokens,
          };
        }
      } catch (parseError) {
        console.error('Failed to parse consumption analysis:', parseError);
      }

      return {
        success: false,
        error: 'Failed to parse AI response',
        rawResponse: content,
      };
    } catch (error) {
      console.error('OpenAI partial consumption error:', error);
      throw new Error(`Consumption analysis failed: ${error.message}`);
    }
  }

  /**
   * Chat with AI assistant
   * @param {string} userMessage - User's message
   * @param {Object} userContext - User's full profile
   * @param {Array} conversationHistory - Previous messages
   * @returns {Promise<Object>} AI response
   */
  async chatWithContext(userMessage, userContext, conversationHistory = []) {
    try {
      const systemPrompt = getChatbotPrompt(userContext);

      // Build messages array
      const messages = [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: userMessage,
        },
      ];

      const response = await openaiClient.chat.completions.create({
        model: MODELS.CHAT,
        messages,
        temperature: DEFAULT_PARAMS.temperature,
        max_tokens: DEFAULT_PARAMS.max_tokens,
      });

      const aiMessage = response.choices[0].message.content;

      return {
        success: true,
        message: aiMessage,
        tokensUsed: response.usage.total_tokens,
      };
    } catch (error) {
      console.error('OpenAI chat error:', error);
      throw new Error(`Chat failed: ${error.message}`);
    }
  }

  /**
   * Generate personalized meal plan
   * @param {Object} userContext - User profile
   * @param {Object} planParams - Meal plan parameters
   * @returns {Promise<Object>} Generated meal plan
   */
  async generateMealPlan(userContext, planParams) {
    try {
      const systemPrompt = getMealPlanPrompt(userContext, planParams);

      const response = await openaiClient.chat.completions.create({
        model: MODELS.CHAT,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Create a detailed ${planParams.days || 7}-day meal plan for me.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000, // Meal plans are longer
      });

      const content = response.choices[0].message.content;

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const mealPlan = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            mealPlan,
            tokensUsed: response.usage.total_tokens,
          };
        }
      } catch (parseError) {
        console.error('Failed to parse meal plan:', parseError);
      }

      return {
        success: false,
        error: 'Failed to parse meal plan',
        rawResponse: content,
      };
    } catch (error) {
      console.error('OpenAI meal plan error:', error);
      throw new Error(`Meal plan generation failed: ${error.message}`);
    }
  }

  /**
   * Generate personalized workout plan
   * @param {Object} userContext - User profile
   * @returns {Promise<Object>} Generated workout plan
   */
  async generateWorkoutPlan(userContext) {
    try {
      const systemPrompt = getWorkoutPlanPrompt(userContext);

      const response = await openaiClient.chat.completions.create({
        model: MODELS.CHAT,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: 'Create a personalized workout plan for me.',
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0].message.content;

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const workoutPlan = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            workoutPlan,
            tokensUsed: response.usage.total_tokens,
          };
        }
      } catch (parseError) {
        console.error('Failed to parse workout plan:', parseError);
      }

      return {
        success: false,
        error: 'Failed to parse workout plan',
        rawResponse: content,
      };
    } catch (error) {
      console.error('OpenAI workout plan error:', error);
      throw new Error(`Workout plan generation failed: ${error.message}`);
    }
  }
}

module.exports = new OpenAIService();
