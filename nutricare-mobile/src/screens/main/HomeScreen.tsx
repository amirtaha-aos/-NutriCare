import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Card, NutrientBar } from '../../components';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchDailyNutrition } from '../../store/slices/nutritionSlice';
import { theme } from '../../theme';
import { format } from 'date-fns';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { dailySummary, selectedDate, isLoading } = useAppSelector((state) => state.nutrition);

  useEffect(() => {
    dispatch(fetchDailyNutrition(selectedDate));
  }, [dispatch, selectedDate]);

  const handleRefresh = () => {
    dispatch(fetchDailyNutrition(selectedDate));
  };

  const goals = user?.goals || {
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyCarbs: 250,
    dailyFats: 65,
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.gradient.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
        <Text style={styles.date}>{format(new Date(selectedDate), 'EEEE, MMMM d')}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}>
        <Card style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Today's Summary</Text>

          <View style={styles.caloriesContainer}>
            <Text style={styles.caloriesLabel}>Calories</Text>
            <Text style={styles.caloriesValue}>
              {dailySummary?.totalCalories.toFixed(0) || 0}
            </Text>
            <Text style={styles.caloriesGoal}>of {goals.dailyCalories} kcal</Text>
          </View>

          <NutrientBar
            label="Protein"
            current={dailySummary?.totalProtein || 0}
            goal={goals.dailyProtein || 150}
            unit="g"
            color={theme.colors.nutrition.protein}
          />

          <NutrientBar
            label="Carbs"
            current={dailySummary?.totalCarbs || 0}
            goal={goals.dailyCarbs || 250}
            unit="g"
            color={theme.colors.nutrition.carbs}
          />

          <NutrientBar
            label="Fats"
            current={dailySummary?.totalFats || 0}
            goal={goals.dailyFats || 65}
            unit="g"
            color={theme.colors.nutrition.fats}
          />
        </Card>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Nutrition' as never, { screen: 'AddMeal' } as never)}>
            <LinearGradient
              colors={theme.colors.gradient.primary}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Icon name="add" size={32} color={theme.colors.textLight} />
              <Text style={styles.actionText}>Add Meal</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate('Nutrition' as never, { screen: 'ScanFood' } as never)
            }>
            <LinearGradient
              colors={theme.colors.gradient.secondary}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Icon name="camera-alt" size={32} color={theme.colors.textLight} />
              <Text style={styles.actionText}>Scan Food</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Card>
          <Text style={styles.cardTitle}>Recent Meals</Text>
          {dailySummary?.meals && dailySummary.meals.length > 0 ? (
            dailySummary.meals.slice(0, 3).map((meal) => (
              <View key={meal.id} style={styles.mealItem}>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.food.name}</Text>
                  <Text style={styles.mealType}>{meal.mealType}</Text>
                </View>
                <Text style={styles.mealCalories}>{meal.nutrition.calories.toFixed(0)} kcal</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No meals logged yet today</Text>
          )}
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  greeting: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  date: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textLight,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  summaryCard: {
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  caloriesContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  caloriesLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  caloriesValue: {
    fontSize: 48,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginVertical: theme.spacing.xs,
  },
  caloriesGoal: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: theme.colors.textLight,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
    marginTop: theme.spacing.xs,
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
  mealName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  mealType: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  mealCalories: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.md,
    paddingVertical: theme.spacing.lg,
  },
});

export default HomeScreen;
