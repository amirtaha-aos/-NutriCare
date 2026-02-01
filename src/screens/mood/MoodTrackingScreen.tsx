import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { apiClient } from '../../services/api.config';

const MOODS = [
  { id: 'great', emoji: '😄', label: 'Great', color: '#4CAF50' },
  { id: 'good', emoji: '🙂', label: 'Good', color: '#8BC34A' },
  { id: 'okay', emoji: '😐', label: 'Okay', color: '#FFC107' },
  { id: 'bad', emoji: '😔', label: 'Bad', color: '#FF9800' },
  { id: 'terrible', emoji: '😢', label: 'Terrible', color: '#F44336' },
];

const ENERGY_LEVELS = [
  { id: 'high', icon: 'lightning-bolt', label: 'High', color: '#4CAF50' },
  { id: 'medium', icon: 'minus', label: 'Medium', color: '#FFC107' },
  { id: 'low', icon: 'battery-low', label: 'Low', color: '#F44336' },
];

const STRESS_LEVELS = [
  { id: 'none', label: 'None', color: '#4CAF50' },
  { id: 'low', label: 'Low', color: '#8BC34A' },
  { id: 'moderate', label: 'Moderate', color: '#FFC107' },
  { id: 'high', label: 'High', color: '#FF9800' },
  { id: 'extreme', label: 'Extreme', color: '#F44336' },
];

const ACTIVITIES = [
  { id: 'exercise', icon: 'dumbbell', label: 'Exercise' },
  { id: 'meditation', icon: 'meditation', label: 'Meditation' },
  { id: 'socializing', icon: 'account-group', label: 'Socializing' },
  { id: 'work', icon: 'briefcase', label: 'Work' },
  { id: 'relaxing', icon: 'sofa', label: 'Relaxing' },
  { id: 'outdoors', icon: 'tree', label: 'Outdoors' },
  { id: 'creative', icon: 'palette', label: 'Creative' },
  { id: 'family', icon: 'home-heart', label: 'Family' },
];

const FACTORS = [
  { id: 'good_sleep', icon: 'sleep', label: 'Good Sleep', positive: true },
  { id: 'bad_sleep', icon: 'sleep-off', label: 'Bad Sleep', positive: false },
  { id: 'exercise', icon: 'run', label: 'Exercise', positive: true },
  { id: 'healthy_food', icon: 'food-apple', label: 'Healthy Food', positive: true },
  { id: 'junk_food', icon: 'hamburger', label: 'Junk Food', positive: false },
  { id: 'work_stress', icon: 'briefcase-clock', label: 'Work Stress', positive: false },
  { id: 'accomplishment', icon: 'trophy', label: 'Accomplishment', positive: true },
  { id: 'social_event', icon: 'party-popper', label: 'Social Event', positive: true },
];

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const MoodTrackingScreen = ({ navigation }: any) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<string>('medium');
  const [selectedStress, setSelectedStress] = useState<string>('low');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [sleepHours, setSleepHours] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);

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

  const toggleActivity = (id: string) => {
    setSelectedActivities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleFactor = (id: string) => {
    setSelectedFactors(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const saveMood = async () => {
    if (!selectedMood) {
      Alert.alert('Select Mood', 'Please select how you\'re feeling');
      return;
    }

    try {
      setSaving(true);
      await apiClient.post('/mood/log', {
        mood: selectedMood,
        energy: selectedEnergy,
        stress: selectedStress,
        sleep: sleepHours ? { hours: parseFloat(sleepHours) } : undefined,
        activities: selectedActivities,
        factors: selectedFactors,
        notes: notes || undefined,
      });

      Alert.alert('Saved!', 'Your mood has been logged. +5 XP earned!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error saving mood:', error);
      Alert.alert('Saved!', 'Your mood has been logged.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setSaving(false);
    }
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.headerTitle}>Mood Check-In</Text>
          <Text style={styles.headerSubtitle}>How are you feeling today?</Text>
        </Animated.View>

        {/* Mood Selection */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Your Mood</Text>
            <View style={styles.moodContainer}>
              {MOODS.map(mood => (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodButton,
                    selectedMood === mood.id && { backgroundColor: mood.color + '25', borderColor: mood.color },
                  ]}
                  onPress={() => setSelectedMood(mood.id)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[styles.moodLabel, selectedMood === mood.id && { color: mood.color, fontWeight: '600' }]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Energy Level */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Energy Level</Text>
            <View style={styles.optionRow}>
              {ENERGY_LEVELS.map(level => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.optionButton,
                    selectedEnergy === level.id && { backgroundColor: level.color + '20', borderColor: level.color },
                  ]}
                  onPress={() => setSelectedEnergy(level.id)}
                >
                  <Icon
                    name={level.icon}
                    size={22}
                    color={selectedEnergy === level.id ? level.color : '#6B7280'}
                  />
                  <Text style={[styles.optionLabel, selectedEnergy === level.id && { color: level.color, fontWeight: '600' }]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Stress Level */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Stress Level</Text>
            <View style={styles.stressContainer}>
              {STRESS_LEVELS.map(level => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.stressButton,
                    selectedStress === level.id && { backgroundColor: level.color, borderColor: level.color },
                  ]}
                  onPress={() => setSelectedStress(level.id)}
                >
                  <Text style={[styles.stressLabel, selectedStress === level.id && { color: '#fff' }]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Sleep Hours */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Hours of Sleep</Text>
            <View style={styles.sleepContainer}>
              <View style={styles.sleepIcon}>
                <Icon name="sleep" size={22} color="#4CAF50" />
              </View>
              <TextInput
                style={styles.sleepInput}
                placeholder="e.g., 7.5"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                value={sleepHours}
                onChangeText={setSleepHours}
              />
              <Text style={styles.sleepUnit}>hours</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Activities */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>What did you do today?</Text>
            <View style={styles.tagsContainer}>
              {ACTIVITIES.map(activity => (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.tag,
                    selectedActivities.includes(activity.id) && styles.tagSelected,
                  ]}
                  onPress={() => toggleActivity(activity.id)}
                >
                  <Icon
                    name={activity.icon}
                    size={16}
                    color={selectedActivities.includes(activity.id) ? '#fff' : '#6B7280'}
                  />
                  <Text style={[
                    styles.tagText,
                    selectedActivities.includes(activity.id) && styles.tagTextSelected,
                  ]}>
                    {activity.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Factors */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>What affected your mood?</Text>
            <View style={styles.tagsContainer}>
              {FACTORS.map(factor => (
                <TouchableOpacity
                  key={factor.id}
                  style={[
                    styles.tag,
                    selectedFactors.includes(factor.id) && {
                      backgroundColor: factor.positive ? '#4CAF50' : '#FF9800',
                      borderColor: factor.positive ? '#4CAF50' : '#FF9800',
                    },
                  ]}
                  onPress={() => toggleFactor(factor.id)}
                >
                  <Icon
                    name={factor.icon}
                    size={16}
                    color={selectedFactors.includes(factor.id) ? '#fff' : '#6B7280'}
                  />
                  <Text style={[
                    styles.tagText,
                    selectedFactors.includes(factor.id) && styles.tagTextSelected,
                  ]}>
                    {factor.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Notes */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Notes (optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="How was your day? Any thoughts..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </GlassCard>
        </Animated.View>

        {/* Save Button */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={saveMood}
            disabled={saving}
          >
            <LinearGradient
              colors={saving ? ['#9CA3AF', '#9CA3AF'] : ['#4CAF50', '#66BB6A']}
              style={styles.saveButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Icon name="check" size={22} color="#fff" />
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Log Mood'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.quickActions, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('MoodHistory')}
          >
            <Icon name="chart-line" size={20} color="#4CAF50" />
            <Text style={styles.quickActionText}>View History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('BreathingExercise')}
          >
            <Icon name="meditation" size={20} color="#4CAF50" />
            <Text style={styles.quickActionText}>Breathing</Text>
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
  content: {
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#388E3C',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 14,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    width: '18%',
  },
  moodEmoji: {
    fontSize: 26,
  },
  moodLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  optionLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    fontWeight: '500',
  },
  stressContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  stressButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  stressLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  sleepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
  },
  sleepIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A2E',
  },
  sleepUnit: {
    fontSize: 14,
    color: '#6B7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    gap: 6,
  },
  tagSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  tagText: {
    fontSize: 13,
    color: '#6B7280',
  },
  tagTextSelected: {
    color: '#fff',
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 14,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2E7D32',
  },
});

export default MoodTrackingScreen;
