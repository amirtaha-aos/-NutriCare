import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Button, Card } from '../../components';
import { nutritionService } from '../../services';
import { AIAnalysisResponse } from '../../types';
import { theme } from '../../theme';

const ScanFoodScreen: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResponse | null>(null);

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
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.placeholder}>
            <Icon name="camera-alt" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Take Photo"
          onPress={handleTakePhoto}
          variant="secondary"
          style={styles.button}
        />
        <Button
          title="Choose from Gallery"
          onPress={handleChoosePhoto}
          variant="outline"
          style={styles.button}
        />
      </View>

      {imageUri && (
        <Button
          title="Analyze Food"
          onPress={handleAnalyze}
          loading={isAnalyzing}
          style={styles.analyzeButton}
        />
      )}

      {analysisResult && (
        <Card>
          <Text style={styles.resultTitle}>Analysis Results</Text>

          <View style={styles.totalNutrition}>
            <Text style={styles.totalLabel}>Total Nutrition</Text>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionItem}>
                Calories: {analysisResult.totalNutrition.calories} kcal
              </Text>
              <Text style={styles.nutritionItem}>
                Protein: {analysisResult.totalNutrition.protein}g
              </Text>
            </View>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionItem}>
                Carbs: {analysisResult.totalNutrition.carbs}g
              </Text>
              <Text style={styles.nutritionItem}>Fats: {analysisResult.totalNutrition.fats}g</Text>
            </View>
          </View>

          {analysisResult.foodItems.length > 0 && (
            <View style={styles.foodItems}>
              <Text style={styles.foodItemsTitle}>Detected Foods</Text>
              {analysisResult.foodItems.map((item, index) => (
                <View key={index} style={styles.foodItem}>
                  <Text style={styles.foodItemName}>
                    {item.name} - {item.estimatedAmount}
                  </Text>
                  <Text style={styles.foodItemConfidence}>
                    Confidence: {(item.confidence * 100).toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          )}

          {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
            <View style={styles.recommendations}>
              <Text style={styles.recommendationsTitle}>Recommendations</Text>
              {analysisResult.recommendations.map((rec, index) => (
                <Text key={index} style={styles.recommendation}>
                  • {rec}
                </Text>
              ))}
            </View>
          )}
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    padding: theme.spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  button: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  analyzeButton: {
    marginBottom: theme.spacing.md,
  },
  resultTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  totalNutrition: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.xs,
  },
  nutritionItem: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  foodItems: {
    marginBottom: theme.spacing.md,
  },
  foodItemsTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  foodItem: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  foodItemName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  foodItemConfidence: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  recommendations: {
    marginTop: theme.spacing.md,
  },
  recommendationsTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  recommendation: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.xs,
  },
});

export default ScanFoodScreen;
