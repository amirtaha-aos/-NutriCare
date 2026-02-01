import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { logExercise } from '../../store/slices/exerciseSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const EXERCISE_TYPES = [
  { value: 'running', label: 'Running', icon: 'run' },
  { value: 'walking', label: 'Walking', icon: 'walk' },
  { value: 'cycling', label: 'Cycling', icon: 'bike' },
  { value: 'swimming', label: 'Swimming', icon: 'swim' },
  { value: 'weightlifting', label: 'Weightlifting', icon: 'dumbbell' },
  { value: 'yoga', label: 'Yoga', icon: 'yoga' },
  { value: 'pilates', label: 'Pilates', icon: 'meditation' },
  { value: 'cardio', label: 'Cardio', icon: 'heart-pulse' },
  { value: 'sports', label: 'Sports', icon: 'basketball' },
  { value: 'other', label: 'Other', icon: 'dumbbell' },
];

const INTENSITY_LEVELS = [
  { value: 'low', label: 'Low', color: '#4CAF50' },
  { value: 'moderate', label: 'Moderate', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#EF4444' },
];

const LogExerciseScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.exercise);

  const [selectedType, setSelectedType] = useState('running');
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter exercise name');
      return;
    }

    if (!duration || parseInt(duration) <= 0) {
      Alert.alert('Error', 'Please enter valid duration');
      return;
    }

    try {
      await dispatch(
        logExercise({
          type: selectedType,
          name: name.trim(),
          duration: parseInt(duration),
          intensity,
          distance: distance ? parseFloat(distance) : undefined,
          notes: notes.trim() || undefined,
        })
      ).unwrap();

      Alert.alert('Success', 'Exercise logged successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to log exercise');
    }
  };

  const selectedTypeData = EXERCISE_TYPES.find((t) => t.value === selectedType);

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
            <Icon name="plus-circle" size={32} color="#4CAF50" />
          </View>
          <Text style={styles.headerTitle}>Log Exercise</Text>
          <Text style={styles.headerSubtitle}>Track your workout activity</Text>
        </Animated.View>

        {/* Exercise Type Selection */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Exercise Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.typeScroll}>
              {EXERCISE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    selectedType === type.value && styles.typeButtonActive,
                  ]}
                  onPress={() => setSelectedType(type.value)}>
                  <View
                    style={[
                      styles.typeIconContainer,
                      selectedType === type.value && styles.typeIconContainerActive,
                    ]}>
                    <Icon
                      name={type.icon}
                      size={24}
                      color={selectedType === type.value ? '#fff' : '#4CAF50'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === type.value && styles.typeButtonTextActive,
                    ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </GlassCard>
        </Animated.View>

        {/* Exercise Details */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Exercise Details</Text>

            {/* Exercise Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Exercise Name *</Text>
              <TextInput
                style={styles.input}
                placeholder={`e.g., Morning ${selectedTypeData?.label || 'Run'}`}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Duration */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Duration (minutes) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 30"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Distance (Optional) */}
            {['running', 'walking', 'cycling', 'swimming'].includes(selectedType) && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Distance (km)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 5.0"
                  value={distance}
                  onChangeText={setDistance}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}
          </GlassCard>
        </Animated.View>

        {/* Intensity */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Intensity</Text>
            <View style={styles.intensityContainer}>
              {INTENSITY_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.intensityButton,
                    intensity === level.value && {
                      backgroundColor: `${level.color}20`,
                      borderColor: level.color,
                    },
                  ]}
                  onPress={() => setIntensity(level.value as any)}>
                  <View
                    style={[
                      styles.intensityDot,
                      { backgroundColor: level.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.intensityButtonText,
                      intensity === level.value && { color: level.color, fontWeight: '600' },
                    ]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Notes */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Add any notes about your workout..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </GlassCard>
        </Animated.View>

        {/* Submit Button */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}>
            <LinearGradient
              colors={isLoading ? ['#9CA3AF', '#9CA3AF'] : ['#4CAF50', '#66BB6A']}
              style={styles.submitButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="check-circle" size={22} color="#fff" />
                  <Text style={styles.submitButtonText}>Log Exercise</Text>
                </>
              )}
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
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 16,
  },
  typeScroll: {
    gap: 12,
    paddingRight: 16,
  },
  typeButton: {
    alignItems: 'center',
    minWidth: 80,
  },
  typeButtonActive: {
    // Active state handled in children
  },
  typeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeIconContainerActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#388E3C',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#1A1A2E',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  intensityContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  intensityButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  intensityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  intensityButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  textArea: {
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#1A1A2E',
    minHeight: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LogExerciseScreen;
