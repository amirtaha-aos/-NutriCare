import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Vibration,
} from 'react-native';
import { Camera, useCameraDevices, PhotoFile } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../../services/api.config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SessionStats {
  totalReps: number;
  correctReps: number;
  incorrectReps: number;
  currentPhase: string;
  lastFormScore: number;
  lastFeedback: string | null;
}

const ExerciseSessionScreen = ({ route, navigation }: any) => {
  const { exerciseType, exerciseName } = route.params;

  const [hasPermission, setHasPermission] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalReps: 0,
    correctReps: 0,
    incorrectReps: 0,
    currentPhase: 'ready',
    lastFormScore: 0,
    lastFeedback: null,
  });
  const [frames, setFrames] = useState<string[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'warning' | 'error'>('success');

  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.find((d) => d.position === 'front') || devices[0];
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousFrameRef = useRef<string | null>(null);

  useEffect(() => {
    requestPermission();
    return () => {
      stopSession();
    };
  }, []);

  const requestPermission = async () => {
    const cameraPermission = await Camera.requestCameraPermission();
    setHasPermission(cameraPermission === 'granted');

    if (cameraPermission !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to use the exercise coach feature.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const startSession = useCallback(() => {
    setIsSessionActive(true);
    setSessionStats({
      totalReps: 0,
      correctReps: 0,
      incorrectReps: 0,
      currentPhase: 'starting',
      lastFormScore: 0,
      lastFeedback: null,
    });
    setFrames([]);
    setSessionDuration(0);

    // Start session timer
    sessionTimerRef.current = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);

    // Start capturing frames every 2 seconds
    captureIntervalRef.current = setInterval(() => {
      captureAndAnalyze();
    }, 2000);

    showFeedbackMessage('Session started! Begin your exercise.', 'success');
  }, []);

  const stopSession = useCallback(async () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }

    setIsSessionActive(false);

    // If we have frames, analyze the complete set
    if (frames.length > 0) {
      await analyzeCompleteSet();
    }
  }, [frames]);

  const captureAndAnalyze = async () => {
    if (!cameraRef.current || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'speed',
      });

      // Convert photo to base64
      const base64 = await photoToBase64(photo);

      // Store frame for later analysis
      setFrames((prev) => [...prev.slice(-20), base64]); // Keep last 20 frames

      // Real-time rep detection
      if (previousFrameRef.current) {
        const repResult = await detectRep(previousFrameRef.current, base64);

        if (repResult.repCompleted) {
          Vibration.vibrate(100); // Haptic feedback

          setSessionStats((prev) => ({
            ...prev,
            totalReps: prev.totalReps + 1,
            correctReps: repResult.formCorrect ? prev.correctReps + 1 : prev.correctReps,
            incorrectReps: repResult.formCorrect ? prev.incorrectReps : prev.incorrectReps + 1,
            currentPhase: repResult.currentPhase,
          }));

          if (repResult.formCorrect) {
            showFeedbackMessage(`Rep ${sessionStats.totalReps + 1} - Great form!`, 'success');
          } else {
            showFeedbackMessage(
              `Rep ${sessionStats.totalReps + 1} - ${repResult.formIssue || 'Check your form'}`,
              'warning'
            );
          }
        } else {
          setSessionStats((prev) => ({
            ...prev,
            currentPhase: repResult.currentPhase,
          }));
        }
      }

      previousFrameRef.current = base64;
    } catch (error) {
      console.error('Capture error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const photoToBase64 = async (photo: PhotoFile): Promise<string> => {
    // In real implementation, read the file and convert to base64
    // For now, using the path as placeholder
    const RNFS = require('react-native-fs');
    const base64 = await RNFS.readFile(photo.path, 'base64');
    return base64;
  };

  const detectRep = async (previousFrame: string, currentFrame: string) => {
    try {
      const response = await apiClient.post('/exercise-analysis/detect-rep', {
        previousFrame,
        currentFrame,
        exerciseType,
        currentPhase: sessionStats.currentPhase,
      });
      return response.data.data;
    } catch (error) {
      console.error('Rep detection error:', error);
      return {
        repCompleted: false,
        currentPhase: sessionStats.currentPhase,
        formCorrect: true,
        formIssue: null,
      };
    }
  };

  const analyzeCompleteSet = async () => {
    try {
      setIsAnalyzing(true);
      const response = await apiClient.post('/exercise-analysis/analyze-set', {
        frames: frames.slice(0, 10), // Send up to 10 frames
        exerciseType,
      });

      const result = response.data.data;

      // Save workout
      await apiClient.post('/exercise-analysis/save-workout', {
        exercises: [
          {
            exerciseType,
            exerciseName,
            ...result.analysis,
          },
        ],
        duration: Math.floor(sessionDuration / 60),
      });

      // Navigate to summary
      navigation.replace('ExerciseSummary', {
        exerciseType,
        exerciseName,
        stats: sessionStats,
        analysis: result.analysis,
        duration: sessionDuration,
      });
    } catch (error) {
      console.error('Set analysis error:', error);
      navigation.replace('ExerciseSummary', {
        exerciseType,
        exerciseName,
        stats: sessionStats,
        analysis: null,
        duration: sessionDuration,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showFeedbackMessage = (message: string, type: 'success' | 'warning' | 'error') => {
    setFeedbackMessage(message);
    setFeedbackType(type);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFormAccuracy = () => {
    if (sessionStats.totalReps === 0) return 100;
    return Math.round((sessionStats.correctReps / sessionStats.totalReps) * 100);
  };

  if (!hasPermission || !device) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Overlay UI */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (isSessionActive) {
                Alert.alert('End Session?', 'Are you sure you want to end this session?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'End', style: 'destructive', onPress: stopSession },
                ]);
              } else {
                navigation.goBack();
              }
            }}
          >
            <Icon name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.exerciseName}>{exerciseName}</Text>
            <Text style={styles.timer}>{formatTime(sessionDuration)}</Text>
          </View>
          <View style={styles.headerRight}>
            {isAnalyzing && <ActivityIndicator size="small" color="#4CAF50" />}
          </View>
        </View>

        {/* Feedback Toast */}
        {showFeedback && (
          <View
            style={[
              styles.feedbackToast,
              feedbackType === 'success' && styles.feedbackSuccess,
              feedbackType === 'warning' && styles.feedbackWarning,
              feedbackType === 'error' && styles.feedbackError,
            ]}
          >
            <Icon
              name={
                feedbackType === 'success'
                  ? 'check-circle'
                  : feedbackType === 'warning'
                  ? 'alert'
                  : 'close-circle'
              }
              size={24}
              color="#fff"
            />
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}

        {/* Stats Panel */}
        <View style={styles.statsPanel}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sessionStats.totalReps}</Text>
            <Text style={styles.statLabel}>Total Reps</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>
              {sessionStats.correctReps}
            </Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F44336' }]}>
              {sessionStats.incorrectReps}
            </Text>
            <Text style={styles.statLabel}>Incorrect</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FF9800' }]}>{getFormAccuracy()}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>

        {/* Phase Indicator */}
        <View style={styles.phaseIndicator}>
          <Text style={styles.phaseText}>Phase: {sessionStats.currentPhase}</Text>
        </View>

        {/* Control Buttons */}
        <View style={styles.controls}>
          {!isSessionActive ? (
            <TouchableOpacity style={styles.startButton} onPress={startSession}>
              <Icon name="play" size={32} color="#fff" />
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={stopSession}>
              <Icon name="stop" size={32} color="#fff" />
              <Text style={styles.stopButtonText}>Stop & Analyze</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  exerciseName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  timer: {
    color: '#4CAF50',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  headerRight: {
    width: 44,
    alignItems: 'center',
  },
  feedbackToast: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    marginTop: 20,
  },
  feedbackSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  feedbackWarning: {
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
  },
  feedbackError: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsPanel: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.7)',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  phaseIndicator: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  phaseText: {
    color: '#fff',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  controls: {
    padding: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ExerciseSessionScreen;
