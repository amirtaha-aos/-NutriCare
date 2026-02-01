const { openrouterClient, OPENROUTER_MODELS, DEFAULT_MODEL, OPENROUTER_PARAMS } = require('../config/openrouter');
const { getChatbotPrompt, getFoodAnalysisPrompt } = require('../utils/prompts');

/**
 * OpenRouter Service
 * Handles AI features using OpenRouter API with Gemini and other models
 */
class OpenRouterService {
  /**
   * Chat with AI assistant using Gemini
   * @param {string} userMessage - User's message (text or transcribed from voice)
   * @param {Object} userContext - User's full profile
   * @param {Array} conversationHistory - Previous messages
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} AI response
   */
  async chat(userMessage, userContext, conversationHistory = [], options = {}) {
    try {
      const model = options.model || DEFAULT_MODEL;
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

      const response = await openrouterClient.chat.completions.create({
        model,
        messages,
        temperature: options.temperature || OPENROUTER_PARAMS.temperature,
        max_tokens: options.max_tokens || OPENROUTER_PARAMS.max_tokens,
      });

      const aiMessage = response.choices[0].message.content;

      return {
        success: true,
        message: aiMessage,
        tokensUsed: response.usage?.total_tokens || 0,
        model: model,
      };
    } catch (error) {
      console.error('OpenRouter chat error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Analyze food image using vision model
   * @param {string} imageBase64 - Base64 encoded image
   * @param {Object} userContext - User's health profile
   * @returns {Promise<Object>} Food analysis result
   */
  async analyzeFoodImage(imageBase64, userContext = {}) {
    try {
      const systemPrompt = getFoodAnalysisPrompt(userContext);

      const response = await openrouterClient.chat.completions.create({
        model: OPENROUTER_MODELS.GPT4O, // Vision model
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
                text: 'Analyze this food image and provide detailed nutritional information in JSON format.',
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
        temperature: 0.3,
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
            tokensUsed: response.usage?.total_tokens || 0,
          };
        }
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
      }

      return {
        success: false,
        error: 'Failed to parse AI response',
        rawResponse: content,
      };
    } catch (error) {
      console.error('OpenRouter food analysis error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Voice chat - process voice input and return text + audio response
   * @param {string} transcribedText - Transcribed voice message
   * @param {Object} userContext - User profile
   * @param {Array} conversationHistory - Previous messages
   * @returns {Promise<Object>} AI response with text
   */
  async voiceChat(transcribedText, userContext, conversationHistory = []) {
    try {
      // Use Gemini for natural conversational responses
      const result = await this.chat(
        transcribedText,
        userContext,
        conversationHistory,
        {
          model: OPENROUTER_MODELS.GEMINI_FLASH,
          temperature: 0.8, // Slightly higher for more natural responses
          max_tokens: 500, // Shorter responses for voice
        }
      );

      if (!result.success) {
        return result;
      }

      return {
        success: true,
        message: result.message,
        tokensUsed: result.tokensUsed,
        isVoice: true,
      };
    } catch (error) {
      console.error('OpenRouter voice chat error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Quick nutrition question
   * @param {string} question - User's question
   * @param {Object} userContext - User context
   * @returns {Promise<Object>} Quick response
   */
  async quickNutritionQuery(question, userContext) {
    try {
      const response = await openrouterClient.chat.completions.create({
        model: OPENROUTER_MODELS.GEMINI_FLASH,
        messages: [
          {
            role: 'system',
            content: `You are a helpful nutrition assistant. Provide brief, accurate answers about food and nutrition. Consider the user's profile if relevant: ${JSON.stringify(userContext)}`,
          },
          {
            role: 'user',
            content: question,
          },
        ],
        temperature: 0.5,
        max_tokens: 300,
      });

      return {
        success: true,
        message: response.choices[0].message.content,
        tokensUsed: response.usage?.total_tokens || 0,
      };
    } catch (error) {
      console.error('OpenRouter quick query error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get available models
   */
  getAvailableModels() {
    return OPENROUTER_MODELS;
  }
}

module.exports = new OpenRouterService();
