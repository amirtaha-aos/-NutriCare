export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  description?: string;
  servingSize: string;
  servingUnit: string;
  nutrition: NutritionInfo;
  barcode?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface MealEntry {
  id: string;
  userId: string;
  foodId: string;
  food: FoodItem;
  servings: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  consumedAt: string;
  createdAt: string;
  nutrition: NutritionInfo;
}

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  meals: MealEntry[];
  goalProgress: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface AIAnalysisRequest {
  imageUri?: string;
  description?: string;
}

export interface AIAnalysisResponse {
  foodItems: Array<{
    name: string;
    estimatedAmount: string;
    nutrition: NutritionInfo;
    confidence: number;
  }>;
  totalNutrition: NutritionInfo;
  recommendations?: string[];
}
