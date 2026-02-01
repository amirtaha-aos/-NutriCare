export interface Recipe {
  name: string;
  ingredients: {
    name: string;
    amount: string;
    category?: string;
  }[];
  instructions: string;
  prepTime: number; // minutes
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyMeal {
  day: number;
  breakfast?: Recipe;
  morningSnack?: Recipe;
  lunch?: Recipe;
  afternoonSnack?: Recipe;
  dinner?: Recipe;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface ShoppingListItem {
  name: string;
  amount: string;
  estimatedCost?: number;
}

export interface ShoppingListCategory {
  category: string;
  items: ShoppingListItem[];
}

export interface MealPlan {
  _id: string;
  userId: string;
  title: string;
  duration: number; // days
  budget: number;
  location: string;
  preferences: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    dairyFree?: boolean;
    halal?: boolean;
  };
  meals: DailyMeal[];
  shoppingList: ShoppingListCategory[];
  totalEstimatedCost: number;
  nutritionSummary: {
    avgDailyCalories: number;
    avgDailyProtein: number;
    avgDailyCarbs: number;
    avgDailyFat: number;
  };
  isActive: boolean;
  createdAt: string;
  activatedAt?: string;
}

export interface GenerateMealPlanParams {
  title?: string;
  duration?: number;
  budget: number;
  location?: string;
  preferences?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    dairyFree?: boolean;
    halal?: boolean;
  };
}

export interface MealPlanState {
  mealPlans: MealPlan[];
  activeMealPlan: MealPlan | null;
  currentMealPlan: MealPlan | null; // For viewing details
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
}
