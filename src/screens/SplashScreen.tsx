import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const subtitleFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations sequence
    Animated.sequence([
      // Logo fade in and scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Title fade in
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Subtitle fade in
      Animated.timing(subtitleFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after 3 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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
      <View style={styles.decorativeCircle3} />

      {/* Content */}
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          <View style={styles.logoBackground}>
            <Icon name="leaf" size={80} color="#4CAF50" />
          </View>
        </Animated.View>

        {/* Welcome Text */}
        <Animated.Text
          style={[
            styles.welcomeText,
            { opacity: textFadeAnim },
          ]}>
          Welcome to
        </Animated.Text>

        <Animated.Text
          style={[
            styles.appName,
            { opacity: textFadeAnim },
          ]}>
          NutriCare
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          style={[
            styles.subtitle,
            { opacity: subtitleFadeAnim },
          ]}>
          Your Personal Nutrition Assistant
        </Animated.Text>

        {/* Loading dots */}
        <Animated.View
          style={[
            styles.loadingContainer,
            { opacity: subtitleFadeAnim },
          ]}>
          <View style={styles.loadingDot} />
          <View style={[styles.loadingDot, styles.loadingDot2]} />
          <View style={[styles.loadingDot, styles.loadingDot3]} />
        </Animated.View>
      </View>

      {/* Bottom decoration */}
      <View style={styles.bottomDecoration}>
        <Icon name="food-apple" size={24} color="rgba(76, 175, 80, 0.3)" />
        <Icon name="carrot" size={24} color="rgba(76, 175, 80, 0.3)" />
        <Icon name="food-drumstick" size={24} color="rgba(76, 175, 80, 0.3)" />
      </View>
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
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    top: -100,
    right: -100,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(129, 199, 132, 0.1)',
    bottom: 100,
    left: -80,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    top: height * 0.4,
    right: -50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoBackground: {
    width: 140,
    height: 140,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  welcomeText: {
    fontSize: 22,
    color: '#388E3C',
    fontWeight: '400',
    marginBottom: 8,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 40,
  },
  loadingContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    opacity: 0.4,
  },
  loadingDot2: {
    opacity: 0.6,
  },
  loadingDot3: {
    opacity: 0.8,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
  },
});

export default SplashScreen;
