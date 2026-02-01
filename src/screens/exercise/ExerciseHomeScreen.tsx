import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchExerciseHistory, fetchDailyStats } from '../../store/slices/exerciseSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

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

const ExerciseHomeScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { exercises, dailyStats, isLoading } = useSelector((state: RootState) => state.exercise);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadData();

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
  }, []);

  const loadData = () => {
    const today = new Date().toISOString().split('T')[0];
    dispatch(fetchDailyStats(today));
    dispatch(fetchExerciseHistory({}));
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (date: Date): string => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes} min ago`;
      }
      return `${hours}h ago`;
    }

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getIntensityColor = (intensity: string): string => {
    switch (intensity) {
      case 'high':
        return '#EF4444';
      case 'moderate':
        return '#F59E0B';
      case 'low':
        return '#4CAF50';
      default:
        return '#9CA3AF';
    }
  };

  const getExerciseIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      running: 'run',
      walking: 'walk',
      cycling: 'bike',
      swimming: 'swim',
      weightlifting: 'dumbbell',
      yoga: 'yoga',
      pilates: 'meditation',
      cardio: 'heart-pulse',
      sports: 'basketball',
      other: 'dumbbell',
    };
    return icons[type] || 'dumbbell';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadData}
            tintColor="#4CAF50"
            colors={['#4CAF50']}
          />
        }
      >
        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.headerTitle}>Exercise</Text>
          <Text style={styles.headerSubtitle}>Track your workouts and stay fit</Text>
        </Animated.View>

        {/* Daily Stats */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>
          <View style={styles.statsGrid}>
            <GlassCard style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                <Icon name="clock-outline" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>
                {dailyStats ? formatDuration(dailyStats.totalDuration) : '0m'}
              </Text>
              <Text style={styles.statLabel}>Duration</Text>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                <Icon name="fire" size={24} color="#EF4444" />
              </View>
              <Text style={styles.statValue}>
                {dailyStats?.totalCalories || 0}
              </Text>
              <Text style={styles.statLabel}>Calories</Text>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(76, 175, 80, 0.12)' }]}>
                <Icon name="map-marker-distance" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.statValue}>
                {dailyStats?.totalDistance?.toFixed(1) || 0}
              </Text>
              <Text style={styles.statLabel}>Distance (km)</Text>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.12)' }]}>
                <Icon name="counter" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.statValue}>
                {dailyStats?.count || 0}
              </Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </GlassCard>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[styles.actionsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ExerciseCoach')}
          >
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={styles.aiCoachButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <View style={styles.aiCoachIcon}>
                <Icon name="robot" size={26} color="#fff" />
              </View>
              <View style={styles.aiCoachInfo}>
                <Text style={styles.aiCoachTitle}>AI Exercise Coach</Text>
                <Text style={styles.aiCoachSubtitle}>Real-time form analysis</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('LogExercise')}
          >
            <LinearGradient
              colors={['#66BB6A', '#81C784']}
              style={styles.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Icon name="plus-circle" size={22} color="#fff" />
              <Text style={styles.primaryButtonText}>Log Workout</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('WorkoutPlans')}
          >
            <Icon name="clipboard-text" size={22} color="#4CAF50" />
            <Text style={styles.secondaryButtonText}>Workout Plans</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Recent Workouts */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ExerciseHistory')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {isLoading && exercises.length === 0 ? (
            <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
          ) : exercises.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Icon name="dumbbell" size={48} color="rgba(0,0,0,0.15)" />
              <Text style={styles.emptyStateText}>No workouts yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start logging your exercises to track your progress
              </Text>
            </GlassCard>
          ) : (
            exercises.slice(0, 5).map((exercise) => (
              <GlassCard key={exercise._id} style={styles.exerciseCard}>
                <View style={styles.exerciseIconContainer}>
                  <Icon
                    name={getExerciseIcon(exercise.type)}
                    size={24}
                    color="#4CAF50"
                  />
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <View style={styles.exerciseDetails}>
                    <Text style={styles.exerciseDetail}>
                      {formatDuration(exercise.duration)}
                    </Text>
                    <Text style={styles.exerciseDetailSeparator}>•</Text>
                    <Text style={styles.exerciseDetail}>
                      {exercise.caloriesBurned} cal
                    </Text>
                    {exercise.distance && (
                      <>
                        <Text style={styles.exerciseDetailSeparator}>•</Text>
                        <Text style={styles.exerciseDetail}>
                          {exercise.distance.toFixed(1)} km
                        </Text>
                      </>
                    )}
                  </View>
                  <Text style={styles.exerciseTime}>
                    {formatDate(exercise.date)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.intensityBadge,
                    { backgroundColor: getIntensityColor(exercise.intensity) },
                  ]}
                >
                  <Text style={styles.intensityText}>
                    {exercise.intensity.toUpperCase()}
                  </Text>
                </View>
              </GlassCard>
            ))
          )}
        </Animated.View>

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
    bottom: 150,
    left: -50,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#388E3C',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  aiCoachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    gap: 12,
  },
  aiCoachIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCoachInfo: {
    flex: 1,
  },
  aiCoachTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  aiCoachSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 2,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  loader: {
    marginTop: 40,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 3,
  },
  exerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  exerciseDetail: {
    fontSize: 13,
    color: '#6B7280',
  },
  exerciseDetailSeparator: {
    fontSize: 13,
    color: '#D1D5DB',
    marginHorizontal: 6,
  },
  exerciseTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  intensityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  intensityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default ExerciseHomeScreen;
