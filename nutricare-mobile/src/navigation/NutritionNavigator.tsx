import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NutritionStackParamList } from '../types';
import NutritionHomeScreen from '../screens/nutrition/NutritionHomeScreen';
import AddMealScreen from '../screens/nutrition/AddMealScreen';
import ScanFoodScreen from '../screens/nutrition/ScanFoodScreen';

const Stack = createStackNavigator<NutritionStackParamList>();

export const NutritionNavigator: React.FC = () => {
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
        name="NutritionHome"
        component={NutritionHomeScreen}
        options={{ title: 'Nutrition' }}
      />
      <Stack.Screen
        name="AddMeal"
        component={AddMealScreen}
        options={{ title: 'Add Meal' }}
      />
      <Stack.Screen
        name="ScanFood"
        component={ScanFoodScreen}
        options={{ title: 'Scan Food' }}
      />
    </Stack.Navigator>
  );
};
