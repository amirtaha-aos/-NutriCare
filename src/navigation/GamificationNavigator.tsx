import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AchievementsScreen from '../screens/gamification/AchievementsScreen';
import ChallengesScreen from '../screens/gamification/ChallengesScreen';
import LeaderboardScreen from '../screens/gamification/LeaderboardScreen';

export type GamificationStackParamList = {
  Achievements: undefined;
  Challenges: undefined;
  Leaderboard: undefined;
};

const Stack = createStackNavigator<GamificationStackParamList>();

export const GamificationNavigator: React.FC = () => {
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
        name="Achievements"
        component={AchievementsScreen}
        options={{ title: 'Achievements' }}
      />
      <Stack.Screen
        name="Challenges"
        component={ChallengesScreen}
        options={{ title: 'Challenges' }}
      />
      <Stack.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ title: 'Leaderboard' }}
      />
    </Stack.Navigator>
  );
};
