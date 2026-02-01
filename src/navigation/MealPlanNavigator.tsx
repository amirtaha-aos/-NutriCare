import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MealPlansScreen from '../screens/mealPlan/MealPlansScreen';
import MealPlanDetailScreen from '../screens/mealPlan/MealPlanDetailScreen';
import GenerateMealPlanScreen from '../screens/mealPlan/GenerateMealPlanScreen';
import ShoppingListScreen from '../screens/mealPlan/ShoppingListScreen';

export type MealPlanStackParamList = {
  MealPlans: undefined;
  MealPlanDetail: { planId: string };
  GenerateMealPlan: undefined;
  ShoppingList: { planId: string };
};

const Stack = createStackNavigator<MealPlanStackParamList>();

const MealPlanNavigator: React.FC = () => {
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
        name="MealPlans"
        component={MealPlansScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MealPlanDetail"
        component={MealPlanDetailScreen}
        options={{ title: 'Meal Plan Details' }}
      />
      <Stack.Screen
        name="GenerateMealPlan"
        component={GenerateMealPlanScreen}
        options={{ title: 'Generate Meal Plan' }}
      />
      <Stack.Screen
        name="ShoppingList"
        component={ShoppingListScreen}
        options={{ title: 'Shopping List' }}
      />
    </Stack.Navigator>
  );
};

export default MealPlanNavigator;
