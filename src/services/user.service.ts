import apiClient from './api.config';
import { User, UserGoals, ApiResponse } from '../types';

class UserService {
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/users/profile', data);
    return response.data.data;
  }

  async updateGoals(goals: UserGoals): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/users/goals', goals);
    return response.data.data;
  }

  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/users/profile');
    return response.data.data;
  }

  async deleteAccount(): Promise<void> {
    await apiClient.delete('/users/account');
  }
}

export default new UserService();
