import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '../../store';
import { fetchMealPlans } from '../../store/slices/mealPlanSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { MealPlan } from '../../types/mealPlan.types';
import { FloatingChatButton } from '../../components';

type Props = {
  navigation: StackNavigationProp<any>;
};

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const MealPlansScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { mealPlans, isLoading, activeMealPlan } = useSelector(
    (state: RootState) => state.mealPlan
  );

  useEffect(() => {
    dispatch(fetchMealPlans());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchMealPlans());
  };

  const handlePlanPress = (plan: MealPlan) => {
    navigation.navigate('MealPlanDetail', { planId: plan._id });
  };

  const handleGeneratePress = () => {
    navigation.navigate('GenerateMealPlan');
  };

  const renderMealPlanCard = ({ item }: { item: MealPlan }) => {
    const isActive = item._id === activeMealPlan?._id;

    return (
      <TouchableOpacity onPress={() => handlePlanPress(item)}>
        <GlassCard style={[styles.card, isActive && styles.activeCard]}>
          {isActive && (
            <View style={styles.activeBadge}>
              <Icon name="check-circle" size={14} color="#fff" />
              <Text style={styles.activeBadgeText}>{t('mealPlan.activated')}</Text>
            </View>
          )}

          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <View style={styles.cardIcon}>
                <Icon name="food-apple" size={22} color="#4CAF50" />
              </View>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
            <View style={styles.durationBadge}>
              <Text style={styles.duration}>{t('mealPlan.planDuration', { count: item.duration })}</Text>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Icon name="cash" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>
                {t('mealPlan.budget')}: ${item.budget} | {t('mealPlan.totalCost')}: ${item.totalEstimatedCost.toFixed(2)}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Icon name="map-marker" size={16} color="#66BB6A" />
              <Text style={styles.infoText}>{item.location}</Text>
            </View>

            <View style={styles.infoItem}>
              <Icon name="fire" size={16} color="#EF4444" />
              <Text style={styles.infoText}>
                Avg: {Math.round(item.nutritionSummary.avgDailyCalories)} kcal/day
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.date}>
              Created {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <View style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View</Text>
              <Icon name="chevron-right" size={18} color="#4CAF50" />
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Icon name="food-off" size={60} color="#81C784" />
      </View>
      <Text style={styles.emptyTitle}>{t('mealPlan.noPlan')}</Text>
      <Text style={styles.emptyText}>{t('mealPlan.createFirst')}</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleGeneratePress}>
        <LinearGradient
          colors={['#4CAF50', '#66BB6A']}
          style={styles.emptyButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="plus-circle" size={22} color="#fff" />
          <Text style={styles.emptyButtonText}>{t('mealPlan.generate')}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && mealPlans.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Icon name="silverware-fork-knife" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.headerTitle}>{t('mealPlan.title')}</Text>
        </View>
        <TouchableOpacity style={styles.generateButton} onPress={handleGeneratePress}>
          <LinearGradient
            colors={['#4CAF50', '#66BB6A']}
            style={styles.generateButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="plus" size={18} color="#fff" />
            <Text style={styles.generateButtonText}>{t('mealPlan.generateNew')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mealPlans}
        renderItem={renderMealPlanCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#4CAF50"
            colors={['#4CAF50']}
          />
        }
      />

      <FloatingChatButton />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 12,
  },
  card: {
    position: 'relative',
  },
  activeCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  activeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
    flex: 1,
  },
  durationBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  duration: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  infoContainer: {
    gap: 8,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(76, 175, 80, 0.1)',
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});

export default MealPlansScreen;
