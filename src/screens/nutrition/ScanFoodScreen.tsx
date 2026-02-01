import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Animated,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { nutritionService } from '../../services';
import { AIAnalysisResponse } from '../../types';

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const ScanFoodScreen: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResponse | null>(null);

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

  const handleTakePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
      setAnalysisResult(null);
    }
  };

  const handleChoosePhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await nutritionService.analyzeFoodWithAI({ imageUri });
      setAnalysisResult(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze food image');
    } finally {
      setIsAnalyzing(false);
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
            <Icon name="camera-iris" size={32} color="#4CAF50" />
          </View>
          <Text style={styles.headerTitle}>Scan Food</Text>
          <Text style={styles.headerSubtitle}>AI-powered nutrition analysis</Text>
        </Animated.View>

        {/* Image Container */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard style={styles.imageCard}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={styles.placeholder}>
                <View style={styles.placeholderIcon}>
                  <Icon name="camera-plus" size={48} color="#81C784" />
                </View>
                <Text style={styles.placeholderText}>No image selected</Text>
                <Text style={styles.placeholderSubtext}>Take a photo or choose from gallery</Text>
              </View>
            )}
          </GlassCard>
        </Animated.View>

        {/* Button Container */}
        <Animated.View style={[styles.buttonRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
            <View style={styles.actionButtonIcon}>
              <Icon name="camera" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.actionButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleChoosePhoto}>
            <View style={styles.actionButtonIcon}>
              <Icon name="image" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.actionButtonText}>Gallery</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Analyze Button */}
        {imageUri && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
              onPress={handleAnalyze}
              disabled={isAnalyzing}>
              <LinearGradient
                colors={isAnalyzing ? ['#9CA3AF', '#9CA3AF'] : ['#4CAF50', '#66BB6A']}
                style={styles.analyzeButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                {isAnalyzing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="brain" size={24} color="#fff" />
                    <Text style={styles.analyzeButtonText}>Analyze with AI</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Total Nutrition */}
            <GlassCard>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Icon name="nutrition" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.sectionTitle}>Total Nutrition</Text>
              </View>

              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{analysisResult.totalNutrition.calories}</Text>
                  <Text style={styles.nutritionLabel}>kcal</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{analysisResult.totalNutrition.protein}g</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{analysisResult.totalNutrition.carbs}g</Text>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{analysisResult.totalNutrition.fats}g</Text>
                  <Text style={styles.nutritionLabel}>Fats</Text>
                </View>
              </View>
            </GlassCard>

            {/* Detected Foods */}
            {analysisResult.foodItems.length > 0 && (
              <GlassCard>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: 'rgba(102, 187, 106, 0.15)' }]}>
                    <Icon name="food-apple" size={20} color="#66BB6A" />
                  </View>
                  <Text style={styles.sectionTitle}>Detected Foods</Text>
                </View>

                {analysisResult.foodItems.map((item, index) => (
                  <View key={index} style={styles.foodItem}>
                    <View style={styles.foodItemLeft}>
                      <Text style={styles.foodItemName}>{item.name}</Text>
                      <Text style={styles.foodItemAmount}>{item.estimatedAmount}</Text>
                    </View>
                    <View style={[styles.confidenceBadge, { opacity: item.confidence }]}>
                      <Text style={styles.confidenceText}>
                        {(item.confidence * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </GlassCard>
            )}

            {/* Recommendations */}
            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <GlassCard>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <Icon name="lightbulb-outline" size={20} color="#3B82F6" />
                  </View>
                  <Text style={styles.sectionTitle}>Recommendations</Text>
                </View>

                {analysisResult.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Icon name="check-circle" size={18} color="#4CAF50" />
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </GlassCard>
            )}
          </Animated.View>
        )}

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
  imageCard: {
    padding: 0,
    overflow: 'hidden',
    height: 250,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderIcon: {
    width: 90,
    height: 90,
    borderRadius: 25,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
  },
  actionButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  analyzeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
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
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.1)',
  },
  foodItemLeft: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E7D32',
  },
  foodItemAmount: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  confidenceBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A2E',
    lineHeight: 20,
  },
});

export default ScanFoodScreen;
