import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchDailyNutrition, deleteMeal } from '../../store/slices/nutritionSlice';
import { format } from 'date-fns';
import { NutritionStackParamList } from '../../types';

type NutritionHomeScreenNavigationProp = StackNavigationProp<NutritionStackParamList, 'NutritionHome'>;

// Glass Card Component
const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: any;
}> = ({ children, style }) => {
  return (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );
};

const NutritionHomeScreen: React.FC = () => {
  const navigation = useNavigation<NutritionHomeScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { dailySummary, selectedDate } = useAppSelector((state) => state.nutrition);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    dispatch(fetchDailyNutrition(selectedDate));

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dispatch, selectedDate]);

  const handleDeleteMeal = (mealId: string) => {
    dispatch(deleteMeal(mealId));
  };

  const getMealsByType = (type: string) => {
    return dailySummary?.meals.filter((meal) => meal.mealType === type) || [];
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'free-breakfast';
      case 'lunch': return 'lunch-dining';
      case 'dinner': return 'dinner-dining';
      default: return 'fastfood';
    }
  };

  const renderMealSection = (title: string, mealType: string) => {
    const meals = getMealsByType(mealType);
    const totalCalories = meals.reduce((sum, meal) => sum + meal.nutrition.calories, 0);
    const icon = getMealIcon(mealType);

    return (
      <Animated.View
        key={mealType}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <GlassCard style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <View style={styles.mealTitleContainer}>
              <View style={styles.mealIconContainer}>
                <Icon name={icon} size={22} color="#4CAF50" />
              </View>
              <Text style={styles.mealTitle}>{title}</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                navigation.navigate('AddMeal', { mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack' })
              }>
              <LinearGradient
                colors={['#4CAF50', '#81C784']}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <Icon name="add" size={20} color="#fff" />
              </LinearGradient>
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
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteMeal(meal.id)}>
                      <Icon name="delete-outline" size={18} color="#EF4444" />
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
            <View style={styles.emptyMeal}>
              <Icon name="restaurant" size={24} color="rgba(0,0,0,0.15)" />
              <Text style={styles.emptyText}>No meals added</Text>
            </View>
          )}
        </GlassCard>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Background Gradient */}
      <LinearGradient
        colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative Circles */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.headerTitle}>Nutrition</Text>
          <Text style={styles.dateText}>{format(new Date(selectedDate), 'EEEE, MMMM d')}</Text>
        </Animated.View>

        {/* Meal Sections */}
        {renderMealSection('Breakfast', 'breakfast')}
        {renderMealSection('Lunch', 'lunch')}
        {renderMealSection('Dinner', 'dinner')}
        {renderMealSection('Snacks', 'snack')}

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(129, 199, 132, 0.08)',
    bottom: 100,
    left: -50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#388E3C',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 14,
  },
  mealCard: {},
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  mealInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  servings: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calories: {
    fontSize: 15,
    fontWeight: '600',
    color: '#388E3C',
  },
  deleteButton: {
    padding: 6,
  },
  mealTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  totalCalories: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4CAF50',
  },
  emptyMeal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
  },
});

export default NutritionHomeScreen;
