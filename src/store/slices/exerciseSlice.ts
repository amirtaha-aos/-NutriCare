import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import exerciseService, { Exercise, ExerciseStats, LogExerciseRequest } from '../../services/exercise.service';

interface ExerciseState {
  exercises: Exercise[];
  dailyStats: ExerciseStats | null;
  weeklyStats: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ExerciseState = {
  exercises: [],
  dailyStats: null,
  weeklyStats: null,
  isLoading: false,
  error: null,
};

export const logExercise = createAsyncThunk(
  'exercise/logExercise',
  async (data: LogExerciseRequest, { rejectWithValue }) => {
    try {
      const exercise = await exerciseService.logExercise(data);
      return exercise;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to log exercise');
    }
  }
);

export const fetchExerciseHistory = createAsyncThunk(
  'exercise/fetchHistory',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }, { rejectWithValue }) => {
    try {
      const exercises = await exerciseService.getHistory(startDate, endDate);
      return exercises;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

export const fetchDailyStats = createAsyncThunk(
  'exercise/fetchDailyStats',
  async (date: string | undefined, { rejectWithValue }) => {
    try {
      const stats = await exerciseService.getDailyStats(date);
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const deleteExercise = createAsyncThunk(
  'exercise/deleteExercise',
  async (exerciseId: string, { rejectWithValue }) => {
    try {
      await exerciseService.deleteExercise(exerciseId);
      return exerciseId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete exercise');
    }
  }
);

const exerciseSlice = createSlice({
  name: 'exercise',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logExercise.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logExercise.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exercises.unshift(action.payload);
      })
      .addCase(logExercise.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchExerciseHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExerciseHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exercises = action.payload;
      })
      .addCase(fetchExerciseHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDailyStats.fulfilled, (state, action) => {
        state.dailyStats = action.payload;
      })
      .addCase(deleteExercise.fulfilled, (state, action) => {
        state.exercises = state.exercises.filter(ex => ex._id !== action.payload);
      });
  },
});

export const { clearError } = exerciseSlice.actions;
export default exerciseSlice.reducer;
