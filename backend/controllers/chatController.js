const ChatHistory = require('../models/ChatHistory');
const User = require('../models/User');
const HealthLog = require('../models/HealthLog');
const Meal = require('../models/Meal');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System prompt for nutrition assistant
const SYSTEM_PROMPT = `You are NutriCare AI, a friendly and knowledgeable nutrition assistant. You help users with:
- Nutrition advice and dietary recommendations
- Calorie and macro information for foods
- Interpreting lab test results (glucose, cholesterol, vitamins, etc.)
- Weight management guidance (loss or gain)
- Personalized meal suggestions
- Health goal tracking

Guidelines:
- Be concise but thorough
- Use simple language
- Provide specific numbers when possible (calories, grams, etc.)
- Always remind users to consult healthcare professionals for medical decisions
- Be encouraging and supportive
- If asked about the user's data, use the context provided about their health profile

Current user context will be provided with each message.`;

// Start a new chat session
exports.startChat = async (req, res) => {
  try {
    const sessionId = uuidv4();
    const chat = await ChatHistory.create({
      user: req.user.id,
      sessionId,
      messages: [],
      topic: req.body.topic || 'Nutrition Consultation'
    });

    res.status(201).json({
      success: true,
      data: {
        sessionId: chat.sessionId,
        chatId: chat._id
      }
    });
  } catch (err) {
    console.error('Start chat error:', err);
    res.status(500).json({
      success: false,
      message: 'Error starting chat'
    });
  }
};

// Send message and get AI response
exports.sendMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    // Find or create chat session
    let chat = await ChatHistory.findOne({ sessionId });

    if (!chat) {
      // Create new session if not found
      chat = await ChatHistory.create({
        user: req.user.id,
        sessionId: sessionId || uuidv4(),
        messages: [],
        topic: 'Nutrition Consultation'
      });
    }

    // Get user context for personalized responses
    const userContext = await getUserContext(req.user.id);

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message
    });

    // Generate AI response
    const aiResponse = await generateAIResponse(message, chat.messages, userContext);

    // Add AI response
    chat.messages.push({
      role: 'assistant',
      content: aiResponse
    });

    chat.updatedAt = Date.now();
    await chat.save();

    res.json({
      success: true,
      data: {
        response: aiResponse,
        messageCount: chat.messages.length
      }
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: err.message
    });
  }
};

// Get user health context for AI
async function getUserContext(userId) {
  try {
    const user = await User.findById(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const healthLog = await HealthLog.findOne({
      user: userId,
      date: { $gte: today }
    });

    const todaysMeals = await Meal.find({
      user: userId,
      date: { $gte: today }
    });

    const totalCalories = todaysMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const totalProtein = todaysMeals.reduce((sum, m) => sum + (m.protein || 0), 0);

    return {
      name: user?.firstName || 'User',
      weight: user?.healthData?.weight,
      height: user?.healthData?.height,
      targetWeight: user?.healthData?.targetWeight,
      activityLevel: user?.healthData?.activityLevel,
      goal: user?.healthData?.goal,
      waterIntake: healthLog?.waterIntake || 0,
      todayCalories: totalCalories,
      todayProtein: totalProtein,
      mealsLogged: todaysMeals.length
    };
  } catch (err) {
    console.error('Error getting user context:', err);
    return { name: 'User' };
  }
}

// Generate AI response using Google Gemini API (FREE!)
async function generateAIResponse(message, history, userContext) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.log('Gemini API key not configured, using fallback');
      return generateFallbackResponse(message);
    }

    // Build context message
    let contextMessage = `${SYSTEM_PROMPT}

User Health Profile:
- Name: ${userContext.name}
- Current Weight: ${userContext.weight || 'Not set'} kg
- Height: ${userContext.height || 'Not set'} cm
- Target Weight: ${userContext.targetWeight || 'Not set'} kg
- Activity Level: ${userContext.activityLevel || 'Not set'}
- Goal: ${userContext.goal || 'Not set'}

Today's Progress:
- Water: ${userContext.waterIntake}/8 glasses
- Calories consumed: ${userContext.todayCalories} kcal
- Protein consumed: ${userContext.todayProtein}g
- Meals logged: ${userContext.mealsLogged}

User's question: ${message}`;

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Format history for Gemini
    const chatHistory = history.slice(-10, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1024,
      },
    });

    // Send message and get response
    const result = await chat.sendMessage(contextMessage);
    const response = await result.response;

    return response.text();
  } catch (err) {
    console.error('Gemini API error:', err);
    // Fallback to simple responses if API fails
    return generateFallbackResponse(message);
  }
}

// Fallback responses when API is unavailable
function generateFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('سلام')) {
    return "Hello! I'm your NutriCare nutrition assistant. I can help you with nutrition advice, calorie information, and health guidance. What would you like to know?";
  }

  if (lowerMessage.includes('calorie') && lowerMessage.includes('chicken')) {
    return "100g of grilled chicken breast contains approximately 165 calories, 31g protein, 0g carbs, and 3.6g fat. It's an excellent lean protein source!";
  }

  if (lowerMessage.includes('weight loss') || lowerMessage.includes('lose weight') || lowerMessage.includes('کاهش وزن')) {
    return `For healthy weight loss:

1. Create a 500-750 calorie deficit daily
2. Eat adequate protein (1.6-2g per kg body weight)
3. Include plenty of fiber and vegetables
4. Drink 2-3 liters of water daily
5. Exercise regularly

Would you like a personalized meal plan?`;
  }

  if (lowerMessage.includes('protein') || lowerMessage.includes('پروتئین')) {
    return `Good protein sources:
- Chicken breast: 31g per 100g
- Greek yogurt: 17g per 170g
- Eggs: 6g per egg
- Salmon: 20g per 100g
- Lentils: 9g per 100g cooked

Aim for 0.8-1g protein per pound of body weight if you're active.`;
  }

  return `I understand your question about nutrition. Here are some general tips:

- Track your meals to understand your eating patterns
- Stay hydrated with 8 glasses of water daily
- Balance your macros: protein, carbs, and healthy fats
- Include vegetables in every meal

Feel free to ask specific questions about foods, diets, or your health goals!`;
}

// Get chat history
exports.getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const chat = await ChatHistory.findOne({ sessionId });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error getting chat history'
    });
  }
};

// Get all user chat sessions
exports.getMyChatSessions = async (req, res) => {
  try {
    const chats = await ChatHistory.find({ user: req.user.id })
      .select('sessionId topic status createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error getting chats'
    });
  }
};

// Analyze lab test PDF (new feature)
exports.analyzeLabTest = async (req, res) => {
  try {
    const { testData, testType } = req.body;

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'AI service not configured. Please add GEMINI_API_KEY to .env file.'
      });
    }

    const analysisPrompt = `You are a nutrition expert analyzing lab test results. Provide helpful dietary and lifestyle recommendations based on the results. Always remind users to consult their healthcare provider.

Analyze this lab test result and provide insights:

Test Type: ${testType || 'General Blood Panel'}
Results: ${JSON.stringify(testData, null, 2)}

Please provide:
1. Which values are normal, borderline, or concerning
2. Nutritional recommendations based on results
3. Foods to include or avoid
4. Lifestyle suggestions`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;

    res.json({
      success: true,
      data: {
        analysis: response.text()
      }
    });
  } catch (err) {
    console.error('Lab analysis error:', err);
    res.status(500).json({
      success: false,
      message: 'Error analyzing lab test'
    });
  }
};
