import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import apiClient from '../../services/api.config';

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const AddLabTestScreen = ({ navigation, route }: any) => {
  const [testType, setTestType] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
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

  const testTypes = [
    'Complete Blood Count (CBC)',
    'Lipid Panel',
    'Metabolic Panel',
    'Liver Function Test',
    'Kidney Function Test',
    'Thyroid Panel',
    'Vitamin D',
    'Hemoglobin A1c',
    'Urinalysis',
    'Other',
  ];

  const handleSelectImage = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => openCamera(),
        },
        {
          text: 'Choose from Library',
          onPress: () => openGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.8,
      },
      (response) => {
        handleImageResponse(response);
      }
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.8,
      },
      (response) => {
        handleImageResponse(response);
      }
    );
  };

  const handleImageResponse = (response: any) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      Alert.alert('Error', response.errorMessage || 'Failed to select image');
      return;
    }

    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      setImageUri(asset.uri || null);
      setImageBase64(asset.base64 || null);
    }
  };

  const handleAnalyze = async () => {
    if (!testType) {
      Alert.alert('Error', 'Please select test type');
      return;
    }

    if (!imageBase64) {
      Alert.alert('Error', 'Please select a lab test image');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/health/lab-test', {
        testType,
        imageBase64,
        notes: notes.trim(),
      });

      const { labTest } = response.data.data;

      Alert.alert(
        'Analysis Complete',
        'Your lab test has been analyzed successfully',
        [
          {
            text: 'View Results',
            onPress: () => {
              route.params?.onSuccess?.();
              navigation.replace('LabTestDetail', { labTest });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error analyzing lab test:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to analyze lab test');
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
            <Icon name="flask-plus" size={32} color="#4CAF50" />
          </View>
          <Text style={styles.headerTitle}>Add Lab Test</Text>
          <Text style={styles.headerSubtitle}>Upload and analyze your results</Text>
        </Animated.View>

        {/* Image Section */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Lab Test Image</Text>

            {imageUri ? (
              <View>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.changeImageButton} onPress={handleSelectImage}>
                  <Icon name="camera-flip" size={20} color="#4CAF50" />
                  <Text style={styles.changeImageText}>Change Image</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imageSelector} onPress={handleSelectImage}>
                <View style={styles.imageSelectorIcon}>
                  <Icon name="camera-plus" size={40} color="#4CAF50" />
                </View>
                <Text style={styles.imageSelectorText}>
                  Take photo or select from gallery
                </Text>
              </TouchableOpacity>
            )}
          </GlassCard>
        </Animated.View>

        {/* Test Info Section */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Test Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Test Type *</Text>
              <View style={styles.testTypeGrid}>
                {testTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.testTypeOption,
                      testType === type && styles.testTypeOptionSelected,
                    ]}
                    onPress={() => setTestType(type)}>
                    <Text
                      style={[
                        styles.testTypeText,
                        testType === type && styles.testTypeTextSelected,
                      ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Any additional information about this test..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Info Box */}
        <Animated.View style={[styles.infoBox, { opacity: fadeAnim }]}>
          <View style={styles.infoIcon}>
            <Icon name="information" size={18} color="#3B82F6" />
          </View>
          <Text style={styles.infoText}>
            Our AI will analyze your lab results and provide personalized insights,
            dietary recommendations, and health risk assessment based on your medical profile.
          </Text>
        </Animated.View>

        {/* Analyze Button */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={[styles.analyzeButton, loading && styles.analyzeButtonDisabled]}
            onPress={handleAnalyze}
            disabled={loading}>
            <LinearGradient
              colors={loading ? ['#9CA3AF', '#9CA3AF'] : ['#4CAF50', '#66BB6A']}
              style={styles.analyzeButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              {loading ? (
                <>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                </>
              ) : (
                <>
                  <Icon name="brain" size={22} color="#fff" />
                  <Text style={styles.analyzeButtonText}>Analyze with AI</Text>
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 16,
  },
  imageSelector: {
    height: 180,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  imageSelectorIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  imageSelectorText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    resizeMode: 'contain',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  changeImageText: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: '500',
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
  testTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  testTypeOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  testTypeOptionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  testTypeText: {
    fontSize: 13,
    color: '#388E3C',
  },
  testTypeTextSelected: {
    color: '#fff',
    fontWeight: '500',
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  analyzeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  analyzeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  analyzeButtonDisabled: {
    opacity: 0.7,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddLabTestScreen;
