import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ExerciseHomeScreen from '../screens/exercise/ExerciseHomeScreen';
import LogExerciseScreen from '../screens/exercise/LogExerciseScreen';
import ExerciseHistoryScreen from '../screens/exercise/ExerciseHistoryScreen';
import WorkoutPlansScreen from '../screens/exercise/WorkoutPlansScreen';
import ExerciseCoachScreen from '../screens/exercise/ExerciseCoachScreen';
import ExerciseSessionScreen from '../screens/exercise/ExerciseSessionScreenV2';
import ExerciseSummaryScreen from '../screens/exercise/ExerciseSummaryScreen';
import ExerciseGuidanceScreen from '../screens/exercise/ExerciseGuidanceScreen';

export type ExerciseStackParamList = {
  ExerciseHome: undefined;
  LogExercise: undefined;
  ExerciseHistory: undefined;
  WorkoutPlans: undefined;
  ExerciseCoach: undefined;
  ExerciseSession: { exerciseType: string; exerciseName: string };
  ExerciseSummary: {
    exerciseType: string;
    exerciseName: string;
    stats: { totalReps: number; correctReps: number; incorrectReps: number };
    analysis: any;
    duration: number;
  };
  ExerciseGuidance: { exerciseType: string; exerciseName: string };
};

const Stack = createStackNavigator<ExerciseStackParamList>();

export const ExerciseNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
        },
      }}>
      <Stack.Screen
        name="ExerciseHome"
        component={ExerciseHomeScreen}
        options={{ title: 'Exercise' }}
      />
      <Stack.Screen
        name="LogExercise"
        component={LogExerciseScreen}
        options={{ title: 'Log Exercise' }}
      />
      <Stack.Screen
        name="ExerciseHistory"
        component={ExerciseHistoryScreen}
        options={{ title: 'Exercise History' }}
      />
      <Stack.Screen
        name="WorkoutPlans"
        component={WorkoutPlansScreen}
        options={{ title: 'Workout Plans' }}
      />
      <Stack.Screen
        name="ExerciseCoach"
        component={ExerciseCoachScreen}
        options={{ title: 'AI Exercise Coach' }}
      />
      <Stack.Screen
        name="ExerciseSession"
        component={ExerciseSessionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExerciseSummary"
        component={ExerciseSummaryScreen}
        options={{ title: 'Workout Summary', headerLeft: () => null }}
      />
      <Stack.Screen
        name="ExerciseGuidance"
        component={ExerciseGuidanceScreen}
        options={{ title: 'Exercise Guide' }}
      />
    </Stack.Navigator>
  );
};
