import apiClient from './api.config';
import { ApiResponse } from '../types';

export interface Exercise {
  _id: string;
  userId: string;
  type: string;
  name: string;
  duration: number;
  intensity: 'low' | 'moderate' | 'high';
  caloriesBurned: number;
  distance?: number;
  date: Date;
  notes?: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseStats {
  totalDuration: number;
  totalCalories: number;
  totalDistance: number;
  count: number;
}

export interface LogExerciseRequest {
  type: string;
  name: string;
  duration: number;
  intensity?: 'low' | 'moderate' | 'high';
  distance?: number;
  date?: string;
  notes?: string;
}

class ExerciseService {
  async logExercise(data: LogExerciseRequest): Promise<Exercise> {
    const response = await apiClient.post<ApiResponse<Exercise>>('/exercise/log', data);
    return response.data.data;
  }

  async getHistory(startDate?: string, endDate?: string): Promise<Exercise[]> {
    const response = await apiClient.get<ApiResponse<Exercise[]>>('/exercise/history', {
      params: { startDate, endDate },
    });
    return response.data.data;
  }

  async getDailyStats(date?: string): Promise<ExerciseStats> {
    const response = await apiClient.get<ApiResponse<ExerciseStats>>('/exercise/daily-stats', {
      params: { date },
    });
    return response.data.data;
  }

  async getWeeklyStats(startDate?: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>('/exercise/weekly-stats', {
      params: { startDate },
    });
    return response.data.data;
  }

  async deleteExercise(exerciseId: string): Promise<void> {
    await apiClient.delete(`/exercise/${exerciseId}`);
  }
}

export default new ExerciseService();
