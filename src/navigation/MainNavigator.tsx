import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabParamList } from '../types';
import { NutritionNavigator } from './NutritionNavigator';
import { ExerciseNavigator } from './ExerciseNavigator';
import { MoodNavigator } from './MoodNavigator';
import MealPlanNavigator from './MealPlanNavigator';
import SettingsNavigator from './SettingsNavigator';
import HomeScreen from '../screens/main/HomeScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          elevation: 8,
          shadowOpacity: 0.1,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Nutrition"
        component={NutritionNavigator}
        options={{
          tabBarLabel: 'Nutrition',
          tabBarIcon: ({ color, size }) => (
            <Icon name="restaurant-menu" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MealPlan"
        component={MealPlanNavigator}
        options={{
          tabBarLabel: 'Plan',
          tabBarIcon: ({ color, size }) => (
            <MCIcon name="silverware-fork-knife" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Exercise"
        component={ExerciseNavigator}
        options={{
          tabBarLabel: 'Exercise',
          tabBarIcon: ({ color, size }) => (
            <Icon name="fitness-center" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Mood"
        component={MoodNavigator}
        options={{
          tabBarLabel: 'Mood',
          tabBarIcon: ({ color, size }) => (
            <MCIcon name="emoticon-happy" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color, size }) => (
            <Icon name="more-horiz" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
