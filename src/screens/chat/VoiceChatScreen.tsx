import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
  ActivityIndicator,
  Vibration,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Tts from 'react-native-tts';
import { apiClient } from '../../services/api.config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

const VoiceChatScreen: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    initTts();
    createSession();

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
      Tts.stop();
    };
  }, []);

  const initTts = async () => {
    try {
      await Tts.setDefaultLanguage('en-US');
      await Tts.setDefaultRate(0.5);
      await Tts.setDefaultPitch(1.0);

      Tts.addEventListener('tts-start', () => setIsSpeaking(true));
      Tts.addEventListener('tts-finish', () => setIsSpeaking(false));
      Tts.addEventListener('tts-cancel', () => setIsSpeaking(false));
    } catch (error) {
      console.error('TTS init error:', error);
    }
  };

  const createSession = async () => {
    try {
      const response = await apiClient.post('/chat/session', {
        title: 'Voice Chat',
      });
      if (response.data.success) {
        setSessionId(response.data.session._id);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    waveAnim.stopAnimation();
    pulseAnim.setValue(1);
    waveAnim.setValue(0);
  };

  const handleMicPress = async () => {
    if (isRecording) {
      setIsRecording(false);
      stopPulseAnimation();
      Vibration.vibrate(50);

      Alert.prompt(
        'Voice Input',
        'Enter your message (simulating voice):',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Send',
            onPress: (text) => {
              if (text && text.trim()) {
                sendVoiceMessage(text.trim());
              }
            },
          },
        ],
        'plain-text'
      );
    } else {
      setIsRecording(true);
      startPulseAnimation();
      Vibration.vibrate(100);
    }
  };

  const sendVoiceMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      isVoice: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const response = await apiClient.post('/chat/voice', {
        transcribedText: text,
        sessionId,
      });

      if (response.data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date(),
          isVoice: true,
        };

        setMessages(prev => [...prev, aiMessage]);
        speakResponse(response.data.message);
      }
    } catch (error) {
      console.error('Voice chat error:', error);
      Alert.alert('Error', 'Failed to process voice message');
    } finally {
      setIsProcessing(false);
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const speakResponse = (text: string) => {
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/`/g, '')
      .substring(0, 500);

    Tts.speak(cleanText);
  };

  const stopSpeaking = () => {
    Tts.stop();
    setIsSpeaking(false);
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          {message.isVoice && (
            <View style={styles.voiceIndicator}>
              <Icon name="microphone" size={14} color={isUser ? '#fff' : '#4CAF50'} />
            </View>
          )}
          <Text style={[styles.messageText, isUser && styles.userText]}>
            {message.content}
          </Text>
          {!isUser && (
            <TouchableOpacity
              style={styles.speakButton}
              onPress={() => speakResponse(message.content)}>
              <Icon name="volume-high" size={18} color="#4CAF50" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
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

      {/* Header */}
      <Animated.View
        style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.headerIcon}>
          <Icon name="robot" size={26} color="#4CAF50" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Voice Assistant</Text>
          <Text style={styles.headerSubtitle}>
            {isRecording ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Tap to speak'}
          </Text>
        </View>
        {isSpeaking && (
          <TouchableOpacity style={styles.stopButton} onPress={stopSpeaking}>
            <Icon name="stop" size={22} color="#EF4444" />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
        {messages.length === 0 ? (
          <Animated.View
            style={[styles.emptyState, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.emptyIcon}>
              <Icon name="microphone-outline" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.emptyTitle}>Voice Chat Ready</Text>
            <Text style={styles.emptySubtitle}>
              Tap the microphone and speak your question about nutrition, health, or fitness
            </Text>
          </Animated.View>
        ) : (
          messages.map(renderMessage)
        )}

        {isProcessing && (
          <View style={[styles.messageContainer, styles.assistantMessage]}>
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.thinkingText}>Thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Voice Control */}
      <Animated.View
        style={[styles.voiceControl, { opacity: fadeAnim }]}>
        {/* Wave Animation */}
        {isRecording && (
          <View style={styles.waveContainer}>
            {[...Array(5)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveLine,
                  {
                    transform: [
                      {
                        scaleY: waveAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.3, 1 + Math.random() * 0.5],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        )}

        {/* Mic Button */}
        <TouchableOpacity
          style={styles.micButtonContainer}
          onPress={handleMicPress}
          disabled={isProcessing}
          activeOpacity={0.8}>
          <Animated.View
            style={[
              styles.micButtonOuter,
              isRecording && styles.micButtonRecording,
              { transform: [{ scale: pulseAnim }] },
            ]}>
            <LinearGradient
              colors={isRecording ? ['#EF4444', '#DC2626'] : ['#4CAF50', '#66BB6A']}
              style={styles.micButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              {isProcessing ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <Icon
                  name={isRecording ? 'stop' : 'microphone'}
                  size={36}
                  color="#fff"
                />
              )}
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>

        <Text style={styles.micHint}>
          {isRecording
            ? 'Tap to stop recording'
            : isProcessing
            ? 'Processing...'
            : 'Tap to start speaking'}
        </Text>
      </Animated.View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#388E3C',
    marginTop: 2,
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  messageContainer: {
    marginVertical: 6,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
  },
  voiceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#1A1A2E',
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  speakButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  thinkingText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  voiceControl: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(76, 175, 80, 0.15)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginBottom: 16,
    gap: 4,
  },
  waveLine: {
    width: 4,
    height: 30,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  micButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonOuter: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  micButtonRecording: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  micButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micHint: {
    marginTop: 14,
    fontSize: 14,
    color: '#6B7280',
  },
});

export default VoiceChatScreen;
