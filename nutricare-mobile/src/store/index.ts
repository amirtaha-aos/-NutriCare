import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import nutritionReducer from './slices/nutritionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    nutrition: nutritionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
