const OpenAI = require('openai');

// Initialize OpenRouter client (OpenAI compatible)
const openrouterClient = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://nutricare.app',
    'X-Title': 'NutriCare App',
  },
});

// Model configurations for OpenRouter
const OPENROUTER_MODELS = {
  // Gemini 2.0 Flash - Best balance of speed, cost, and quality
  GEMINI_FLASH: 'google/gemini-2.0-flash-001',
  // Gemini Pro for more complex tasks
  GEMINI_PRO: 'google/gemini-pro-1.5',
  // GPT-4o for vision tasks
  GPT4O: 'openai/gpt-4o',
  // GPT-4o Mini for fast/cheap tasks
  GPT4O_MINI: 'openai/gpt-4o-mini',
  // Claude 3.5 Sonnet for detailed responses
  CLAUDE_SONNET: 'anthropic/claude-3.5-sonnet',
  // Free Llama for testing
  LLAMA_FREE: 'meta-llama/llama-3.2-3b-instruct:free',
};

// Default model for chat
const DEFAULT_MODEL = OPENROUTER_MODELS.GEMINI_FLASH;

// Default parameters
const OPENROUTER_PARAMS = {
  temperature: 0.7,
  max_tokens: 1500,
};

module.exports = {
  openrouterClient,
  OPENROUTER_MODELS,
  DEFAULT_MODEL,
  OPENROUTER_PARAMS,
};
