import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../../components';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchDailyNutrition, deleteMeal } from '../../store/slices/nutritionSlice';
import { theme } from '../../theme';
import { format } from 'date-fns';

const NutritionHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { dailySummary, selectedDate } = useAppSelector((state) => state.nutrition);

  useEffect(() => {
    dispatch(fetchDailyNutrition(selectedDate));
  }, [dispatch, selectedDate]);

  const handleDeleteMeal = (mealId: string) => {
    dispatch(deleteMeal(mealId));
  };

  const getMealsByType = (type: string) => {
    return dailySummary?.meals.filter((meal) => meal.mealType === type) || [];
  };

  const renderMealSection = (title: string, mealType: string, icon: string) => {
    const meals = getMealsByType(mealType);
    const totalCalories = meals.reduce((sum, meal) => sum + meal.nutrition.calories, 0);

    return (
      <Card key={mealType}>
        <View style={styles.mealHeader}>
          <View style={styles.mealTitleContainer}>
            <Icon name={icon} size={24} color={theme.colors.primary} />
            <Text style={styles.mealTitle}>{title}</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddMeal' as never, { mealType } as never)
            }>
            <Icon name="add-circle" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {meals.length > 0 ? (
          <>
            {meals.map((meal) => (
              <View key={meal.id} style={styles.mealItem}>
                <View style={styles.mealInfo}>
                  <Text style={styles.foodName}>{meal.food.name}</Text>
                  <Text style={styles.servings}>
                    {meal.servings} × {meal.food.servingSize} {meal.food.servingUnit}
                  </Text>
                </View>
                <View style={styles.mealActions}>
                  <Text style={styles.calories}>{meal.nutrition.calories.toFixed(0)} kcal</Text>
                  <TouchableOpacity onPress={() => handleDeleteMeal(meal.id)}>
                    <Icon name="delete" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <View style={styles.mealTotal}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalCalories}>{totalCalories.toFixed(0)} kcal</Text>
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>No meals added</Text>
        )}
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{format(new Date(selectedDate), 'EEEE, MMMM d')}</Text>
      </View>

      {renderMealSection('Breakfast', 'breakfast', 'free-breakfast')}
      {renderMealSection('Lunch', 'lunch', 'lunch-dining')}
      {renderMealSection('Dinner', 'dinner', 'dinner-dining')}
      {renderMealSection('Snacks', 'snack', 'fastfood')}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.md,
  },
  dateHeader: {
    paddingVertical: theme.spacing.md,
  },
  dateText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  mealInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  servings: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  calories: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.primary,
  },
  mealTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },
  totalCalories: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    paddingVertical: theme.spacing.md,
  },
});

export default NutritionHomeScreen;
