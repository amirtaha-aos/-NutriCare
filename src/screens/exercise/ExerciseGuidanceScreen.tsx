import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { apiClient } from '../../services/api.config';

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

interface ExerciseGuidance {
  exerciseType: string;
  name: string;
  description: string;
  targetMuscles: string[];
  keyPoints: string[];
  commonMistakes: string[];
  tips: string[];
  difficulty: string;
  equipment: string;
}

const ExerciseGuidanceScreen = ({ route, navigation }: any) => {
  const { exerciseType, exerciseName } = route.params;
  const [guidance, setGuidance] = useState<ExerciseGuidance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchGuidance();
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

  const fetchGuidance = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/exercise-analysis/guidance/${exerciseType}`);
      if (response.data.success) {
        setGuidance(response.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching guidance:', err);
      setError('Failed to load exercise guidance');
      setGuidance(getFallbackGuidance(exerciseType, exerciseName));
    } finally {
      setLoading(false);
    }
  };

  const getFallbackGuidance = (type: string, name: string): ExerciseGuidance => {
    const fallbackData: Record<string, ExerciseGuidance> = {
      squat: {
        exerciseType: 'squat',
        name: 'Squat',
        description: 'A compound exercise that targets the lower body muscles including quadriceps, hamstrings, and glutes.',
        targetMuscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core'],
        keyPoints: [
          'Keep feet shoulder-width apart',
          'Push hips back and down',
          'Keep knees tracking over toes',
          'Maintain a neutral spine',
          'Go down until thighs are parallel to floor',
        ],
        commonMistakes: [
          'Knees caving inward',
          'Heels lifting off the ground',
          'Rounding the lower back',
          'Not going deep enough',
          'Leaning too far forward',
        ],
        tips: [
          'Warm up your hips and ankles before squatting',
          'Focus on sitting back into the squat',
          'Keep your core engaged throughout',
          'Look straight ahead, not down',
        ],
        difficulty: 'Beginner',
        equipment: 'None (bodyweight)',
      },
      pushup: {
        exerciseType: 'pushup',
        name: 'Push-up',
        description: 'A classic upper body exercise that works the chest, shoulders, and triceps.',
        targetMuscles: ['Chest', 'Shoulders', 'Triceps', 'Core'],
        keyPoints: [
          'Hands slightly wider than shoulder-width',
          'Body in a straight line from head to heels',
          'Lower chest to the ground',
          'Elbows at 45-degree angle',
          'Push back up to full arm extension',
        ],
        commonMistakes: [
          'Sagging hips',
          'Flared elbows (90 degrees)',
          'Not going low enough',
          'Head dropping down',
          'Incomplete range of motion',
        ],
        tips: [
          'Engage your glutes and core',
          'Think about pushing the floor away',
          'Control the descent',
          'Breathe out on the way up',
        ],
        difficulty: 'Beginner',
        equipment: 'None (bodyweight)',
      },
      lunge: {
        exerciseType: 'lunge',
        name: 'Lunge',
        description: 'A unilateral leg exercise that improves balance and targets the lower body.',
        targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Calves'],
        keyPoints: [
          'Step forward with one leg',
          'Lower until both knees are at 90 degrees',
          'Keep front knee over ankle',
          'Back knee hovers just above floor',
          'Push through front heel to return',
        ],
        commonMistakes: [
          'Front knee going past toes',
          'Leaning forward too much',
          'Not stepping far enough',
          'Back knee hitting the ground hard',
          'Losing balance',
        ],
        tips: [
          'Keep your torso upright',
          'Focus on a point ahead for balance',
          'Take a big enough step',
          'Drive through the front heel',
        ],
        difficulty: 'Beginner',
        equipment: 'None (bodyweight)',
      },
      plank: {
        exerciseType: 'plank',
        name: 'Plank',
        description: 'An isometric core exercise that builds stability and strength.',
        targetMuscles: ['Core', 'Shoulders', 'Back', 'Glutes'],
        keyPoints: [
          'Forearms on ground, elbows under shoulders',
          'Body in a straight line',
          'Core engaged and tight',
          'Glutes squeezed',
          'Hold the position without sagging',
        ],
        commonMistakes: [
          'Hips too high',
          'Hips sagging down',
          'Looking up or down',
          'Holding breath',
          'Shoulders not over elbows',
        ],
        tips: [
          'Imagine pulling your elbows to your toes',
          'Keep breathing steadily',
          'Start with shorter holds and build up',
          'Squeeze every muscle in your body',
        ],
        difficulty: 'Beginner',
        equipment: 'None (bodyweight)',
      },
      bicepCurl: {
        exerciseType: 'bicepCurl',
        name: 'Bicep Curl',
        description: 'An isolation exercise that targets the biceps muscles.',
        targetMuscles: ['Biceps', 'Forearms'],
        keyPoints: [
          'Stand with arms at sides',
          'Keep elbows close to body',
          'Curl weights up to shoulders',
          'Control the movement down',
          'Full range of motion',
        ],
        commonMistakes: [
          'Swinging the body',
          'Moving elbows forward',
          'Using momentum',
          'Not fully extending arms',
          'Going too fast',
        ],
        tips: [
          'Keep your core tight',
          'Focus on squeezing at the top',
          'Control the negative (lowering)',
          'Keep wrists straight',
        ],
        difficulty: 'Beginner',
        equipment: 'Dumbbells or resistance band',
      },
      deadlift: {
        exerciseType: 'deadlift',
        name: 'Deadlift',
        description: 'A compound exercise that works the entire posterior chain.',
        targetMuscles: ['Hamstrings', 'Glutes', 'Lower Back', 'Core', 'Traps'],
        keyPoints: [
          'Feet hip-width apart',
          'Hinge at hips, not knees',
          'Keep back flat throughout',
          'Push hips forward at top',
          'Keep weight close to body',
        ],
        commonMistakes: [
          'Rounding the lower back',
          'Starting with hips too low',
          'Weight drifting away from body',
          'Hyperextending at the top',
          'Looking up during the lift',
        ],
        tips: [
          'Engage lats before lifting',
          'Push the floor away with your feet',
          'Squeeze glutes at the top',
          'Keep the bar close to your shins',
        ],
        difficulty: 'Intermediate',
        equipment: 'Barbell or dumbbells',
      },
    };

    return fallbackData[type] || {
      exerciseType: type,
      name: name,
      description: 'Exercise description not available.',
      targetMuscles: [],
      keyPoints: [],
      commonMistakes: [],
      tips: [],
      difficulty: 'Varies',
      equipment: 'Varies',
    };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#F59E0B';
      case 'advanced':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading exercise guide...</Text>
      </View>
    );
  }

  if (!guidance) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient
          colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.errorIcon}>
          <Icon name="alert-circle" size={64} color="#EF4444" />
        </View>
        <Text style={styles.errorText}>{error || 'Failed to load guidance'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchGuidance}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
          <Text style={styles.exerciseName}>{guidance.name}</Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: `${getDifficultyColor(guidance.difficulty)}20` }]}>
              <Text style={[styles.badgeText, { color: getDifficultyColor(guidance.difficulty) }]}>
                {guidance.difficulty}
              </Text>
            </View>
            <View style={styles.equipmentBadge}>
              <Icon name="dumbbell" size={14} color="#4CAF50" />
              <Text style={styles.equipmentText}>{guidance.equipment}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Description */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.description}>{guidance.description}</Text>
          </GlassCard>
        </Animated.View>

        {/* Target Muscles */}
        {guidance.targetMuscles.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <GlassCard>
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <Icon name="arm-flex" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.cardTitle}>Target Muscles</Text>
              </View>
              <View style={styles.muscleList}>
                {guidance.targetMuscles.map((muscle, index) => (
                  <View key={index} style={styles.muscleTag}>
                    <Text style={styles.muscleTagText}>{muscle}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Key Points */}
        {guidance.keyPoints.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <GlassCard>
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <Icon name="check-circle" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.cardTitle}>Key Points</Text>
              </View>
              {guidance.keyPoints.map((point, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.listNumber}>
                    <Text style={styles.listNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.listText}>{point}</Text>
                </View>
              ))}
            </GlassCard>
          </Animated.View>
        )}

        {/* Common Mistakes */}
        {guidance.commonMistakes.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <GlassCard style={styles.mistakesCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Icon name="alert-circle" size={20} color="#EF4444" />
                </View>
                <Text style={styles.cardTitle}>Common Mistakes to Avoid</Text>
              </View>
              {guidance.commonMistakes.map((mistake, index) => (
                <View key={index} style={styles.mistakeItem}>
                  <Icon name="close" size={18} color="#EF4444" />
                  <Text style={styles.mistakeText}>{mistake}</Text>
                </View>
              ))}
            </GlassCard>
          </Animated.View>
        )}

        {/* Tips */}
        {guidance.tips.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <GlassCard>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Icon name="lightbulb-outline" size={20} color="#3B82F6" />
                </View>
                <Text style={styles.cardTitle}>Pro Tips</Text>
              </View>
              {guidance.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Icon name="star" size={18} color="#F59E0B" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </GlassCard>
          </Animated.View>
        )}

        {/* Start Exercise Button */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() =>
              navigation.navigate('ExerciseSession', {
                exerciseType: guidance.exerciseType,
                exerciseName: guidance.name,
              })
            }>
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={styles.startButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Icon name="play-circle" size={24} color="#fff" />
              <Text style={styles.startButtonText}>Start Exercise</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#388E3C',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  equipmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  equipmentText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '500',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 12,
  },
  mistakesCard: {
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  description: {
    fontSize: 15,
    color: '#1A1A2E',
    lineHeight: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
  },
  muscleList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleTag: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  muscleTagText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  listNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listNumberText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A2E',
    lineHeight: 22,
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  mistakeText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A2E',
    lineHeight: 22,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A2E',
    lineHeight: 22,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ExerciseGuidanceScreen;
