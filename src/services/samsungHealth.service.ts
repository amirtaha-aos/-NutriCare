import apiClient from './api.config';

export interface SamsungHealthData {
  date: string;
  steps?: number;
  distance?: number;
  caloriesBurned?: number;
  activeMinutes?: number;
  heartRate?: {
    min?: number;
    max?: number;
    average?: number;
  };
  sleep?: {
    duration?: number;
    startTime?: string;
    endTime?: string;
    deepSleep?: number;
    lightSleep?: number;
    remSleep?: number;
  };
  exercises?: Array<{
    type: string;
    name: string;
    startTime: string;
    endTime: string;
    duration: number;
    caloriesBurned: number;
    distance?: number;
  }>;
}

export interface SamsungHealthStats {
  dailyStats: Array<{
    _id: string;
    date: string;
    steps: number;
    distance: number;
    caloriesBurned: number;
    activeMinutes: number;
    heartRate?: {
      min?: number;
      max?: number;
      average?: number;
    };
    sleep?: {
      duration?: number;
    };
  }>;
  aggregated: {
    totalSteps: number;
    totalDistance: number;
    totalCalories: number;
    totalActiveMinutes: number;
    avgHeartRate: number;
    totalSleepMinutes: number;
    days: number;
  };
}

class SamsungHealthService {
  async syncHealthData(data: SamsungHealthData): Promise<any> {
    const response = await apiClient.post('/samsung-health/sync', data);
    return response.data.data;
  }

  async getHealthStats(startDate?: string, endDate?: string): Promise<SamsungHealthStats> {
    const response = await apiClient.get('/samsung-health/stats', {
      params: { startDate, endDate },
    });
    return response.data.data;
  }

  async getLastSyncTime(): Promise<{ lastSyncedAt: string | null }> {
    const response = await apiClient.get('/samsung-health/last-sync');
    return response.data.data;
  }

  // Mock function - in real implementation, this would use react-native-health-connect
  async checkAvailability(): Promise<boolean> {
    // Mock: Always return true for now
    return true;
  }

  // Mock function - in real implementation, this would request permissions
  async requestPermissions(): Promise<boolean> {
    // Mock: Always return true for now
    return true;
  }

  // Mock function - in real implementation, this would fetch data from Samsung Health
  async fetchDailyData(date: Date): Promise<SamsungHealthData> {
    // Mock data for demonstration
    const dateStr = date.toISOString().split('T')[0];
    return {
      date: dateStr,
      steps: Math.floor(Math.random() * 10000) + 5000,
      distance: Math.floor(Math.random() * 5000) + 2000,
      caloriesBurned: Math.floor(Math.random() * 500) + 200,
      activeMinutes: Math.floor(Math.random() * 60) + 30,
      heartRate: {
        min: 60,
        max: 140,
        average: 75,
      },
      sleep: {
        duration: 420, // 7 hours
        deepSleep: 120,
        lightSleep: 240,
        remSleep: 60,
      },
    };
  }
}

export default new SamsungHealthService();
