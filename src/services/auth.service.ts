import EncryptedStorage from 'react-native-encrypted-storage';
import apiClient from './api.config';
import { LoginCredentials, RegisterData, User, AuthTokens, ApiResponse } from '../types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    console.log('auth.service: Attempting login with:', credentials.email);
    try {
      const response = await apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
        '/auth/login',
        credentials
      );
      console.log('auth.service: Login successful');

      const { user, tokens } = response.data.data;

      await this.saveTokens(tokens);

      return { user, tokens };
    } catch (error: any) {
      console.error('auth.service: Login error:', error.message);
      console.error('auth.service: Error details:', error.response?.data || error);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      '/auth/register',
      data
    );

    const { user, tokens } = response.data.data;

    await this.saveTokens(tokens);

    return { user, tokens };
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  }

  async saveTokens(tokens: AuthTokens): Promise<void> {
    await EncryptedStorage.setItem('accessToken', tokens.accessToken);
    await EncryptedStorage.setItem('refreshToken', tokens.refreshToken);
  }

  async clearTokens(): Promise<void> {
    await EncryptedStorage.removeItem('accessToken');
    await EncryptedStorage.removeItem('refreshToken');
  }

  async getAccessToken(): Promise<string | null> {
    return await EncryptedStorage.getItem('accessToken');
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }
}

export default new AuthService();
