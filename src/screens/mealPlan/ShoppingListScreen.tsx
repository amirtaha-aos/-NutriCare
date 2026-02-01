import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { StackScreenProps } from '@react-navigation/stack';
import { mealPlanService } from '../../services/mealPlan.service';
import { ShoppingListCategory } from '../../types/mealPlan.types';
import { MealPlanStackParamList } from '../../navigation/MealPlanNavigator';

type Props = StackScreenProps<MealPlanStackParamList, 'ShoppingList'>;

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const ShoppingListScreen: React.FC<Props> = ({ route }) => {
  const { planId } = route.params;
  const [shoppingList, setShoppingList] = useState<ShoppingListCategory[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadShoppingList();
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
  }, [planId]);

  const loadShoppingList = async () => {
    try {
      setIsLoading(true);
      const data = await mealPlanService.getShoppingList(planId);
      setShoppingList(data.shoppingList);
      setTotalCost(data.totalEstimatedCost);
    } catch (error) {
      console.error('Failed to load shopping list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getCategoryIcon = (category: string): string => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('vegetable')) return 'carrot';
    if (lowerCategory.includes('fruit')) return 'fruit-cherries';
    if (lowerCategory.includes('meat')) return 'food-drumstick';
    if (lowerCategory.includes('dairy')) return 'cow';
    if (lowerCategory.includes('grain') || lowerCategory.includes('bread'))
      return 'bread-slice';
    if (lowerCategory.includes('seafood') || lowerCategory.includes('fish'))
      return 'fish';
    if (lowerCategory.includes('spice') || lowerCategory.includes('condiment'))
      return 'shaker';
    return 'cart';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading shopping list...</Text>
      </View>
    );
  }

  const totalItems = shoppingList.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter((v) => v).length;
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

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
        style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.headerIcon}>
          <Icon name="cart" size={32} color="#4CAF50" />
        </View>
        <Text style={styles.headerTitle}>Shopping List</Text>
        <View style={styles.costBadge}>
          <Icon name="cash" size={16} color="#fff" />
          <Text style={styles.costText}>${totalCost.toFixed(2)}</Text>
        </View>
      </Animated.View>

      {/* Progress */}
      <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 16, marginBottom: 16 }}>
        <GlassCard style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Icon name="checkbox-marked-circle-outline" size={20} color="#4CAF50" />
            <Text style={styles.progressTitle}>Progress</Text>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={[styles.progressFill, { width: `${progress}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.progressText}>
            {checkedCount} / {totalItems} items ({Math.round(progress)}%)
          </Text>
        </GlassCard>
      </Animated.View>

      {/* Shopping List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {shoppingList.map((category, categoryIndex) => (
          <Animated.View
            key={categoryIndex}
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          >
            <View style={styles.categoryHeader}>
              <View style={styles.categoryIcon}>
                <Icon name={getCategoryIcon(category.category)} size={20} color="#4CAF50" />
              </View>
              <Text style={styles.categoryTitle}>{category.category.toUpperCase()}</Text>
              <View style={styles.categoryCountBadge}>
                <Text style={styles.categoryCount}>{category.items.length}</Text>
              </View>
            </View>

            <GlassCard style={styles.categoryCard}>
              {category.items.map((item, itemIndex) => {
                const isChecked = checkedItems[`${categoryIndex}-${itemIndex}`] || false;
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[styles.item, isChecked && styles.itemChecked]}
                    onPress={() => toggleItem(categoryIndex, itemIndex)}
                  >
                    <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                      {isChecked && <Icon name="check" size={16} color="#fff" />}
                    </View>

                    <View style={styles.itemContent}>
                      <Text style={[styles.itemName, isChecked && styles.itemNameChecked]}>
                        {item.name}
                      </Text>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemAmount}>{item.amount}</Text>
                        {item.estimatedCost && (
                          <>
                            <Text style={styles.itemDot}>•</Text>
                            <Text style={styles.itemCost}>
                              ${item.estimatedCost.toFixed(2)}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </GlassCard>
          </Animated.View>
        ))}

        {/* Total Summary */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity style={styles.summaryButton}>
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.summaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.summaryContent}>
                <Icon name="cash-multiple" size={24} color="#fff" />
                <Text style={styles.summaryTitle}>Estimated Total</Text>
              </View>
              <Text style={styles.summaryAmount}>${totalCost.toFixed(2)}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2E7D32',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
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
    marginBottom: 8,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  costText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 12,
  },
  progressCard: {
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    marginTop: 8,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    flex: 1,
  },
  categoryCountBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryCount: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  categoryCard: {
    padding: 0,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.1)',
  },
  itemChecked: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    color: '#1A1A2E',
    fontWeight: '500',
    marginBottom: 4,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemAmount: {
    fontSize: 13,
    color: '#6B7280',
  },
  itemDot: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  itemCost: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  summaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
  },
  summaryGradient: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default ShoppingListScreen;
