import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { FloatingChatButton } from '../../components';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchDailyNutrition } from '../../store/slices/nutritionSlice';
import { format } from 'date-fns';
import { MainTabParamList } from '../../types';

type HomeScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

// Glass Card Component
const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: any;
  intensity?: 'light' | 'medium' | 'strong';
}> = ({ children, style, intensity = 'medium' }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const bgColor = {
    light: 'rgba(255, 255, 255, 0.25)',
    medium: 'rgba(255, 255, 255, 0.45)',
    strong: 'rgba(255, 255, 255, 0.65)',
  };

  return (
    <Animated.View
      style={[
        styles.glassCard,
        { backgroundColor: bgColor[intensity], transform: [{ scale: scaleAnim }] },
        style,
      ]}>
      {children}
    </Animated.View>
  );
};

// Animated Glass Button
const GlassButton: React.FC<{
  onPress: () => void;
  icon: string;
  label: string;
  gradient: string[];
  iconFamily?: 'material' | 'community';
}> = ({ onPress, icon, label, gradient, iconFamily = 'material' }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const IconComponent = iconFamily === 'community' ? MCIcon : Icon;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}>
      <Animated.View style={[styles.glassButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={gradient}
          style={styles.glassButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.glassButtonInner}>
            <IconComponent name={icon} size={28} color="#fff" />
            <Text style={styles.glassButtonText}>{label}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { dailySummary, selectedDate, isLoading } = useAppSelector((state) => state.nutrition);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    dispatch(fetchDailyNutrition(selectedDate));

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dispatch, selectedDate]);

  const handleRefresh = () => {
    dispatch(fetchDailyNutrition(selectedDate));
  };

  // Calculate personalized daily calories based on user profile
  const calculateDailyCalories = () => {
    if (!user?.weight || !user?.height || !user?.age || !user?.gender) {
      return 2000; // Default if missing data
    }

    // Mifflin-St Jeor Equation for BMR
    let bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age;
    if (user.gender === 'male') {
      bmr += 5;
    } else if (user.gender === 'female') {
      bmr -= 161;
    } else {
      bmr -= 78; // Average for 'other'
    }

    // Activity multiplier
    const activityFactors: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const factor = activityFactors[user.activityLevel || 'moderate'] || 1.55;
    let tdee = Math.round(bmr * factor);

    // Adjust for goal type
    if (user.goals?.goalType === 'lose_weight') {
      tdee -= 500;
    } else if (user.goals?.goalType === 'gain_muscle') {
      tdee += 400;
    }

    return tdee;
  };

  const calculatedCalories = user?.goals?.dailyCalories || calculateDailyCalories();

  const goals = {
    dailyCalories: calculatedCalories,
    dailyProtein: user?.goals?.dailyProtein || Math.round(calculatedCalories * 0.25 / 4), // 25% from protein
    dailyCarbs: user?.goals?.dailyCarbs || Math.round(calculatedCalories * 0.45 / 4), // 45% from carbs
    dailyFats: user?.goals?.dailyFats || Math.round(calculatedCalories * 0.30 / 9), // 30% from fats
  };

  const calorieProgress = Math.min(
    ((dailySummary?.totalCalories || 0) / (goals.dailyCalories || 2000)) * 100,
    100
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Background Gradient - Nature/Health Theme */}
      <LinearGradient
        colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative Circles */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#4CAF50"
            colors={['#4CAF50']}
          />
        }>
        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
              <Text style={styles.date}>{format(new Date(selectedDate), 'EEEE, MMMM d')}</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Settings', { screen: 'Profile' })}>
              <LinearGradient
                colors={['rgba(76, 175, 80, 0.2)', 'rgba(129, 199, 132, 0.1)']}
                style={styles.profileGradient}>
                <Icon name="person" size={24} color="#4CAF50" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Main Calorie Card */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard style={styles.calorieCard} intensity="medium">
            <View style={styles.calorieHeader}>
              <Text style={styles.calorieTitle}>Today's Calories</Text>
              <View style={styles.calorieBadge}>
                <Text style={styles.calorieBadgeText}>
                  {Math.round(calorieProgress)}%
                </Text>
              </View>
            </View>

            <View style={styles.calorieMain}>
              <Text style={styles.calorieValue}>
                {dailySummary?.totalCalories?.toFixed(0) || '0'}
              </Text>
              <Text style={styles.calorieUnit}>/ {goals.dailyCalories} kcal</Text>
            </View>

            {/* Progress Ring Visual */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${calorieProgress}%` },
                  ]}
                />
              </View>
            </View>

            {/* Macro Nutrients */}
            <View style={styles.macroContainer}>
              <View style={styles.macroItem}>
                <View style={[styles.macroDot, { backgroundColor: '#EC4899' }]} />
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>
                  {dailySummary?.totalProtein?.toFixed(0) || 0}g
                </Text>
              </View>
              <View style={styles.macroItem}>
                <View style={[styles.macroDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroValue}>
                  {dailySummary?.totalCarbs?.toFixed(0) || 0}g
                </Text>
              </View>
              <View style={styles.macroItem}>
                <View style={[styles.macroDot, { backgroundColor: '#8B5CF6' }]} />
                <Text style={styles.macroLabel}>Fats</Text>
                <Text style={styles.macroValue}>
                  {dailySummary?.totalFats?.toFixed(0) || 0}g
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.quickActions,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}>
          <GlassButton
            onPress={() => navigation.navigate('Nutrition', { screen: 'AddMeal', params: {} })}
            icon="add-circle"
            label="Add Meal"
            gradient={['#4CAF50', '#81C784']}
          />
          <GlassButton
            onPress={() => navigation.navigate('Nutrition', { screen: 'ScanFood', params: undefined })}
            icon="camera-alt"
            label="Scan Food"
            gradient={['#66BB6A', '#A5D6A7']}
          />
          <GlassButton
            onPress={() => navigation.navigate('Nutrition', { screen: 'AIAnalysis', params: {} })}
            icon="robot"
            label="AI Analyze"
            gradient={['#43A047', '#76D275']}
            iconFamily="community"
          />
        </Animated.View>

        {/* Recent Meals */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard style={styles.mealsCard} intensity="strong">
            <View style={styles.mealsHeader}>
              <Text style={styles.mealsTitle}>Recent Meals</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Nutrition', { screen: 'MealHistory' })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {dailySummary?.meals && dailySummary.meals.length > 0 ? (
              dailySummary.meals.slice(0, 3).map((meal) => (
                <TouchableOpacity key={meal.id} activeOpacity={0.7}>
                  <Animated.View style={styles.mealItem}>
                    <View style={styles.mealIconContainer}>
                      <Icon
                        name={
                          meal.mealType === 'breakfast'
                            ? 'free-breakfast'
                            : meal.mealType === 'lunch'
                            ? 'lunch-dining'
                            : meal.mealType === 'dinner'
                            ? 'dinner-dining'
                            : 'fastfood'
                        }
                        size={24}
                        color="#4CAF50"
                      />
                    </View>
                    <View style={styles.mealInfo}>
                      <Text style={styles.mealName}>{meal.food.name}</Text>
                      <Text style={styles.mealType}>{meal.mealType}</Text>
                    </View>
                    <Text style={styles.mealCalories}>
                      {meal.nutrition.calories.toFixed(0)} kcal
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MCIcon name="food-off" size={48} color="rgba(0,0,0,0.2)" />
                <Text style={styles.emptyText}>No meals logged yet today</Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('Nutrition', { screen: 'AddMeal', params: {} })}>
                  <Text style={styles.emptyButtonText}>Log your first meal</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingChatButton />
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
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    top: -100,
    right: -100,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(129, 199, 132, 0.12)',
    top: 200,
    left: -80,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(165, 214, 167, 0.1)',
    bottom: 100,
    right: -50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  date: {
    fontSize: 15,
    color: '#388E3C',
  },
  profileButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  profileGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  glassCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 20,
    marginBottom: 16,
  },
  calorieCard: {
    marginBottom: 20,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  calorieBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  calorieBadgeText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 14,
  },
  calorieMain: {
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieValue: {
    fontSize: 56,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  calorieUnit: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
  macroLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  glassButtonContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassButton: {
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  glassButtonInner: {
    alignItems: 'center',
  },
  glassButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  mealsCard: {},
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  mealIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  mealType: {
    fontSize: 13,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '700',
    color: '#388E3C',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default HomeScreen;
