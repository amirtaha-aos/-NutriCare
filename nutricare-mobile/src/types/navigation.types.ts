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

export type MainTabParamList = {
  Home: undefined;
  Nutrition: NavigatorScreenParams<NutritionStackParamList>;
  Profile: undefined;
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
