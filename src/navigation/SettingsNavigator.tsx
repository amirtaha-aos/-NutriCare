import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/settings/SettingsScreen';
import LanguageSettingsScreen from '../screens/settings/LanguageSettingsScreen';
import MedicationsScreen from '../screens/settings/MedicationsScreen';
import AddMedicationScreen from '../screens/settings/AddMedicationScreen';
import LabTestsScreen from '../screens/settings/LabTestsScreen';
import AddLabTestScreen from '../screens/settings/AddLabTestScreen';
import LabTestDetailScreen from '../screens/settings/LabTestDetailScreen';
import LabTrendsScreen from '../screens/settings/LabTrendsScreen';
import HealthInsightsScreen from '../screens/settings/HealthInsightsScreen';
import AchievementsScreen from '../screens/gamification/AchievementsScreen';
import ChallengesScreen from '../screens/gamification/ChallengesScreen';
import LeaderboardScreen from '../screens/gamification/LeaderboardScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import GestureMusicScreen from '../screens/music/GestureMusicScreen';

export type SettingsStackParamList = {
  SettingsHome: undefined;
  Profile: undefined;
  LanguageSettings: undefined;
  Medications: undefined;
  AddMedication: { onSuccess?: () => void };
  LabTests: undefined;
  AddLabTest: { onSuccess?: () => void };
  LabTestDetail: { labTest: any };
  LabTrends: { trendsData: any };
  HealthInsights: { insights: any };
  Achievements: undefined;
  Challenges: undefined;
  Leaderboard: undefined;
  GestureMusic: undefined;
};

const Stack = createStackNavigator<SettingsStackParamList>();

const SettingsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
      <Stack.Screen
        name="LanguageSettings"
        component={LanguageSettingsScreen}
        options={{ title: 'Language Settings' }}
      />
      <Stack.Screen
        name="Medications"
        component={MedicationsScreen}
        options={{ title: 'My Medications' }}
      />
      <Stack.Screen
        name="AddMedication"
        component={AddMedicationScreen}
        options={{ title: 'Add Medication' }}
      />
      <Stack.Screen
        name="LabTests"
        component={LabTestsScreen}
        options={{ title: 'Lab Tests' }}
      />
      <Stack.Screen
        name="AddLabTest"
        component={AddLabTestScreen}
        options={{ title: 'Upload Lab Test' }}
      />
      <Stack.Screen
        name="LabTestDetail"
        component={LabTestDetailScreen}
        options={{ title: 'Lab Test Results' }}
      />
      <Stack.Screen
        name="LabTrends"
        component={LabTrendsScreen}
        options={{ title: 'Lab Trends Analysis' }}
      />
      <Stack.Screen
        name="HealthInsights"
        component={HealthInsightsScreen}
        options={{ title: 'Health Insights' }}
      />
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
      <Stack.Screen
        name="GestureMusic"
        component={GestureMusicScreen}
        options={{ title: 'Gesture Music Control', headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
