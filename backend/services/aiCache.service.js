const NodeCache = require('node-cache');
const crypto = require('crypto');

/**
 * AI Cache Service
 * Caches AI responses to reduce costs and improve performance
 */
class AICacheService {
  constructor() {
    // Cache with 24-hour TTL
    this.cache = new NodeCache({
      stdTTL: 86400, // 24 hours in seconds
      checkperiod: 3600, // Check for expired keys every hour
      useClones: false, // For better performance
    });

    // Stats tracking
    this.stats = {
      hits: 0,
      misses: 0,
      saves: 0,
    };
  }

  /**
   * Generate cache key from input data
   * @param {string} type - Cache type (food, chat, meal-plan, workout)
   * @param {*} data - Data to hash
   * @returns {string} Cache key
   */
  generateKey(type, data) {
    const dataString = JSON.stringify(data);
    const hash = crypto.createHash('md5').update(dataString).digest('hex');
    return `${type}:${hash}`;
  }

  /**
   * Get cached response
   * @param {string} type - Cache type
   * @param {*} data - Data to lookup
   * @returns {Object|null} Cached response or null
   */
  get(type, data) {
    const key = this.generateKey(type, data);
    const cached = this.cache.get(key);

    if (cached) {
      this.stats.hits++;
      console.log(`[Cache HIT] ${type} - Total hits: ${this.stats.hits}`);
      return cached;
    }

    this.stats.misses++;
    console.log(`[Cache MISS] ${type} - Total misses: ${this.stats.misses}`);
    return null;
  }

  /**
   * Save response to cache
   * @param {string} type - Cache type
   * @param {*} data - Data used as key
   * @param {*} response - Response to cache
   * @param {number} ttl - Optional custom TTL in seconds
   */
  set(type, data, response, ttl = null) {
    const key = this.generateKey(type, data);

    if (ttl) {
      this.cache.set(key, response, ttl);
    } else {
      this.cache.set(key, response);
    }

    this.stats.saves++;
    console.log(`[Cache SAVE] ${type} - Total saves: ${this.stats.saves}`);
  }

  /**
   * Delete specific cache entry
   * @param {string} type - Cache type
   * @param {*} data - Data to delete
   */
  delete(type, data) {
    const key = this.generateKey(type, data);
    this.cache.del(key);
    console.log(`[Cache DELETE] ${key}`);
  }

  /**
   * Clear all cache entries of a specific type
   * @param {string} type - Cache type to clear
   */
  clearType(type) {
    const keys = this.cache.keys();
    const typeKeys = keys.filter((key) => key.startsWith(`${type}:`));

    typeKeys.forEach((key) => this.cache.del(key));
    console.log(`[Cache CLEAR] Cleared ${typeKeys.length} entries for type: ${type}`);
  }

  /**
   * Clear all cache
   */
  clearAll() {
    this.cache.flushAll();
    console.log('[Cache CLEAR] All cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    const keys = this.cache.keys();
    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(2)
        : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      cachedEntries: keys.length,
      cacheKeys: keys,
    };
  }

  /**
   * Food analysis cache wrapper
   * @param {string} imageHash - Hash of the image
   * @param {Object} userContext - User context (allergens, conditions)
   * @returns {Object|null} Cached food analysis
   */
  getFoodAnalysis(imageHash, userContext) {
    // Include user allergens and conditions in cache key
    const cacheData = {
      imageHash,
      allergies: userContext.allergies || [],
      healthConditions: userContext.healthConditions || [],
      language: userContext.language,
    };

    return this.get('food', cacheData);
  }

  /**
   * Save food analysis to cache
   * @param {string} imageHash - Hash of the image
   * @param {Object} userContext - User context
   * @param {Object} analysis - Analysis result
   */
  setFoodAnalysis(imageHash, userContext, analysis) {
    const cacheData = {
      imageHash,
      allergies: userContext.allergies || [],
      healthConditions: userContext.healthConditions || [],
      language: userContext.language,
    };

    this.set('food', cacheData, analysis);
  }

  /**
   * Meal plan cache wrapper
   * @param {Object} userContext - User profile
   * @param {Object} planParams - Meal plan parameters
   * @returns {Object|null} Cached meal plan
   */
  getMealPlan(userContext, planParams) {
    const cacheData = {
      userId: userContext.userId,
      days: planParams.days,
      budget: planParams.budget,
      dietaryPreferences: planParams.dietaryPreferences || [],
      tdee: userContext.tdee,
      goalType: userContext.goals?.goalType,
    };

    // Meal plans have shorter TTL (7 days)
    return this.get('meal-plan', cacheData);
  }

  /**
   * Save meal plan to cache
   * @param {Object} userContext - User profile
   * @param {Object} planParams - Meal plan parameters
   * @param {Object} mealPlan - Generated meal plan
   */
  setMealPlan(userContext, planParams, mealPlan) {
    const cacheData = {
      userId: userContext.userId,
      days: planParams.days,
      budget: planParams.budget,
      dietaryPreferences: planParams.dietaryPreferences || [],
      tdee: userContext.tdee,
      goalType: userContext.goals?.goalType,
    };

    // Cache for 7 days
    this.set('meal-plan', cacheData, mealPlan, 604800);
  }

  /**
   * Workout plan cache wrapper
   * @param {Object} userContext - User profile
   * @returns {Object|null} Cached workout plan
   */
  getWorkoutPlan(userContext) {
    const cacheData = {
      userId: userContext.userId,
      gender: userContext.gender,
      bmi: userContext.bmi,
      activityLevel: userContext.activityLevel,
      goalType: userContext.goals?.goalType,
    };

    return this.get('workout', cacheData);
  }

  /**
   * Save workout plan to cache
   * @param {Object} userContext - User profile
   * @param {Object} workoutPlan - Generated workout plan
   */
  setWorkoutPlan(userContext, workoutPlan) {
    const cacheData = {
      userId: userContext.userId,
      gender: userContext.gender,
      bmi: userContext.bmi,
      activityLevel: userContext.activityLevel,
      goalType: userContext.goals?.goalType,
    };

    // Cache for 14 days
    this.set('workout', cacheData, workoutPlan, 1209600);
  }
}

module.exports = new AICacheService();
