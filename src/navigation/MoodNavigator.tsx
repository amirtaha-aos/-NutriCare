import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MoodTrackingScreen from '../screens/mood/MoodTrackingScreen';
import MoodHistoryScreen from '../screens/mood/MoodHistoryScreen';
import BreathingExerciseScreen from '../screens/mood/BreathingExerciseScreen';

export type MoodStackParamList = {
  MoodTracking: undefined;
  MoodHistory: undefined;
  BreathingExercise: undefined;
};

const Stack = createStackNavigator<MoodStackParamList>();

export const MoodNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Stack.Screen
        name="MoodTracking"
        component={MoodTrackingScreen}
        options={{ title: 'How are you feeling?' }}
      />
      <Stack.Screen
        name="MoodHistory"
        component={MoodHistoryScreen}
        options={{ title: 'Mood History' }}
      />
      <Stack.Screen
        name="BreathingExercise"
        component={BreathingExerciseScreen}
        options={{
          title: 'Breathing Exercise',
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
};
