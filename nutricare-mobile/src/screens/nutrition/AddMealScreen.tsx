import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Input, Button, Card } from '../../components';
import { useAppDispatch } from '../../store/hooks';
import { addMeal } from '../../store/slices/nutritionSlice';
import { nutritionService } from '../../services';
import { FoodItem } from '../../types';
import { theme } from '../../theme';
import { format } from 'date-fns';

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

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity onPress={() => setSelectedFood(item)}>
      <Card
        style={[styles.foodCard, selectedFood?.id === item.id && styles.selectedFoodCard]}>
        <Text style={styles.foodName}>{item.name}</Text>
        {item.description && <Text style={styles.foodDescription}>{item.description}</Text>}
        <View style={styles.nutritionInfo}>
          <Text style={styles.nutritionText}>{item.nutrition.calories} kcal</Text>
          <Text style={styles.nutritionText}>P: {item.nutrition.protein}g</Text>
          <Text style={styles.nutritionText}>C: {item.nutrition.carbs}g</Text>
          <Text style={styles.nutritionText}>F: {item.nutrition.fats}g</Text>
        </View>
        <Text style={styles.servingSize}>
          Per {item.servingSize} {item.servingUnit}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search for food..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          leftIcon="search"
          containerStyle={styles.searchInput}
        />
        <Button title="Search" onPress={handleSearch} size="medium" />
      </View>

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery ? 'No foods found' : 'Search for a food to add'}
            </Text>
          }
        />
      )}

      {selectedFood && (
        <View style={styles.bottomContainer}>
          <Input
            label="Servings"
            placeholder="Enter servings"
            value={servings}
            onChangeText={setServings}
            keyboardType="decimal-pad"
            containerStyle={styles.servingsInput}
          />
          <Button title="Add to Meal" onPress={handleAddMeal} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginRight: theme.spacing.sm,
    marginBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: theme.spacing.md,
  },
  foodCard: {
    marginBottom: theme.spacing.sm,
  },
  selectedFoodCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  foodName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  foodDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  nutritionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  nutritionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  servingSize: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.md,
    marginTop: theme.spacing.xl,
  },
  bottomContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.lg,
  },
  servingsInput: {
    marginBottom: theme.spacing.sm,
  },
});

export default AddMealScreen;
