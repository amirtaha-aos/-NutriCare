import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DailyNutritionSummary, MealEntry } from '../../types';
import { nutritionService } from '../../services';
import { format } from 'date-fns';

interface NutritionState {
  dailySummary: DailyNutritionSummary | null;
  selectedDate: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: NutritionState = {
  dailySummary: null,
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  isLoading: false,
  error: null,
};

export const fetchDailyNutrition = createAsyncThunk(
  'nutrition/fetchDailyNutrition',
  async (date: string, { rejectWithValue }) => {
    try {
      const summary = await nutritionService.getDailyNutrition(date);
      return summary;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch nutrition data');
    }
  }
);

export const addMeal = createAsyncThunk(
  'nutrition/addMeal',
  async (
    data: {
      foodId: string;
      servings: number;
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      consumedAt: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const meal = await nutritionService.addMealEntry(data);
      return meal;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add meal');
    }
  }
);

export const deleteMeal = createAsyncThunk(
  'nutrition/deleteMeal',
  async (mealId: string, { rejectWithValue }) => {
    try {
      await nutritionService.deleteMealEntry(mealId);
      return mealId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete meal');
    }
  }
);

const nutritionSlice = createSlice({
  name: 'nutrition',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyNutrition.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDailyNutrition.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailySummary = action.payload;
      })
      .addCase(fetchDailyNutrition.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addMeal.fulfilled, (state, action) => {
        if (state.dailySummary) {
          state.dailySummary.meals.push(action.payload);
          state.dailySummary.totalCalories += action.payload.nutrition.calories;
          state.dailySummary.totalProtein += action.payload.nutrition.protein;
          state.dailySummary.totalCarbs += action.payload.nutrition.carbs;
          state.dailySummary.totalFats += action.payload.nutrition.fats;
        }
      })
      .addCase(deleteMeal.fulfilled, (state, action) => {
        if (state.dailySummary) {
          const deletedMeal = state.dailySummary.meals.find((m) => m.id === action.payload);
          if (deletedMeal) {
            state.dailySummary.meals = state.dailySummary.meals.filter(
              (m) => m.id !== action.payload
            );
            state.dailySummary.totalCalories -= deletedMeal.nutrition.calories;
            state.dailySummary.totalProtein -= deletedMeal.nutrition.protein;
            state.dailySummary.totalCarbs -= deletedMeal.nutrition.carbs;
            state.dailySummary.totalFats -= deletedMeal.nutrition.fats;
          }
        }
      });
  },
});

export const { setSelectedDate, clearError } = nutritionSlice.actions;
export default nutritionSlice.reducer;
