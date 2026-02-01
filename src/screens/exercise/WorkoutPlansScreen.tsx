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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../../services/api.config';

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

interface WorkoutPlan {
  _id: string;
  title: string;
  difficulty: string;
  duration: number;
  isActive: boolean;
  dailyWorkouts: any[];
  createdAt: Date;
}

const WorkoutPlansScreen: React.FC = () => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchPlans();
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

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/workout-plan');
      setPlans(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch workout plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    Alert.alert(
      'Generate Workout Plan',
      'AI will create a personalized workout plan based on your health profile and fitness level.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            try {
              setIsGenerating(true);
              await apiClient.post('/workout-plan/generate');
              Alert.alert('Success', 'Workout plan generated successfully!');
              fetchPlans();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to generate workout plan'
              );
            } finally {
              setIsGenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleActivatePlan = async (planId: string) => {
    try {
      await apiClient.post(`/workout-plan/${planId}/activate`);
      Alert.alert('Success', 'Workout plan activated!');
      fetchPlans();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to activate plan'
      );
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#F59E0B';
      case 'advanced':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
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
          <View style={styles.headerIcon}>
            <Icon name="clipboard-text" size={32} color="#4CAF50" />
          </View>
          <Text style={styles.headerTitle}>Workout Plans</Text>
          <Text style={styles.headerSubtitle}>AI-generated personalized workout plans</Text>
        </Animated.View>

        {/* Generate Button */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            onPress={handleGeneratePlan}
            disabled={isGenerating}>
            <LinearGradient
              colors={isGenerating ? ['#9CA3AF', '#9CA3AF'] : ['#4CAF50', '#66BB6A']}
              style={styles.generateButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              {isGenerating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="auto-fix" size={24} color="#fff" />
                  <Text style={styles.generateButtonText}>Generate New Plan</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Plans List */}
        {plans.length === 0 ? (
          <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
            <GlassCard style={styles.emptyStateCard}>
              <Icon name="clipboard-outline" size={64} color="#81C784" />
              <Text style={styles.emptyStateText}>No workout plans yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Generate your first AI-powered workout plan
              </Text>
            </GlassCard>
          </Animated.View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {plans.map((plan) => (
              <GlassCard key={plan._id}>
                <View style={styles.planHeader}>
                  <View style={styles.planHeaderLeft}>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <View style={styles.planMeta}>
                      <View
                        style={[
                          styles.difficultyBadge,
                          { backgroundColor: `${getDifficultyColor(plan.difficulty)}20` },
                        ]}>
                        <Text
                          style={[
                            styles.difficultyText,
                            { color: getDifficultyColor(plan.difficulty) },
                          ]}>
                          {plan.difficulty.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.planDuration}>{plan.duration} weeks</Text>
                    </View>
                  </View>
                  {plan.isActive && (
                    <View style={styles.activeBadge}>
                      <Icon name="check-circle" size={18} color="#4CAF50" />
                      <Text style={styles.activeText}>Active</Text>
                    </View>
                  )}
                </View>

                <View style={styles.planStats}>
                  <View style={styles.statItem}>
                    <View style={styles.statIcon}>
                      <Icon name="calendar" size={16} color="#4CAF50" />
                    </View>
                    <Text style={styles.statText}>
                      {plan.dailyWorkouts?.length || 0} days
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <View style={styles.statIcon}>
                      <Icon name="clock-outline" size={16} color="#4CAF50" />
                    </View>
                    <Text style={styles.statText}>Created {formatDate(plan.createdAt)}</Text>
                  </View>
                </View>

                {!plan.isActive && (
                  <TouchableOpacity
                    style={styles.activateButton}
                    onPress={() => handleActivatePlan(plan._id)}>
                    <Text style={styles.activateButtonText}>Set as Active</Text>
                  </TouchableOpacity>
                )}
              </GlassCard>
            ))}
          </Animated.View>
        )}

        {/* Info Section */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <GlassCard style={styles.infoSection}>
            <View style={styles.infoIcon}>
              <Icon name="information" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.infoText}>
              Workout plans are generated using AI based on your health profile, fitness
              level, and goals. Each plan includes daily exercises with detailed instructions.
            </Text>
          </GlassCard>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
    textAlign: 'center',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 12,
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planHeaderLeft: {
    flex: 1,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  planMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  planDuration: {
    fontSize: 13,
    color: '#6B7280',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  activeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  planStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
  },
  activateButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  activateButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyStateCard: {
    alignItems: 'center',
    paddingVertical: 40,
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
    paddingHorizontal: 20,
  },
  infoSection: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginTop: 8,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default WorkoutPlansScreen;
