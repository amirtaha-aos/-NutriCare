import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  Profile: undefined;
  LanguageSettings: undefined;
  Medications: undefined;
  AddMedication: { onSuccess?: () => void };
  LabTests: undefined;
  AddLabTest: { onSuccess?: () => void };
  LabTestDetail: { labTest: any };
  LabTrends: { trendsData: any };
  HealthInsights: { insights: any };
  Achievements: undefined;
  Challenges: undefined;
  Leaderboard: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Nutrition: NavigatorScreenParams<NutritionStackParamList>;
  Exercise: undefined;
  MealPlan: undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
  Gamification: undefined;
  Mood: undefined;
};

export type NutritionStackParamList = {
  NutritionHome: undefined;
  AddMeal: {
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  };
  FoodDetails: {
    foodId: string;
  };
  ScanFood: undefined;
  AIAnalysis: {
    imageUri?: string;
  };
  MealHistory: undefined;
};
