import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch } from '../../store/hooks';
import { addMeal } from '../../store/slices/nutritionSlice';
import { nutritionService } from '../../services';
import { FoodItem } from '../../types';
import { format } from 'date-fns';

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const AddMealScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();

  const mealType = (route.params as any)?.mealType || 'snack';

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState('1');

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

  const getMealTypeIcon = () => {
    switch (mealType) {
      case 'breakfast':
        return 'coffee';
      case 'lunch':
        return 'food';
      case 'dinner':
        return 'food-variant';
      case 'snack':
        return 'cookie';
      default:
        return 'food-apple';
    }
  };

  const getMealTypeLabel = () => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await nutritionService.searchFoods(searchQuery);
      setSearchResults(results.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to search foods');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMeal = async () => {
    if (!selectedFood) {
      Alert.alert('Error', 'Please select a food item');
      return;
    }

    const servingsNum = parseFloat(servings);
    if (isNaN(servingsNum) || servingsNum <= 0) {
      Alert.alert('Error', 'Please enter a valid serving size');
      return;
    }

    try {
      await dispatch(
        addMeal({
          foodId: selectedFood.id,
          servings: servingsNum,
          mealType: mealType as any,
          consumedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        })
      ).unwrap();

      Alert.alert('Success', 'Meal added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add meal');
    }
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => {
    const isSelected = selectedFood?.id === item.id;
    return (
      <TouchableOpacity onPress={() => setSelectedFood(item)}>
        <GlassCard style={[styles.foodCard, isSelected && styles.selectedFoodCard]}>
          <View style={styles.foodHeader}>
            <Text style={styles.foodName}>{item.name}</Text>
            {isSelected && (
              <Icon name="check-circle" size={22} color="#4CAF50" />
            )}
          </View>

          {item.description && (
            <Text style={styles.foodDescription}>{item.description}</Text>
          )}

          <View style={styles.nutritionInfo}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{item.nutrition.calories}</Text>
              <Text style={styles.nutritionLabel}>kcal</Text>
            </View>
            <View style={styles.nutritionDivider} />
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{item.nutrition.protein}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionDivider} />
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{item.nutrition.carbs}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionDivider} />
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{item.nutrition.fats}g</Text>
              <Text style={styles.nutritionLabel}>Fats</Text>
            </View>
          </View>

          <Text style={styles.servingSize}>
            Per {item.servingSize} {item.servingUnit}
          </Text>
        </GlassCard>
      </TouchableOpacity>
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
          <Icon name={getMealTypeIcon()} size={28} color="#4CAF50" />
        </View>
        <Text style={styles.headerTitle}>Add {getMealTypeLabel()}</Text>
        <Text style={styles.headerSubtitle}>Search and add food items</Text>
      </Animated.View>

      {/* Search Container */}
      <Animated.View
        style={[styles.searchContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <GlassCard style={styles.searchCard}>
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={22} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for food..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={styles.searchButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Icon name="magnify" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>
      </Animated.View>

      {/* Content */}
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Icon name="food-apple-outline" size={48} color="#81C784" />
              </View>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No foods found' : 'Search for a food to add'}
              </Text>
              <Text style={styles.emptySubtext}>
                Enter a food name and tap search
              </Text>
            </View>
          }
        />
      )}

      {/* Bottom Container */}
      {selectedFood && (
        <Animated.View style={[styles.bottomContainer, { opacity: fadeAnim }]}>
          <GlassCard style={styles.bottomCard}>
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedLabel}>Selected:</Text>
              <Text style={styles.selectedName}>{selectedFood.name}</Text>
            </View>

            <View style={styles.servingsRow}>
              <Text style={styles.servingsLabel}>Servings:</Text>
              <View style={styles.servingsInputContainer}>
                <TouchableOpacity
                  style={styles.servingsButton}
                  onPress={() => {
                    const val = Math.max(0.5, parseFloat(servings) - 0.5);
                    setServings(val.toString());
                  }}>
                  <Icon name="minus" size={20} color="#4CAF50" />
                </TouchableOpacity>
                <TextInput
                  style={styles.servingsInput}
                  value={servings}
                  onChangeText={setServings}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity
                  style={styles.servingsButton}
                  onPress={() => {
                    const val = parseFloat(servings) + 0.5;
                    setServings(val.toString());
                  }}>
                  <Icon name="plus" size={20} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddMeal}>
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <Icon name="plus" size={22} color="#fff" />
                <Text style={styles.addButtonText}>Add to {getMealTypeLabel()}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>
      )}
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
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#388E3C',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingLeft: 16,
    marginBottom: 0,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#1A1A2E',
    padding: 10,
  },
  searchButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    padding: 12,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#388E3C',
  },
  listContent: {
    padding: 16,
    paddingBottom: 200,
  },
  foodCard: {
    // Additional styles handled by GlassCard
  },
  selectedFoodCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    flex: 1,
  },
  foodDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  nutritionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  nutritionLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  nutritionDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  servingSize: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 10,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 25,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
  },
  bottomCard: {
    marginBottom: 0,
  },
  selectedInfo: {
    marginBottom: 12,
  },
  selectedLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  servingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  servingsLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  servingsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  servingsButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsInput: {
    width: 60,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  addButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddMealScreen;
