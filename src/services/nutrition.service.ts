import apiClient from './api.config';
import {
  FoodItem,
  MealEntry,
  DailyNutritionSummary,
  AIAnalysisRequest,
  AIAnalysisResponse,
  ApiResponse,
  PaginatedResponse,
} from '../types';

class NutritionService {
  async searchFoods(query: string, page = 1, limit = 20): Promise<PaginatedResponse<FoodItem>> {
    const response = await apiClient.get<PaginatedResponse<FoodItem>>('/foods/search', {
      params: { query, page, limit },
    });
    return response.data;
  }

  async getFoodById(foodId: string): Promise<FoodItem> {
    const response = await apiClient.get<ApiResponse<FoodItem>>(`/foods/${foodId}`);
    return response.data.data;
  }

  async getFoodByBarcode(barcode: string): Promise<FoodItem> {
    const response = await apiClient.get<ApiResponse<FoodItem>>(`/foods/barcode/${barcode}`);
    return response.data.data;
  }

  async addMealEntry(data: {
    foodId: string;
    servings: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    consumedAt: string;
  }): Promise<MealEntry> {
    const response = await apiClient.post<ApiResponse<MealEntry>>('/meals', data);
    return response.data.data;
  }

  async updateMealEntry(mealId: string, data: { servings: number }): Promise<MealEntry> {
    const response = await apiClient.put<ApiResponse<MealEntry>>(`/meals/${mealId}`, data);
    return response.data.data;
  }

  async deleteMealEntry(mealId: string): Promise<void> {
    await apiClient.delete(`/meals/${mealId}`);
  }

  async getDailyNutrition(date: string): Promise<DailyNutritionSummary> {
    const response = await apiClient.get<ApiResponse<DailyNutritionSummary>>('/meals/daily', {
      params: { date },
    });
    return response.data.data;
  }

  async getMealHistory(startDate: string, endDate: string): Promise<MealEntry[]> {
    const response = await apiClient.get<ApiResponse<MealEntry[]>>('/meals/history', {
      params: { startDate, endDate },
    });
    return response.data.data;
  }

  async analyzeFoodWithAI(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    // Convert image to base64
    const imageBase64 = request.imageUri ? await this.convertImageToBase64(request.imageUri) : undefined;

    const response = await apiClient.post<ApiResponse<AIAnalysisResponse>>(
      '/nutrition/analyze-food',
      {
        imageBase64,
        description: request.description,
      }
    );

    return response.data.data;
  }

  private async convertImageToBase64(uri: string): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }

  async getRecommendations(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/ai/recommendations');
    return response.data.data;
  }
}

export default new NutritionService();
