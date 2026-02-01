import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { mealPlanService } from '../../services/mealPlan.service';
import { MealPlan, MealPlanState, GenerateMealPlanParams } from '../../types/mealPlan.types';

const initialState: MealPlanState = {
  mealPlans: [],
  activeMealPlan: null,
  currentMealPlan: null,
  isLoading: false,
  isGenerating: false,
  error: null,
};

/**
 * Generate new meal plan with AI
 */
export const generateMealPlan = createAsyncThunk(
  'mealPlan/generate',
  async (params: GenerateMealPlanParams, { rejectWithValue }) => {
    try {
      const mealPlan = await mealPlanService.generateMealPlan(params);
      return mealPlan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate meal plan');
    }
  }
);

/**
 * Fetch all meal plans
 */
export const fetchMealPlans = createAsyncThunk(
  'mealPlan/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const mealPlans = await mealPlanService.getMealPlans();
      return mealPlans;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch meal plans');
    }
  }
);

/**
 * Fetch meal plan by ID
 */
export const fetchMealPlanById = createAsyncThunk(
  'mealPlan/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const mealPlan = await mealPlanService.getMealPlanById(id);
      return mealPlan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch meal plan');
    }
  }
);

/**
 * Activate meal plan
 */
export const activateMealPlan = createAsyncThunk(
  'mealPlan/activate',
  async (id: string, { rejectWithValue }) => {
    try {
      const mealPlan = await mealPlanService.activateMealPlan(id);
      return mealPlan;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to activate meal plan');
    }
  }
);

/**
 * Delete meal plan
 */
export const deleteMealPlan = createAsyncThunk(
  'mealPlan/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await mealPlanService.deleteMealPlan(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete meal plan');
    }
  }
);

const mealPlanSlice = createSlice({
  name: 'mealPlan',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentMealPlan: (state, action: PayloadAction<MealPlan | null>) => {
      state.currentMealPlan = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Generate meal plan
    builder.addCase(generateMealPlan.pending, (state) => {
      state.isGenerating = true;
      state.error = null;
    });
    builder.addCase(generateMealPlan.fulfilled, (state, action) => {
      state.isGenerating = false;
      state.mealPlans = [action.payload, ...state.mealPlans];
      state.currentMealPlan = action.payload;
    });
    builder.addCase(generateMealPlan.rejected, (state, action) => {
      state.isGenerating = false;
      state.error = action.payload as string;
    });

    // Fetch all meal plans
    builder.addCase(fetchMealPlans.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMealPlans.fulfilled, (state, action) => {
      state.isLoading = false;
      state.mealPlans = action.payload;
      // Set active meal plan
      const active = action.payload.find((plan) => plan.isActive);
      if (active) {
        state.activeMealPlan = active;
      }
    });
    builder.addCase(fetchMealPlans.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch meal plan by ID
    builder.addCase(fetchMealPlanById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMealPlanById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentMealPlan = action.payload;
    });
    builder.addCase(fetchMealPlanById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Activate meal plan
    builder.addCase(activateMealPlan.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(activateMealPlan.fulfilled, (state, action) => {
      state.isLoading = false;
      // Deactivate all other meal plans
      state.mealPlans = state.mealPlans.map((plan) => ({
        ...plan,
        isActive: plan._id === action.payload._id,
      }));
      state.activeMealPlan = action.payload;
      if (state.currentMealPlan?._id === action.payload._id) {
        state.currentMealPlan = action.payload;
      }
    });
    builder.addCase(activateMealPlan.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete meal plan
    builder.addCase(deleteMealPlan.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteMealPlan.fulfilled, (state, action) => {
      state.isLoading = false;
      state.mealPlans = state.mealPlans.filter((plan) => plan._id !== action.payload);
      if (state.activeMealPlan?._id === action.payload) {
        state.activeMealPlan = null;
      }
      if (state.currentMealPlan?._id === action.payload) {
        state.currentMealPlan = null;
      }
    });
    builder.addCase(deleteMealPlan.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, setCurrentMealPlan } = mealPlanSlice.actions;
export default mealPlanSlice.reducer;
