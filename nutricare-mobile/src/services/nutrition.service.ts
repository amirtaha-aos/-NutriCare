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
    const formData = new FormData();

    if (request.imageUri) {
      formData.append('image', {
        uri: request.imageUri,
        type: 'image/jpeg',
        name: 'food.jpg',
      } as any);
    }

    if (request.description) {
      formData.append('description', request.description);
    }

    const response = await apiClient.post<ApiResponse<AIAnalysisResponse>>(
      '/ai/analyze-food',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  }

  async getRecommendations(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/ai/recommendations');
    return response.data.data;
  }
}

export default new NutritionService();
