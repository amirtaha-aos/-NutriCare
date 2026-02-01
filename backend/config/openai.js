const OpenAI = require('openai');

// Initialize OpenAI client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Model configurations
const MODELS = {
  VISION: 'gpt-4o', // For food image analysis with vision
  CHAT: 'gpt-4o', // For chatbot
  FAST: 'gpt-4o-mini', // For quick tasks
};

// Default parameters
const DEFAULT_PARAMS = {
  temperature: 0.7,
  max_tokens: 1000,
};

module.exports = {
  openaiClient,
  MODELS,
  DEFAULT_PARAMS,
};
