import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { apiClient } from '../../services/api.config';

const EXERCISES = [
  {
    id: '4-7-8',
    name: '4-7-8 Relaxing',
    inhale: 4,
    hold: 7,
    exhale: 8,
    holdAfter: 0,
    cycles: 4,
    color: '#4CAF50',
  },
  {
    id: 'box',
    name: 'Box Breathing',
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfter: 4,
    cycles: 4,
    color: '#66BB6A',
  },
  {
    id: 'deep',
    name: 'Deep Breathing',
    inhale: 5,
    hold: 0,
    exhale: 5,
    holdAfter: 0,
    cycles: 6,
    color: '#81C784',
  },
  {
    id: 'calm',
    name: 'Calming Breath',
    inhale: 4,
    hold: 0,
    exhale: 8,
    holdAfter: 0,
    cycles: 5,
    color: '#A5D6A7',
  },
];

type Phase = 'ready' | 'inhale' | 'hold' | 'exhale' | 'holdAfter' | 'complete';

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const BreathingExerciseScreen = ({ navigation }: any) => {
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('ready');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startExercise = () => {
    setIsActive(true);
    setCurrentCycle(1);
    setTotalSeconds(0);
    startPhase('inhale');
  };

  const stopExercise = () => {
    setIsActive(false);
    setPhase('ready');
    setCurrentCycle(0);
    if (timerRef.current) clearInterval(timerRef.current);
    scaleAnim.setValue(1);
    opacityAnim.setValue(0.3);
  };

  const startPhase = (newPhase: Phase) => {
    setPhase(newPhase);

    let duration = 0;
    switch (newPhase) {
      case 'inhale':
        duration = selectedExercise.inhale;
        animateCircle(1.4, duration * 1000);
        break;
      case 'hold':
        duration = selectedExercise.hold;
        break;
      case 'exhale':
        duration = selectedExercise.exhale;
        animateCircle(1, duration * 1000);
        break;
      case 'holdAfter':
        duration = selectedExercise.holdAfter;
        break;
    }

    setCountdown(duration);
    Vibration.vibrate(50);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          nextPhase(newPhase);
          return 0;
        }
        return prev - 1;
      });
      setTotalSeconds(prev => prev + 1);
    }, 1000);
  };

  const nextPhase = (currentPhase: Phase) => {
    if (currentPhase === 'inhale') {
      if (selectedExercise.hold > 0) {
        startPhase('hold');
      } else {
        startPhase('exhale');
      }
    } else if (currentPhase === 'hold') {
      startPhase('exhale');
    } else if (currentPhase === 'exhale') {
      if (selectedExercise.holdAfter > 0) {
        startPhase('holdAfter');
      } else {
        completeCycle();
      }
    } else if (currentPhase === 'holdAfter') {
      completeCycle();
    }
  };

  const completeCycle = () => {
    if (currentCycle >= selectedExercise.cycles) {
      completeExercise();
    } else {
      setCurrentCycle(prev => prev + 1);
      startPhase('inhale');
    }
  };

  const completeExercise = async () => {
    setIsActive(false);
    setPhase('complete');
    Vibration.vibrate([100, 100, 100]);

    try {
      await apiClient.post('/mood/breathing/log', {
        exerciseType: selectedExercise.id,
        duration: totalSeconds,
        cycles: selectedExercise.cycles,
      });
    } catch (error) {
      console.error('Error logging breathing session:', error);
    }
  };

  const animateCircle = (toValue: number, duration: number) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: toValue > 1 ? 0.6 : 0.3,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'ready': return 'Tap to Start';
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'holdAfter': return 'Hold';
      case 'complete': return 'Well Done!';
      default: return '';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

      {/* Exercise Selector */}
      {!isActive && phase !== 'complete' && (
        <Animated.View
          style={[styles.selectorContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {EXERCISES.map(ex => (
            <TouchableOpacity
              key={ex.id}
              style={[
                styles.exerciseButton,
                selectedExercise.id === ex.id && styles.exerciseButtonSelected,
              ]}
              onPress={() => setSelectedExercise(ex)}>
              <Text
                style={[
                  styles.exerciseButtonText,
                  selectedExercise.id === ex.id && styles.exerciseButtonTextSelected,
                ]}>
                {ex.name}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Main Circle */}
      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            styles.breathCircle,
            {
              backgroundColor: selectedExercise.color,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        />
        <View style={styles.innerCircle}>
          {isActive ? (
            <>
              <Text style={styles.countdown}>{countdown}</Text>
              <Text style={styles.phaseText}>{getPhaseText()}</Text>
            </>
          ) : phase === 'complete' ? (
            <>
              <Icon name="check-circle" size={64} color="#4CAF50" />
              <Text style={styles.completeText}>Session Complete!</Text>
              <Text style={styles.totalTime}>{formatTime(totalSeconds)}</Text>
            </>
          ) : (
            <>
              <Text style={styles.tapText}>{getPhaseText()}</Text>
              <Text style={styles.cyclesText}>
                {selectedExercise.cycles} cycles
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Cycle Progress */}
      {isActive && (
        <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
          <Text style={styles.cycleText}>
            Cycle {currentCycle} of {selectedExercise.cycles}
          </Text>
          <View style={styles.dotsContainer}>
            {Array.from({ length: selectedExercise.cycles }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < currentCycle && { backgroundColor: selectedExercise.color },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      )}

      {/* Pattern Info */}
      {!isActive && phase !== 'complete' && (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard style={styles.patternCard}>
            <Text style={styles.patternTitle}>Breathing Pattern</Text>
            <View style={styles.patternRow}>
              <View style={styles.patternItem}>
                <Text style={styles.patternValue}>{selectedExercise.inhale}s</Text>
                <Text style={styles.patternLabel}>Inhale</Text>
              </View>
              {selectedExercise.hold > 0 && (
                <View style={styles.patternItem}>
                  <Text style={styles.patternValue}>{selectedExercise.hold}s</Text>
                  <Text style={styles.patternLabel}>Hold</Text>
                </View>
              )}
              <View style={styles.patternItem}>
                <Text style={styles.patternValue}>{selectedExercise.exhale}s</Text>
                <Text style={styles.patternLabel}>Exhale</Text>
              </View>
              {selectedExercise.holdAfter > 0 && (
                <View style={styles.patternItem}>
                  <Text style={styles.patternValue}>{selectedExercise.holdAfter}s</Text>
                  <Text style={styles.patternLabel}>Hold</Text>
                </View>
              )}
            </View>
          </GlassCard>
        </Animated.View>
      )}

      {/* Action Buttons */}
      <Animated.View style={[styles.actionContainer, { opacity: fadeAnim }]}>
        {!isActive && phase !== 'complete' ? (
          <TouchableOpacity style={styles.startButton} onPress={startExercise}>
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={styles.startButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Icon name="play" size={28} color="#fff" />
              <Text style={styles.startButtonText}>Start Session</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : isActive ? (
          <TouchableOpacity style={styles.stopButton} onPress={stopExercise}>
            <Icon name="stop" size={24} color="#EF4444" />
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.completeActions}>
            <TouchableOpacity
              style={styles.repeatButton}
              onPress={() => {
                setPhase('ready');
                setTotalSeconds(0);
              }}>
              <Icon name="replay" size={20} color="#4CAF50" />
              <Text style={styles.repeatButtonText}>Do Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                style={styles.doneButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <Text style={styles.doneButtonText}>Done</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
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
  selectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  exerciseButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  exerciseButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  exerciseButtonText: {
    color: '#388E3C',
    fontSize: 13,
    fontWeight: '500',
  },
  exerciseButtonTextSelected: {
    color: '#fff',
  },
  circleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    position: 'absolute',
  },
  innerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  countdown: {
    fontSize: 72,
    fontWeight: '200',
    color: '#2E7D32',
  },
  phaseText: {
    fontSize: 18,
    color: '#388E3C',
    marginTop: 8,
    fontWeight: '500',
  },
  tapText: {
    fontSize: 18,
    color: '#388E3C',
    fontWeight: '500',
  },
  cyclesText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  completeText: {
    fontSize: 18,
    color: '#2E7D32',
    marginTop: 16,
    fontWeight: '600',
  },
  totalTime: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cycleText: {
    color: '#388E3C',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 20,
  },
  patternCard: {
    width: '100%',
  },
  patternTitle: {
    color: '#2E7D32',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  patternItem: {
    alignItems: 'center',
  },
  patternValue: {
    color: '#2E7D32',
    fontSize: 28,
    fontWeight: '300',
  },
  patternLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  actionContainer: {
    width: '100%',
    marginTop: 20,
  },
  startButton: {
    borderRadius: 30,
    overflow: 'hidden',
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
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    gap: 8,
  },
  stopButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  completeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  repeatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    gap: 8,
  },
  repeatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  doneButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  doneButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BreathingExerciseScreen;
