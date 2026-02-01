import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFS from 'react-native-fs';
import Tts from 'react-native-tts';
import apiClient from '../../services/api.config';

const { width, height } = Dimensions.get('window');

interface GestureInfo {
  gesture: string;
  action: string;
  icon: string;
  description: string;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
}

// Sample tracks for demo
const DEMO_TRACKS: Track[] = [
  { id: '1', title: 'Summer Vibes', artist: 'DJ Chill', duration: 180 },
  { id: '2', title: 'Night Drive', artist: 'Synthwave Master', duration: 210 },
  { id: '3', title: 'Morning Coffee', artist: 'Jazz Trio', duration: 195 },
  { id: '4', title: 'Workout Energy', artist: 'Bass Drop', duration: 165 },
  { id: '5', title: 'Sunset Dreams', artist: 'Ambient Flow', duration: 240 },
];

const GestureMusicScreen: React.FC = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const cameraRef = useRef<Camera>(null);

  // Music state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [progress, setProgress] = useState(0);

  // Gesture state
  const [currentGesture, setCurrentGesture] = useState<string>('none');
  const [lastAction, setLastAction] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gestureList, setGestureList] = useState<GestureInfo[]>([]);
  const [showGuide, setShowGuide] = useState(true);

  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const actionFadeAnim = useRef(new Animated.Value(0)).current;

  // Analysis interval
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
    loadGestures();
    initTts();

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
      Tts.stop();
    };
  }, []);

  // Simulate music progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1;
          if (newProgress >= DEMO_TRACKS[currentTrackIndex].duration) {
            handleNextTrack();
            return 0;
          }
          return newProgress;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrackIndex]);

  const initTts = () => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.5);
  };

  const speak = (text: string) => {
    Tts.stop();
    Tts.speak(text);
  };

  const loadGestures = async () => {
    try {
      const response = await apiClient.get('/gesture-music/gestures');
      if (response.data.success) {
        setGestureList(response.data.data);
      }
    } catch (error) {
      console.error('Error loading gestures:', error);
      // Set default gestures
      setGestureList([
        { gesture: 'fist', action: 'play', icon: '✊', description: 'Make a fist to play/resume' },
        { gesture: 'open_palm', action: 'pause', icon: '✋', description: 'Open palm to pause' },
        { gesture: 'point_right', action: 'next', icon: '👉', description: 'Point right for next track' },
        { gesture: 'point_left', action: 'previous', icon: '👈', description: 'Point left for previous track' },
        { gesture: 'thumbs_up', action: 'volume_up', icon: '👍', description: 'Thumbs up to increase volume' },
        { gesture: 'thumbs_down', action: 'volume_down', icon: '👎', description: 'Thumbs down to decrease volume' },
      ]);
    }
  };

  const photoToBase64 = async (photo: any): Promise<string> => {
    const filePath = photo.path;
    const base64 = await RNFS.readFile(filePath, 'base64');
    await RNFS.unlink(filePath);
    return base64;
  };

  const startGestureDetection = () => {
    setShowGuide(false);
    speak('Gesture detection started. Show your hand to control music.');

    analysisIntervalRef.current = setInterval(() => {
      analyzeGesture();
    }, 500);
  };

  const stopGestureDetection = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    setCurrentGesture('none');
    speak('Gesture detection stopped.');
  };

  const analyzeGesture = async () => {
    if (!cameraRef.current || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      const photo = await cameraRef.current.takePhoto();
      const base64 = await photoToBase64(photo);

      const response = await apiClient.post('/gesture-music/analyze', {
        frame: base64,
      });

      if (response.data.success) {
        const { gesture, action, message } = response.data.data;
        setCurrentGesture(gesture);

        if (action) {
          executeAction(action, message);
        }
      }
    } catch (error) {
      console.error('Gesture analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const executeAction = (action: string, message: string) => {
    setLastAction(message);
    showActionAnimation();

    switch (action) {
      case 'play':
        handlePlay();
        break;
      case 'pause':
        handlePause();
        break;
      case 'next':
        handleNextTrack();
        break;
      case 'previous':
        handlePreviousTrack();
        break;
      case 'volume_up':
        handleVolumeUp();
        break;
      case 'volume_down':
        handleVolumeDown();
        break;
      case 'shuffle':
        handleShuffle();
        break;
      case 'repeat':
        handleRepeat();
        break;
    }
  };

  const showActionAnimation = () => {
    actionFadeAnim.setValue(1);
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(actionFadeAnim, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  };

  const handlePlay = () => {
    setIsPlaying(true);
    speak('Playing');
  };

  const handlePause = () => {
    setIsPlaying(false);
    speak('Paused');
  };

  const handleNextTrack = () => {
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * DEMO_TRACKS.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % DEMO_TRACKS.length;
    }
    setCurrentTrackIndex(nextIndex);
    setProgress(0);
    speak(`Now playing ${DEMO_TRACKS[nextIndex].title}`);
  };

  const handlePreviousTrack = () => {
    const prevIndex = currentTrackIndex === 0 ? DEMO_TRACKS.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setProgress(0);
    speak(`Now playing ${DEMO_TRACKS[prevIndex].title}`);
  };

  const handleVolumeUp = () => {
    setVolume(prev => Math.min(100, prev + 10));
    speak('Volume up');
  };

  const handleVolumeDown = () => {
    setVolume(prev => Math.max(0, prev - 10));
    speak('Volume down');
  };

  const handleShuffle = () => {
    setIsShuffle(!isShuffle);
    speak(isShuffle ? 'Shuffle off' : 'Shuffle on');
  };

  const handleRepeat = () => {
    setIsRepeat(!isRepeat);
    speak(isRepeat ? 'Repeat off' : 'Repeat on');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTrack = DEMO_TRACKS[currentTrackIndex];

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera permission required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No camera device found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={true}
          photo={true}
        />

        {/* Gesture Indicator */}
        <Animated.View style={[styles.gestureIndicator, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.gestureIcon}>
            {gestureList.find(g => g.gesture === currentGesture)?.icon || '👋'}
          </Text>
          <Text style={styles.gestureText}>{currentGesture.replace('_', ' ').toUpperCase()}</Text>
        </Animated.View>

        {/* Action Feedback */}
        <Animated.View style={[styles.actionFeedback, { opacity: actionFadeAnim }]}>
          <Text style={styles.actionText}>{lastAction}</Text>
        </Animated.View>
      </View>

      {/* Music Player UI */}
      <View style={styles.playerContainer}>
        {/* Track Info */}
        <View style={styles.trackInfo}>
          <View style={styles.albumArt}>
            <Icon name="music-note" size={40} color="#4CAF50" />
          </View>
          <View style={styles.trackDetails}>
            <Text style={styles.trackTitle}>{currentTrack.title}</Text>
            <Text style={styles.trackArtist}>{currentTrack.artist}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressTime}>{formatTime(progress)}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(progress / currentTrack.duration) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressTime}>{formatTime(currentTrack.duration)}</Text>
        </View>

        {/* Volume */}
        <View style={styles.volumeContainer}>
          <Icon name="volume-low" size={20} color="#888" />
          <View style={styles.volumeBar}>
            <View style={[styles.volumeFill, { width: `${volume}%` }]} />
          </View>
          <Icon name="volume-high" size={20} color="#888" />
          <Text style={styles.volumeText}>{volume}%</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isShuffle && styles.activeControl]}
            onPress={handleShuffle}>
            <Icon name="shuffle-variant" size={24} color={isShuffle ? '#4CAF50' : '#fff'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handlePreviousTrack}>
            <Icon name="skip-previous" size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={() => isPlaying ? handlePause() : handlePlay()}>
            <Icon name={isPlaying ? 'pause' : 'play'} size={40} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleNextTrack}>
            <Icon name="skip-next" size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isRepeat && styles.activeControl]}
            onPress={handleRepeat}>
            <Icon name="repeat" size={24} color={isRepeat ? '#4CAF50' : '#fff'} />
          </TouchableOpacity>
        </View>

        {/* Gesture Control Button */}
        <TouchableOpacity
          style={[styles.gestureButton, analysisIntervalRef.current && styles.gestureButtonActive]}
          onPress={() => analysisIntervalRef.current ? stopGestureDetection() : startGestureDetection()}>
          <Icon
            name={analysisIntervalRef.current ? 'hand-back-left-off' : 'hand-back-left'}
            size={24}
            color="#fff"
          />
          <Text style={styles.gestureButtonText}>
            {analysisIntervalRef.current ? 'Stop Gesture Control' : 'Start Gesture Control'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Gesture Guide */}
      {showGuide && (
        <View style={styles.guideOverlay}>
          <View style={styles.guideContainer}>
            <Text style={styles.guideTitle}>Gesture Controls</Text>
            <ScrollView style={styles.guideScroll}>
              {gestureList.map((item, index) => (
                <View key={index} style={styles.guideItem}>
                  <Text style={styles.guideIcon}>{item.icon}</Text>
                  <View style={styles.guideTextContainer}>
                    <Text style={styles.guideAction}>{item.action.replace('_', ' ').toUpperCase()}</Text>
                    <Text style={styles.guideDescription}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.guideButton} onPress={() => setShowGuide(false)}>
              <Text style={styles.guideButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 50,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cameraContainer: {
    height: height * 0.35,
    position: 'relative',
  },
  camera: {
    flex: 1,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  gestureIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 100,
  },
  gestureIcon: {
    fontSize: 32,
  },
  gestureText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
    fontWeight: 'bold',
  },
  actionFeedback: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  actionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerContainer: {
    flex: 1,
    padding: 20,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  albumArt: {
    width: 70,
    height: 70,
    backgroundColor: '#2d2d44',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackDetails: {
    marginLeft: 15,
    flex: 1,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  trackArtist: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressTime: {
    color: '#888',
    fontSize: 12,
    width: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#2d2d44',
    borderRadius: 2,
    marginHorizontal: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  volumeBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#2d2d44',
    borderRadius: 2,
    marginHorizontal: 10,
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  volumeText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 10,
    width: 35,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  controlButton: {
    padding: 15,
  },
  activeControl: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 20,
  },
  playButton: {
    width: 70,
    height: 70,
    backgroundColor: '#4CAF50',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  gestureButton: {
    flexDirection: 'row',
    backgroundColor: '#2d2d44',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gestureButtonActive: {
    backgroundColor: '#4CAF50',
  },
  gestureButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  guideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideContainer: {
    backgroundColor: '#2d2d44',
    borderRadius: 20,
    padding: 20,
    width: width * 0.85,
    maxHeight: height * 0.7,
  },
  guideTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  guideScroll: {
    maxHeight: height * 0.45,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d54',
  },
  guideIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  guideTextContainer: {
    flex: 1,
  },
  guideAction: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 14,
  },
  guideDescription: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  guideButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  guideButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GestureMusicScreen;
