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
  Switch,
  StatusBar,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { generateMealPlan } from '../../store/slices/mealPlanSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';

type Props = {
  navigation: StackNavigationProp<any>;
};

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const GenerateMealPlanScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isGenerating } = useSelector((state: RootState) => state.mealPlan);

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('7');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('Iran');
  const [preferences, setPreferences] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    halal: false,
  });

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

  const handleTogglePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async () => {
    if (!budget || parseFloat(budget) <= 0) {
      Alert.alert('Error', 'Please enter a valid budget');
      return;
    }

    try {
      await dispatch(
        generateMealPlan({
          title: title.trim() || undefined,
          duration: parseInt(duration) || 7,
          budget: parseFloat(budget),
          location: location.trim() || 'Iran',
          preferences,
        })
      ).unwrap();

      Alert.alert('Success', 'Meal plan generated successfully!', [
        {
          text: 'View Plan',
          onPress: () => navigation.navigate('MealPlans'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to generate meal plan');
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.headerIcon}>
            <Icon name="chef-hat" size={32} color="#4CAF50" />
          </View>
          <Text style={styles.headerTitle}>Create Meal Plan</Text>
          <Text style={styles.headerSubtitle}>
            AI-powered meal planning tailored to your health, budget, and preferences
          </Text>
        </Animated.View>

        {/* Plan Title */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Icon name="pencil" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.sectionTitle}>Plan Title (Optional)</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g., My Weekly Plan"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9CA3AF"
            />
          </GlassCard>
        </Animated.View>

        {/* Duration */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Icon name="calendar-range" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.sectionTitle}>Duration (Days) *</Text>
            </View>
            <View style={styles.durationContainer}>
              {['3', '5', '7'].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.durationButton, duration === d && styles.durationButtonActive]}
                  onPress={() => setDuration(d)}
                >
                  <LinearGradient
                    colors={duration === d ? ['#4CAF50', '#66BB6A'] : ['transparent', 'transparent']}
                    style={styles.durationButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text
                      style={[
                        styles.durationButtonText,
                        duration === d && styles.durationButtonTextActive,
                      ]}
                    >
                      {d} Days
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Budget */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Icon name="cash" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.sectionTitle}>Weekly Budget (USD) *</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g., 100"
              value={budget}
              onChangeText={setBudget}
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.hint}>Enter your total weekly food budget in USD</Text>
          </GlassCard>
        </Animated.View>

        {/* Location */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Icon name="map-marker" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g., Iran, USA, UK"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.hint}>Helps with local food availability and pricing</Text>
          </GlassCard>
        </Animated.View>

        {/* Dietary Preferences */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Icon name="food-variant" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.sectionTitle}>Dietary Preferences</Text>
            </View>
            <View style={styles.preferencesContainer}>
              {[
                { key: 'vegetarian', label: 'Vegetarian', icon: 'leaf' },
                { key: 'vegan', label: 'Vegan', icon: 'sprout' },
                { key: 'glutenFree', label: 'Gluten-Free', icon: 'barley-off' },
                { key: 'dairyFree', label: 'Dairy-Free', icon: 'cow-off' },
                { key: 'halal', label: 'Halal', icon: 'food-halal' },
              ].map((pref) => (
                <View key={pref.key} style={styles.preferenceItem}>
                  <View style={styles.preferenceLeft}>
                    <View style={styles.preferenceIcon}>
                      <Icon name={pref.icon} size={20} color="#4CAF50" />
                    </View>
                    <Text style={styles.preferenceLabel}>{pref.label}</Text>
                  </View>
                  <Switch
                    value={preferences[pref.key as keyof typeof preferences]}
                    onValueChange={() =>
                      handleTogglePreference(pref.key as keyof typeof preferences)
                    }
                    trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
                    thumbColor={
                      preferences[pref.key as keyof typeof preferences] ? '#4CAF50' : '#f4f3f4'
                    }
                  />
                </View>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Generate Button */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            <LinearGradient
              colors={isGenerating ? ['#9CA3AF', '#9CA3AF'] : ['#4CAF50', '#66BB6A']}
              style={styles.generateButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isGenerating ? (
                <>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.generateButtonText}>Generating...</Text>
                </>
              ) : (
                <>
                  <Icon name="creation" size={24} color="#fff" />
                  <Text style={styles.generateButtonText}>Generate Meal Plan</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {isGenerating && (
            <View style={styles.generatingHintContainer}>
              <Icon name="information-outline" size={18} color="#388E3C" />
              <Text style={styles.generatingHint}>
                This may take 30-60 seconds. AI is creating your personalized meal plan...
              </Text>
            </View>
          )}
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
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  input: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  durationButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  durationButtonActive: {
    borderColor: '#4CAF50',
  },
  durationButtonGradient: {
    padding: 14,
    alignItems: 'center',
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  durationButtonTextActive: {
    color: '#fff',
  },
  preferencesContainer: {
    gap: 4,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.1)',
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  preferenceIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceLabel: {
    fontSize: 15,
    color: '#1A1A2E',
    fontWeight: '500',
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  generateButtonGradient: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  generatingHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  generatingHint: {
    fontSize: 14,
    color: '#388E3C',
    textAlign: 'center',
    flex: 1,
  },
});

export default GenerateMealPlanScreen;
