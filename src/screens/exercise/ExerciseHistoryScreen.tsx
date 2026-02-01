import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  fetchExerciseHistory,
  deleteExercise,
} from '../../store/slices/exerciseSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const ExerciseHistoryScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { exercises, isLoading } = useSelector((state: RootState) => state.exercise);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadHistory();
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

  const loadHistory = async () => {
    await dispatch(fetchExerciseHistory({}));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleDelete = (exerciseId: string, exerciseName: string) => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${exerciseName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteExercise(exerciseId)).unwrap();
              Alert.alert('Success', 'Exercise deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error || 'Failed to delete exercise');
            }
          },
        },
      ]
    );
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
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const groupExercisesByDate = () => {
    const grouped: { [key: string]: typeof exercises } = {};

    exercises.forEach((exercise) => {
      const dateKey = formatDate(exercise.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(exercise);
    });

    return Object.entries(grouped).map(([date, items]) => ({ date, items }));
  };

  const groupedExercises = groupExercisesByDate();

  const renderExerciseItem = (item: any) => (
    <GlassCard key={item._id} style={styles.exerciseCard}>
      <View style={styles.exerciseIconContainer}>
        <Icon name={getExerciseIcon(item.type)} size={28} color="#4CAF50" />
      </View>

      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>

        <View style={styles.exerciseStats}>
          <View style={styles.statItem}>
            <Icon name="clock-outline" size={14} color="#6B7280" />
            <Text style={styles.statText}>{formatDuration(item.duration)}</Text>
          </View>

          <View style={styles.statItem}>
            <Icon name="fire" size={14} color="#6B7280" />
            <Text style={styles.statText}>{item.caloriesBurned} cal</Text>
          </View>

          {item.distance && (
            <View style={styles.statItem}>
              <Icon name="map-marker-distance" size={14} color="#6B7280" />
              <Text style={styles.statText}>{item.distance.toFixed(1)} km</Text>
            </View>
          )}
        </View>

        {item.notes && (
          <Text style={styles.exerciseNotes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}

        <Text style={styles.exerciseTime}>{formatTime(item.date)}</Text>
      </View>

      <View style={styles.exerciseActions}>
        <View
          style={[
            styles.intensityBadge,
            { backgroundColor: `${getIntensityColor(item.intensity)}20` },
          ]}>
          <Text style={[styles.intensityText, { color: getIntensityColor(item.intensity) }]}>
            {item.intensity.charAt(0).toUpperCase()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item._id, item.name)}>
          <Icon name="delete-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </GlassCard>
  );

  const renderDateGroup = ({ item }: { item: { date: string; items: any[] } }) => (
    <Animated.View style={[styles.dateGroup, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.dateHeader}>
        <View style={styles.dateIconContainer}>
          <Icon name="calendar" size={16} color="#4CAF50" />
        </View>
        <Text style={styles.dateText}>{item.date}</Text>
        <View style={styles.dateSummary}>
          <Icon name="counter" size={14} color="#6B7280" />
          <Text style={styles.dateSummaryText}>{item.items.length} workouts</Text>
        </View>
      </View>

      {item.items.map((exercise) => renderExerciseItem(exercise))}
    </Animated.View>
  );

  if (isLoading && exercises.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <LinearGradient
          colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (exercises.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <LinearGradient
          colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.emptyContainer}>
          <Animated.View style={[styles.emptyContent, { opacity: fadeAnim }]}>
            <View style={styles.emptyIcon}>
              <Icon name="dumbbell" size={64} color="#81C784" />
            </View>
            <Text style={styles.emptyStateText}>No exercise history yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start logging your workouts to see them here
            </Text>
          </Animated.View>
        </View>
      </View>
    );
  }

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
        style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.headerIcon}>
          <Icon name="history" size={32} color="#4CAF50" />
        </View>
        <Text style={styles.headerTitle}>Exercise History</Text>
        <Text style={styles.headerSubtitle}>Your workout journey</Text>
      </Animated.View>

      <FlatList
        data={groupedExercises}
        renderItem={renderDateGroup}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2E7D32',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#388E3C',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  dateIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    flex: 1,
  },
  dateSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dateSummaryText: {
    fontSize: 12,
    color: '#6B7280',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 12,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 6,
  },
  exerciseStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  exerciseNotes: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  exerciseTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  exerciseActions: {
    alignItems: 'center',
    gap: 8,
  },
  intensityBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ExerciseHistoryScreen;
