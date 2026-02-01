import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import nutritionReducer from './slices/nutritionSlice';
import chatReducer from './slices/chatSlice';
import exerciseReducer from './slices/exerciseSlice';
import samsungHealthReducer from './slices/samsungHealthSlice';
import mealPlanReducer from './slices/mealPlanSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    nutrition: nutritionReducer,
    chat: chatReducer,
    exercise: exerciseReducer,
    samsungHealth: samsungHealthReducer,
    mealPlan: mealPlanReducer,
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
