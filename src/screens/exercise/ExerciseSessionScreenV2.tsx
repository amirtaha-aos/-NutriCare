import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Vibration,
  Animated,
} from 'react-native';
import { Camera, useCameraDevices, PhotoFile } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Tts from 'react-native-tts';
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

interface PositioningStatus {
  isReady: boolean;
  visibility: number;
  tips: string[];
}

type SessionState = 'positioning' | 'waiting_gesture' | 'counting' | 'stopped';

const ExerciseSessionScreenV2 = ({ route, navigation }: any) => {
  const { exerciseType, exerciseName } = route.params;

  // Camera state
  const [hasPermission, setHasPermission] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.find((d) => d.position === 'front') || devices[0];

  // Session state
  const [sessionState, setSessionState] = useState<SessionState>('positioning');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalReps: 0,
    correctReps: 0,
    incorrectReps: 0,
    currentPhase: 'ready',
    lastFormScore: 0,
    lastFeedback: null,
  });
  const [sessionDuration, setSessionDuration] = useState(0);

  // Positioning state
  const [positioning, setPositioning] = useState<PositioningStatus>({
    isReady: false,
    visibility: 0,
    tips: ['Move your full body into frame'],
  });

  // Visual feedback
  const [borderColor, setBorderColor] = useState<'green' | 'red' | 'yellow' | 'white'>('white');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'warning' | 'error'>('success');

  // Gesture detection
  const [detectedGesture, setDetectedGesture] = useState<string | null>(null);
  const gestureCountRef = useRef<{ up: number; down: number }>({ up: 0, down: 0 });

  // Timers
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const borderAnimRef = useRef(new Animated.Value(0)).current;

  // Initialize TTS
  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);

    return () => {
      Tts.stop();
    };
  }, []);

  useEffect(() => {
    requestPermission();
    return () => {
      stopSession();
    };
  }, []);

  // Start frame capture when positioning
  useEffect(() => {
    if (hasPermission && device) {
      startPositioningCheck();
    }
    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, [hasPermission, device]);

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

  const speak = (text: string) => {
    Tts.stop();
    Tts.speak(text);
  };

  const startPositioningCheck = () => {
    // Check positioning every 500ms
    captureIntervalRef.current = setInterval(() => {
      checkPositioningAndGesture();
    }, 500);
  };

  const checkPositioningAndGesture = async () => {
    if (!cameraRef.current || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      const photo = await cameraRef.current.takePhoto();

      const base64 = await photoToBase64(photo);

      // Send to backend for analysis
      const response = await apiClient.post('/exercise-analysis/analyze-position', {
        frame: base64,
        exerciseType,
        sessionState,
      });

      const result = response.data.data;

      // Update positioning status
      setPositioning({
        isReady: result.positioning?.isReady || false,
        visibility: result.positioning?.visibility || 0,
        tips: result.positioning?.tips || [],
      });

      // Handle based on current session state
      if (sessionState === 'positioning') {
        if (result.positioning?.isReady) {
          setSessionState('waiting_gesture');
          showFeedbackMessage('Good position! Show thumbs up to start', 'success');
          speak('Good position. Show thumbs up to start');
        }
      } else if (sessionState === 'waiting_gesture') {
        handleGestureDetection(result.gesture);
      } else if (sessionState === 'counting') {
        handleRepCounting(result);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGestureDetection = (gesture: string | null) => {
    if (gesture === 'thumbs_up') {
      gestureCountRef.current.up++;
      if (gestureCountRef.current.up >= 3) {
        startCounting();
        gestureCountRef.current = { up: 0, down: 0 };
      }
    } else if (gesture === 'thumbs_down') {
      gestureCountRef.current.down++;
      if (gestureCountRef.current.down >= 3) {
        stopCounting();
        gestureCountRef.current = { up: 0, down: 0 };
      }
    } else {
      gestureCountRef.current = { up: 0, down: 0 };
    }

    setDetectedGesture(gesture);
  };

  const handleRepCounting = (result: any) => {
    // Check for gesture to stop
    if (result.gesture === 'thumbs_down') {
      gestureCountRef.current.down++;
      if (gestureCountRef.current.down >= 3) {
        stopCounting();
        return;
      }
    } else {
      gestureCountRef.current.down = 0;
    }

    // Update stats
    setSessionStats((prev) => ({
      ...prev,
      currentPhase: result.phase || prev.currentPhase,
    }));

    // Handle rep completion
    if (result.repCompleted) {
      const isCorrect = result.form?.isCorrect || false;
      const formScore = result.form?.score || 0;
      const newRepCount = sessionStats.totalReps + 1;

      setSessionStats((prev) => ({
        ...prev,
        totalReps: newRepCount,
        correctReps: isCorrect ? prev.correctReps + 1 : prev.correctReps,
        incorrectReps: isCorrect ? prev.incorrectReps : prev.incorrectReps + 1,
        lastFormScore: formScore,
      }));

      // Visual and audio feedback
      if (isCorrect) {
        flashBorder('green');
        speak(`${newRepCount}`);
        Vibration.vibrate(50);
      } else {
        flashBorder('red');
        const issue = result.form?.issues?.[0] || 'Check your form';
        speak(issue);
        Vibration.vibrate([0, 50, 50, 50]);
      }

      showFeedbackMessage(
        isCorrect ? `Rep ${newRepCount} - Great!` : `Rep ${newRepCount} - ${result.form?.issues?.[0] || 'Fix form'}`,
        isCorrect ? 'success' : 'warning'
      );
    }
  };

  const startCounting = () => {
    setSessionState('counting');
    setSessionDuration(0);

    speak('Go! Start your exercise');
    Vibration.vibrate([0, 100, 100, 100]);

    // Start session timer
    sessionTimerRef.current = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);

    // Increase capture frequency for counting
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }
    captureIntervalRef.current = setInterval(() => {
      analyzeExercise();
    }, 300);

    showFeedbackMessage('GO! Start your exercise', 'success');
    flashBorder('green');
  };

  const stopCounting = async () => {
    setSessionState('stopped');

    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }

    speak(`Done! You completed ${sessionStats.totalReps} reps`);
    Vibration.vibrate(200);

    // Navigate to summary
    navigation.replace('ExerciseSummary', {
      exerciseType,
      exerciseName,
      stats: sessionStats,
      duration: sessionDuration,
    });
  };

  const stopSession = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    Tts.stop();
  };

  const analyzeExercise = async () => {
    if (!cameraRef.current || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      const photo = await cameraRef.current.takePhoto();

      const base64 = await photoToBase64(photo);

      const response = await apiClient.post('/exercise-analysis/analyze-rep', {
        frame: base64,
        exerciseType,
        currentStats: sessionStats,
      });

      const result = response.data.data;
      handleRepCounting(result);
    } catch (error) {
      console.error('Exercise analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const photoToBase64 = async (photo: PhotoFile): Promise<string> => {
    const RNFS = require('react-native-fs');
    const base64 = await RNFS.readFile(photo.path, 'base64');
    return base64;
  };

  const flashBorder = (color: 'green' | 'red') => {
    setBorderColor(color);
    Animated.sequence([
      Animated.timing(borderAnimRef, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(borderAnimRef, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setBorderColor('white');
    });
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

  const getBorderWidth = () => {
    return borderAnimRef.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 8],
    });
  };

  const getBorderColorStyle = () => {
    if (borderColor === 'green') return '#4CAF50';
    if (borderColor === 'red') return '#F44336';
    if (borderColor === 'yellow') return '#FFC107';
    return 'transparent';
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
      {/* Animated Border */}
      <Animated.View
        style={[
          styles.borderOverlay,
          {
            borderWidth: getBorderWidth(),
            borderColor: getBorderColorStyle(),
          },
        ]}
        pointerEvents="none"
      />

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
              if (sessionState === 'counting') {
                Alert.alert('End Session?', 'Are you sure you want to end?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'End', style: 'destructive', onPress: stopCounting },
                ]);
              } else {
                navigation.goBack();
              }
            }}>
            <Icon name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.exerciseName}>{exerciseName}</Text>
            {sessionState === 'counting' && (
              <Text style={styles.timer}>{formatTime(sessionDuration)}</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            {isAnalyzing && <ActivityIndicator size="small" color="#4CAF50" />}
          </View>
        </View>

        {/* Positioning Guide */}
        {sessionState === 'positioning' && (
          <View style={styles.positioningGuide}>
            <View style={styles.positioningBox}>
              <Icon name="human" size={100} color="rgba(255,255,255,0.3)" />
            </View>
            <View style={styles.positioningInfo}>
              <Text style={styles.positioningTitle}>Position yourself in frame</Text>
              {positioning.tips.map((tip, index) => (
                <Text key={index} style={styles.positioningTip}>
                  {tip}
                </Text>
              ))}
              <View style={styles.visibilityBar}>
                <View
                  style={[
                    styles.visibilityFill,
                    {
                      width: `${positioning.visibility * 100}%`,
                      backgroundColor: positioning.visibility > 0.8 ? '#4CAF50' : '#FFC107',
                    },
                  ]}
                />
              </View>
              <Text style={styles.visibilityText}>
                {Math.round(positioning.visibility * 100)}% visible
              </Text>
            </View>
          </View>
        )}

        {/* Waiting for Gesture */}
        {sessionState === 'waiting_gesture' && (
          <View style={styles.gestureGuide}>
            <View style={styles.gestureIcon}>
              <Icon name="thumb-up" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.gestureTitle}>Ready!</Text>
            <Text style={styles.gestureText}>
              Show thumbs up to start counting
            </Text>
            <Text style={styles.gestureSubtext}>
              Thumbs down to stop
            </Text>
            {detectedGesture && (
              <View style={styles.gestureDetected}>
                <Icon
                  name={detectedGesture === 'thumbs_up' ? 'thumb-up' : 'thumb-down'}
                  size={30}
                  color={detectedGesture === 'thumbs_up' ? '#4CAF50' : '#F44336'}
                />
              </View>
            )}
          </View>
        )}

        {/* Feedback Toast */}
        {showFeedback && (
          <View
            style={[
              styles.feedbackToast,
              feedbackType === 'success' && styles.feedbackSuccess,
              feedbackType === 'warning' && styles.feedbackWarning,
              feedbackType === 'error' && styles.feedbackError,
            ]}>
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

        {/* Stats Panel - Only during counting */}
        {sessionState === 'counting' && (
          <View style={styles.statsPanel}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sessionStats.totalReps}</Text>
              <Text style={styles.statLabel}>Reps</Text>
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
              <Text style={[styles.statValue, { color: '#FF9800' }]}>{getFormAccuracy()}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
          </View>
        )}

        {/* Phase Indicator */}
        {sessionState === 'counting' && (
          <View style={styles.phaseIndicator}>
            <Text style={styles.phaseText}>
              {sessionStats.currentPhase.toUpperCase()}
            </Text>
          </View>
        )}

        {/* Manual Controls */}
        {sessionState !== 'counting' && (
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.manualStartButton}
              onPress={() => {
                if (sessionState === 'waiting_gesture') {
                  startCounting();
                }
              }}
              disabled={sessionState !== 'waiting_gesture'}>
              <Icon name="play" size={32} color="#fff" />
              <Text style={styles.manualStartText}>
                {sessionState === 'positioning' ? 'Get in position...' : 'Tap to Start'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stop Button during counting */}
        {sessionState === 'counting' && (
          <View style={styles.controls}>
            <View style={styles.gestureHint}>
              <Icon name="thumb-down" size={20} color="rgba(255,255,255,0.7)" />
              <Text style={styles.gestureHintText}>Thumbs down to stop</Text>
            </View>
          </View>
        )}
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
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    borderRadius: 0,
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
  positioningGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positioningBox: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_HEIGHT * 0.5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positioningInfo: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  positioningTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  positioningTip: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 5,
  },
  visibilityBar: {
    width: 200,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginTop: 15,
    overflow: 'hidden',
  },
  visibilityFill: {
    height: '100%',
    borderRadius: 4,
  },
  visibilityText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 5,
  },
  gestureGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestureIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  gestureTitle: {
    color: '#4CAF50',
    fontSize: 28,
    fontWeight: '700',
  },
  gestureText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
  gestureSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 5,
  },
  gestureDetected: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
  },
  feedbackToast: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    position: 'absolute',
    top: 120,
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
    position: 'absolute',
    bottom: 150,
    left: 0,
    right: 0,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 32,
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
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
    position: 'absolute',
    bottom: 230,
  },
  phaseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  controls: {
    padding: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  manualStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 10,
  },
  manualStartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  gestureHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  gestureHintText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});

export default ExerciseSessionScreenV2;
