import apiClient from './api.config';
import { ApiResponse } from '../types';

export interface ChatMessage {
  _id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokensUsed?: number;
}

export interface ChatSession {
  _id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  isActive: boolean;
  lastMessageAt: Date;
  totalTokensUsed: number;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageRequest {
  sessionId?: string;
  message: string;
}

export interface SendMessageResponse {
  session: ChatSession;
  reply: string;
}

class ChatService {
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await apiClient.post<ApiResponse<SendMessageResponse>>(
      '/chat/message',
      data
    );
    return response.data.data;
  }

  async createSession(): Promise<ChatSession> {
    const response = await apiClient.post<ApiResponse<ChatSession>>('/chat/session');
    return response.data.data;
  }

  async getSessions(): Promise<ChatSession[]> {
    const response = await apiClient.get<ApiResponse<ChatSession[]>>('/chat/sessions');
    return response.data.data;
  }

  async getSession(sessionId: string): Promise<ChatSession> {
    const response = await apiClient.get<ApiResponse<ChatSession>>(
      `/chat/session/${sessionId}`
    );
    return response.data.data;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/chat/session/${sessionId}`);
  }

  async updateSessionTitle(sessionId: string, title: string): Promise<ChatSession> {
    const response = await apiClient.put<ApiResponse<ChatSession>>(
      `/chat/session/${sessionId}`,
      { title }
    );
    return response.data.data;
  }
}

export default new ChatService();
