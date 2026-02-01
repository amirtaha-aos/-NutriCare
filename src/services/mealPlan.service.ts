import apiClient from './api.config';
import { MealPlan, GenerateMealPlanParams } from '../types/mealPlan.types';

const BASE_URL = '/meal-plan';

export const mealPlanService = {
  /**
   * Generate AI meal plan
   */
  async generateMealPlan(params: GenerateMealPlanParams): Promise<MealPlan> {
    const response = await apiClient.post(`${BASE_URL}/generate`, params);
    return response.data.data;
  },

  /**
   * Get all meal plans
   */
  async getMealPlans(): Promise<MealPlan[]> {
    const response = await apiClient.get(BASE_URL);
    return response.data.data;
  },

  /**
   * Get meal plan by ID
   */
  async getMealPlanById(id: string): Promise<MealPlan> {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  /**
   * Activate meal plan
   */
  async activateMealPlan(id: string): Promise<MealPlan> {
    const response = await apiClient.post(`${BASE_URL}/${id}/activate`);
    return response.data.data;
  },

  /**
   * Get shopping list for meal plan
   */
  async getShoppingList(id: string): Promise<{
    shoppingList: MealPlan['shoppingList'];
    totalEstimatedCost: number;
  }> {
    const response = await apiClient.get(`${BASE_URL}/${id}/shopping-list`);
    return response.data.data;
  },

  /**
   * Export meal plan as PDF
   */
  async exportMealPlanPDF(id: string): Promise<Blob> {
    const response = await apiClient.get(`${BASE_URL}/${id}/export-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Delete meal plan
   */
  async deleteMealPlan(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};
