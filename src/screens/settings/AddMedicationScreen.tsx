import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
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

const AddMedicationScreen = ({ navigation, route }: any) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
    'Before meals',
    'After meals',
    'At bedtime',
  ];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter medication name');
      return;
    }
    if (!dosage.trim()) {
      Alert.alert('Error', 'Please enter dosage');
      return;
    }
    if (!frequency.trim()) {
      Alert.alert('Error', 'Please select frequency');
      return;
    }

    setLoading(true);
    try {
      const medicationData = {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency,
        startDate: startDate.toISOString(),
        ...(hasEndDate && endDate && { endDate: endDate.toISOString() }),
        ...(notes.trim() && { notes: notes.trim() }),
      };

      await apiClient.post('/health/medication', medicationData);

      Alert.alert('Success', 'Medication added successfully', [
        {
          text: 'OK',
          onPress: () => {
            route.params?.onSuccess?.();
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error adding medication:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add medication');
    } finally {
      setLoading(false);
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerIcon}>
            <Icon name="pill" size={32} color="#EF4444" />
          </View>
          <Text style={styles.headerTitle}>Add Medication</Text>
          <Text style={styles.headerSubtitle}>Track your medications</Text>
        </Animated.View>

        {/* Medication Information */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Medication Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medication Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Metformin"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dosage *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 500mg, 10ml"
                value={dosage}
                onChangeText={setDosage}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Frequency *</Text>
              <View style={styles.frequencyGrid}>
                {frequencyOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.frequencyOption,
                      frequency === option && styles.frequencyOptionSelected,
                    ]}
                    onPress={() => setFrequency(option)}>
                    <Text
                      style={[
                        styles.frequencyText,
                        frequency === option && styles.frequencyTextSelected,
                      ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Schedule */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Schedule</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Start Date *</Text>
              <View style={styles.dateButton}>
                <View style={styles.dateIcon}>
                  <Icon name="calendar" size={18} color="#4CAF50" />
                </View>
                <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
              </View>
              <Text style={styles.helperText}>Started today</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => {
                    setHasEndDate(!hasEndDate);
                    if (hasEndDate) {
                      setEndDate(null);
                    } else {
                      setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
                    }
                  }}>
                  <Icon
                    name={hasEndDate ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={24}
                    color="#4CAF50"
                  />
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Set end date (30 days from now)</Text>
              </View>

              {hasEndDate && endDate && (
                <View style={styles.dateButton}>
                  <View style={styles.dateIcon}>
                    <Icon name="calendar" size={18} color="#4CAF50" />
                  </View>
                  <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
                </View>
              )}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Additional Notes */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Any special instructions or notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </GlassCard>
        </Animated.View>

        {/* Save Button */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}>
            <LinearGradient
              colors={loading ? ['#9CA3AF', '#9CA3AF'] : ['#4CAF50', '#66BB6A']}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="check" size={22} color="#fff" />
                  <Text style={styles.saveButtonText}>Add Medication</Text>
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
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#388E3C',
    marginBottom: 10,
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
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  frequencyOptionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  frequencyText: {
    fontSize: 13,
    color: '#388E3C',
  },
  frequencyTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dateIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 15,
    color: '#1A1A2E',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#1A1A2E',
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
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddMedicationScreen;
