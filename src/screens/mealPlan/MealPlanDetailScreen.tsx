import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  fetchMealPlanById,
  activateMealPlan,
  deleteMealPlan,
} from '../../store/slices/mealPlanSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { StackScreenProps } from '@react-navigation/stack';
import { Recipe } from '../../types/mealPlan.types';
import { MealPlanStackParamList } from '../../navigation/MealPlanNavigator';

type Props = StackScreenProps<MealPlanStackParamList, 'MealPlanDetail'>;

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const MealPlanDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { planId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { currentMealPlan, isLoading, activeMealPlan } = useSelector(
    (state: RootState) => state.mealPlan
  );

  const [selectedDay, setSelectedDay] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    dispatch(fetchMealPlanById(planId));
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
  }, [dispatch, planId]);

  const handleActivate = async () => {
    if (!currentMealPlan) return;

    try {
      await dispatch(activateMealPlan(currentMealPlan._id)).unwrap();
      Alert.alert('Success', 'Meal plan activated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to activate meal plan');
    }
  };

  const handleDelete = () => {
    if (!currentMealPlan) return;

    Alert.alert('Delete Meal Plan', 'Are you sure you want to delete this meal plan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(deleteMealPlan(currentMealPlan._id)).unwrap();
            navigation.goBack();
          } catch (error: any) {
            Alert.alert('Error', error || 'Failed to delete meal plan');
          }
        },
      },
    ]);
  };

  const handleViewShoppingList = () => {
    if (currentMealPlan) {
      navigation.navigate('ShoppingList', { planId: currentMealPlan._id });
    }
  };

  const renderMealCard = (label: string, meal: Recipe | undefined, icon: string) => {
    if (!meal || !meal.name) return null;

    return (
      <GlassCard style={styles.mealCard}>
        <View style={styles.mealHeader}>
          <View style={styles.mealIconContainer}>
            <Icon name={icon} size={24} color="#4CAF50" />
          </View>
          <View style={styles.mealTitleContainer}>
            <Text style={styles.mealLabel}>{label}</Text>
            <Text style={styles.mealName}>{meal.name}</Text>
          </View>
        </View>

        <View style={styles.macros}>
          <View style={styles.macroItem}>
            <Icon name="fire" size={16} color="#EF4444" />
            <Text style={styles.macroText}>{meal.calories} kcal</Text>
          </View>
          <View style={styles.macroItem}>
            <Icon name="food-drumstick" size={16} color="#8B5CF6" />
            <Text style={styles.macroText}>{meal.protein}g protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Icon name="baguette" size={16} color="#F59E0B" />
            <Text style={styles.macroText}>{meal.carbs}g carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Icon name="water" size={16} color="#3B82F6" />
            <Text style={styles.macroText}>{meal.fat}g fat</Text>
          </View>
        </View>

        {meal.prepTime && (
          <View style={styles.prepTime}>
            <Icon name="clock-outline" size={14} color="#6B7280" />
            <Text style={styles.prepTimeText}>Prep: {meal.prepTime} min</Text>
          </View>
        )}
      </GlassCard>
    );
  };

  if (isLoading || !currentMealPlan) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading meal plan...</Text>
      </View>
    );
  }

  const isActive = currentMealPlan._id === activeMealPlan?._id;
  const dailyMeal = currentMealPlan.meals.find((m) => m.day === selectedDay);

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

      {/* Header */}
      <Animated.View
        style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <GlassCard style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{currentMealPlan.title}</Text>
              {isActive && (
                <View style={styles.activeBadge}>
                  <Icon name="check-circle" size={14} color="#fff" />
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Icon name="delete" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerInfo}>
            <View style={styles.infoItem}>
              <Icon name="cash" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>
                ${currentMealPlan.totalEstimatedCost.toFixed(2)} / ${currentMealPlan.budget}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="fire" size={16} color="#EF4444" />
              <Text style={styles.infoText}>
                {Math.round(currentMealPlan.nutritionSummary.avgDailyCalories)} kcal/day
              </Text>
            </View>
          </View>

          {/* Day Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daySelector}
          >
            {currentMealPlan.meals.map((day) => (
              <TouchableOpacity
                key={day.day}
                style={[styles.dayButton, selectedDay === day.day && styles.dayButtonActive]}
                onPress={() => setSelectedDay(day.day)}
              >
                <LinearGradient
                  colors={selectedDay === day.day ? ['#4CAF50', '#66BB6A'] : ['transparent', 'transparent']}
                  style={styles.dayButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      selectedDay === day.day && styles.dayButtonTextActive,
                    ]}
                  >
                    Day {day.day}
                  </Text>
                  <Text
                    style={[
                      styles.dayCalories,
                      selectedDay === day.day && styles.dayCaloriesActive,
                    ]}
                  >
                    {day.totalCalories} kcal
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </GlassCard>
      </Animated.View>

      {/* Meals */}
      <ScrollView contentContainerStyle={styles.mealsContainer} showsVerticalScrollIndicator={false}>
        {dailyMeal && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Icon name="food-variant" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.sectionTitle}>Day {dailyMeal.day} Meals</Text>
            </View>

            {renderMealCard('Breakfast', dailyMeal.breakfast, 'bread-slice')}
            {renderMealCard('Morning Snack', dailyMeal.morningSnack, 'apple')}
            {renderMealCard('Lunch', dailyMeal.lunch, 'food-variant')}
            {renderMealCard('Afternoon Snack', dailyMeal.afternoonSnack, 'fruit-cherries')}
            {renderMealCard('Dinner', dailyMeal.dinner, 'food-turkey')}

            <GlassCard style={styles.dailyTotal}>
              <Text style={styles.dailyTotalLabel}>Daily Total</Text>
              <Text style={styles.dailyTotalValue}>{dailyMeal.totalCalories} kcal</Text>
            </GlassCard>
          </Animated.View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.shoppingListButton} onPress={handleViewShoppingList}>
          <LinearGradient
            colors={['#66BB6A', '#4CAF50']}
            style={styles.actionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="cart" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Shopping List</Text>
          </LinearGradient>
        </TouchableOpacity>

        {!isActive && (
          <TouchableOpacity style={styles.activateButton} onPress={handleActivate}>
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="check-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Activate Plan</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
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
    bottom: 200,
    left: -50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2E7D32',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  headerCard: {
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  headerInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  daySelector: {
    gap: 8,
  },
  dayButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  dayButtonActive: {
    borderColor: '#4CAF50',
  },
  dayButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  dayCalories: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  dayCaloriesActive: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  mealsContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 12,
  },
  mealCard: {
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  mealIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTitleContainer: {
    flex: 1,
  },
  mealLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  macros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  macroText: {
    fontSize: 12,
    color: '#6B7280',
  },
  prepTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  prepTimeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  dailyTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    marginTop: 8,
  },
  dailyTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  dailyTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(76, 175, 80, 0.15)',
  },
  shoppingListButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  activateButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MealPlanDetailScreen;
