import React, { useState, useEffect, useRef } from 'react';
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

interface Exercise {
  id: string;
  name: string;
  keyPoints: string[];
  commonMistakes: string[];
}

const ExerciseCoachScreen = ({ navigation }: any) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadExercises();
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

  const loadExercises = async () => {
    try {
      const response = await apiClient.get('/exercise-analysis/exercises');
      setExercises(response.data.data);
    } catch (error) {
      console.error('Error loading exercises:', error);
      // Fallback exercises
      setExercises([
        { id: 'squat', name: 'Squat', keyPoints: ['hip', 'knee', 'ankle'], commonMistakes: [] },
        { id: 'pushup', name: 'Push-up', keyPoints: ['shoulder', 'elbow', 'wrist'], commonMistakes: [] },
        { id: 'lunge', name: 'Lunge', keyPoints: ['hip', 'knee'], commonMistakes: [] },
        { id: 'plank', name: 'Plank', keyPoints: ['shoulder', 'hip'], commonMistakes: [] },
        { id: 'bicepCurl', name: 'Bicep Curl', keyPoints: ['shoulder', 'elbow'], commonMistakes: [] },
        { id: 'deadlift', name: 'Deadlift', keyPoints: ['hip', 'knee', 'spine'], commonMistakes: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getExerciseIcon = (exerciseId: string) => {
    const icons: Record<string, string> = {
      squat: 'human-handsdown',
      pushup: 'human-greeting-variant',
      lunge: 'walk',
      plank: 'human',
      bicepCurl: 'arm-flex',
      deadlift: 'weight-lifter',
    };
    return icons[exerciseId] || 'dumbbell';
  };

  const getExerciseColor = (exerciseId: string) => {
    const colors: Record<string, string> = {
      squat: '#4CAF50',
      pushup: '#66BB6A',
      lunge: '#81C784',
      plank: '#A5D6A7',
      bicepCurl: '#2E7D32',
      deadlift: '#388E3C',
    };
    return colors[exerciseId] || '#4CAF50';
  };

  const handleStartSession = () => {
    if (!selectedExercise) {
      Alert.alert('Select Exercise', 'Please select an exercise to start');
      return;
    }

    const exercise = exercises.find((e) => e.id === selectedExercise);
    navigation.navigate('ExerciseSession', {
      exerciseType: selectedExercise,
      exerciseName: exercise?.name || selectedExercise,
    });
  };

  const handleViewGuidance = async (exerciseId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/exercise-analysis/guidance/${exerciseId}`);
      navigation.navigate('ExerciseGuidance', {
        guidance: response.data.data,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load exercise guidance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
            <Icon name="robot" size={32} color="#4CAF50" />
          </View>
          <Text style={styles.headerTitle}>AI Exercise Coach</Text>
          <Text style={styles.headerSubtitle}>Real-time form analysis & rep counting</Text>
        </Animated.View>

        {/* Exercise Selection */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.sectionTitle}>Select Exercise</Text>

          <View style={styles.exerciseGrid}>
            {exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={[
                  styles.exerciseCard,
                  selectedExercise === exercise.id && styles.exerciseCardSelected,
                ]}
                onPress={() => setSelectedExercise(exercise.id)}>
                <GlassCard style={styles.exerciseCardInner}>
                  <View
                    style={[
                      styles.exerciseIconContainer,
                      { backgroundColor: `${getExerciseColor(exercise.id)}20` },
                      selectedExercise === exercise.id && {
                        backgroundColor: getExerciseColor(exercise.id),
                      },
                    ]}>
                    <Icon
                      name={getExerciseIcon(exercise.id)}
                      size={32}
                      color={selectedExercise === exercise.id ? '#fff' : getExerciseColor(exercise.id)}
                    />
                  </View>
                  <Text
                    style={[
                      styles.exerciseName,
                      selectedExercise === exercise.id && styles.exerciseNameSelected,
                    ]}>
                    {exercise.name}
                  </Text>
                  {selectedExercise === exercise.id && (
                    <View style={styles.checkIcon}>
                      <Icon name="check-circle" size={22} color="#4CAF50" />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.infoButton}
                    onPress={() => handleViewGuidance(exercise.id)}>
                    <Icon name="information-outline" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Features Section */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard style={styles.featuresSection}>
            <View style={styles.featuresTitleRow}>
              <View style={styles.featuresIcon}>
                <Icon name="star" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.featuresTitle}>Features</Text>
            </View>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
                  <Icon name="camera" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.featureText}>Real-time camera analysis</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(102, 187, 106, 0.15)' }]}>
                  <Icon name="counter" size={20} color="#66BB6A" />
                </View>
                <Text style={styles.featureText}>Automatic rep counting</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(129, 199, 132, 0.15)' }]}>
                  <Icon name="check-decagram" size={20} color="#81C784" />
                </View>
                <Text style={styles.featureText}>Form correction feedback</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(46, 125, 50, 0.15)' }]}>
                  <Icon name="chart-line" size={20} color="#2E7D32" />
                </View>
                <Text style={styles.featureText}>Range of motion tracking</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Start Button */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={[styles.startButton, !selectedExercise && styles.startButtonDisabled]}
          onPress={handleStartSession}
          disabled={!selectedExercise}>
          <LinearGradient
            colors={!selectedExercise ? ['#9CA3AF', '#9CA3AF'] : ['#4CAF50', '#66BB6A']}
            style={styles.startButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Icon name="play" size={24} color="#fff" />
            <Text style={styles.startButtonText}>Start Session</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 16,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exerciseCard: {
    width: '47%',
  },
  exerciseCardSelected: {
    // Handled by inner styles
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 12,
  },
  exerciseCardInner: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 0,
  },
  exerciseIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
  },
  exerciseNameSelected: {
    color: '#1B5E20',
  },
  checkIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  infoButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
  featuresSection: {
    marginTop: 8,
  },
  featuresTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  featuresIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuresTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#1A1A2E',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(76, 175, 80, 0.15)',
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonDisabled: {
    opacity: 0.7,
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

export default ExerciseCoachScreen;
