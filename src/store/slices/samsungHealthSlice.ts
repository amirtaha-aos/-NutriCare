import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import samsungHealthService, { SamsungHealthData, SamsungHealthStats } from '../../services/samsungHealth.service';

interface SamsungHealthState {
  stats: SamsungHealthStats | null;
  lastSyncedAt: string | null;
  isAvailable: boolean;
  hasPermissions: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
}

const initialState: SamsungHealthState = {
  stats: null,
  lastSyncedAt: null,
  isAvailable: false,
  hasPermissions: false,
  isLoading: false,
  isSyncing: false,
  error: null,
};

export const checkAvailability = createAsyncThunk(
  'samsungHealth/checkAvailability',
  async () => {
    const isAvailable = await samsungHealthService.checkAvailability();
    return isAvailable;
  }
);

export const requestPermissions = createAsyncThunk(
  'samsungHealth/requestPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const granted = await samsungHealthService.requestPermissions();
      return granted;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to request permissions');
    }
  }
);

export const syncDailyData = createAsyncThunk(
  'samsungHealth/syncDailyData',
  async (date: Date, { rejectWithValue }) => {
    try {
      const data = await samsungHealthService.fetchDailyData(date);
      await samsungHealthService.syncHealthData(data);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync data');
    }
  }
);

export const fetchHealthStats = createAsyncThunk(
  'samsungHealth/fetchStats',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }, { rejectWithValue }) => {
    try {
      const stats = await samsungHealthService.getHealthStats(startDate, endDate);
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const fetchLastSyncTime = createAsyncThunk(
  'samsungHealth/fetchLastSyncTime',
  async () => {
    const result = await samsungHealthService.getLastSyncTime();
    return result.lastSyncedAt;
  }
);

const samsungHealthSlice = createSlice({
  name: 'samsungHealth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAvailability.fulfilled, (state, action) => {
        state.isAvailable = action.payload;
      })
      .addCase(requestPermissions.fulfilled, (state, action) => {
        state.hasPermissions = action.payload;
      })
      .addCase(requestPermissions.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(syncDailyData.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(syncDailyData.fulfilled, (state) => {
        state.isSyncing = false;
        state.lastSyncedAt = new Date().toISOString();
      })
      .addCase(syncDailyData.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload as string;
      })
      .addCase(fetchHealthStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHealthStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchHealthStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchLastSyncTime.fulfilled, (state, action) => {
        state.lastSyncedAt = action.payload;
      });
  },
});

export const { clearError } = samsungHealthSlice.actions;
export default samsungHealthSlice.reducer;
