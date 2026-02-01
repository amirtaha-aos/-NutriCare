import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { apiClient } from '../../services/api.config';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  xpReward: number;
  earned: boolean;
  earnedAt?: string;
  requirement: {
    type: string;
    value: number;
  };
}

interface GamificationProfile {
  stats: {
    level: number;
    currentXp: number;
    xpToNextLevel: number;
    totalXp: number;
    currentStreak: number;
    longestStreak: number;
    mealsLogged: number;
    exercisesCompleted: number;
    weeklyXp: number;
  };
  badges: {
    earned: Badge[];
    total: number;
    all: Badge[];
  };
  rank: {
    rank: number;
    weeklyXp: number;
  } | null;
}

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const AchievementsScreen = ({ navigation }: any) => {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const progressAnim = useState(new Animated.Value(0))[0];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchProfile();

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

  useEffect(() => {
    if (profile) {
      Animated.timing(progressAnim, {
        toValue: profile.stats.currentXp / profile.stats.xpToNextLevel,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/gamification/profile');
      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile({
        stats: {
          level: 5,
          currentXp: 320,
          xpToNextLevel: 500,
          totalXp: 1820,
          currentStreak: 7,
          longestStreak: 14,
          mealsLogged: 45,
          exercisesCompleted: 12,
          weeklyXp: 180,
        },
        badges: {
          earned: [],
          total: 20,
          all: getDemoBadges(),
        },
        rank: { rank: 42, weeklyXp: 180 },
      });
    } finally {
      setLoading(false);
    }
  };

  const getDemoBadges = (): Badge[] => [
    { id: 'streak_3', name: 'Getting Started', description: '3 day streak', icon: 'fire', category: 'streak', rarity: 'common', xpReward: 50, earned: true, requirement: { type: 'streak', value: 3 } },
    { id: 'streak_7', name: 'Week Warrior', description: '7 day streak', icon: 'fire', category: 'streak', rarity: 'common', xpReward: 100, earned: true, requirement: { type: 'streak', value: 7 } },
    { id: 'streak_14', name: 'Two Week Champion', description: '14 day streak', icon: 'fire', category: 'streak', rarity: 'rare', xpReward: 200, earned: false, requirement: { type: 'streak', value: 14 } },
    { id: 'meals_10', name: 'Food Logger', description: 'Log 10 meals', icon: 'food', category: 'nutrition', rarity: 'common', xpReward: 50, earned: true, requirement: { type: 'meals', value: 10 } },
    { id: 'meals_50', name: 'Nutrition Tracker', description: 'Log 50 meals', icon: 'food', category: 'nutrition', rarity: 'common', xpReward: 150, earned: false, requirement: { type: 'meals', value: 50 } },
    { id: 'exercise_5', name: 'Active Beginner', description: 'Complete 5 workouts', icon: 'dumbbell', category: 'exercise', rarity: 'common', xpReward: 50, earned: true, requirement: { type: 'exercises', value: 5 } },
    { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: 'star', category: 'special', rarity: 'common', xpReward: 100, earned: true, requirement: { type: 'level', value: 5 } },
    { id: 'level_10', name: 'Health Hero', description: 'Reach level 10', icon: 'star', category: 'special', rarity: 'rare', xpReward: 250, earned: false, requirement: { type: 'level', value: 10 } },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#9CA3AF';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#9CA3AF';
    }
  };

  const getIconName = (icon: string) => {
    const iconMap: Record<string, string> = {
      fire: 'fire',
      food: 'food-apple',
      dumbbell: 'dumbbell',
      star: 'star',
      crown: 'crown',
      water: 'water',
    };
    return iconMap[icon] || 'medal';
  };

  const categories = [
    { id: 'all', name: 'All', icon: 'view-grid' },
    { id: 'streak', name: 'Streaks', icon: 'fire' },
    { id: 'nutrition', name: 'Nutrition', icon: 'food-apple' },
    { id: 'exercise', name: 'Exercise', icon: 'dumbbell' },
    { id: 'special', name: 'Special', icon: 'star' },
  ];

  const filteredBadges = profile?.badges.all.filter(
    b => selectedCategory === 'all' || b.category === selectedCategory
  ) || [];

  const earnedCount = filteredBadges.filter(b => b.earned).length;

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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchProfile}
            tintColor="#4CAF50"
            colors={['#4CAF50']}
          />
        }
      >
        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.headerTitle}>Achievements</Text>
          <Text style={styles.headerSubtitle}>Track your progress and earn rewards</Text>
        </Animated.View>

        {/* Level Card */}
        {profile && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={styles.levelCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <View style={styles.levelHeader}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelNumber}>{profile.stats.level}</Text>
                </View>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelTitle}>Level {profile.stats.level}</Text>
                  <Text style={styles.xpText}>
                    {profile.stats.currentXp} / {profile.stats.xpToNextLevel} XP
                  </Text>
                </View>
                <View style={styles.streakBadge}>
                  <Icon name="fire" size={18} color="#FF5722" />
                  <Text style={styles.streakText}>{profile.stats.currentStreak}</Text>
                </View>
              </View>

              {/* XP Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.quickStat}>
                  <Icon name="food-apple" size={18} color="#fff" />
                  <Text style={styles.quickStatValue}>{profile.stats.mealsLogged}</Text>
                  <Text style={styles.quickStatLabel}>Meals</Text>
                </View>
                <View style={styles.quickStat}>
                  <Icon name="dumbbell" size={18} color="#fff" />
                  <Text style={styles.quickStatValue}>{profile.stats.exercisesCompleted}</Text>
                  <Text style={styles.quickStatLabel}>Workouts</Text>
                </View>
                <View style={styles.quickStat}>
                  <Icon name="trophy" size={18} color="#fff" />
                  <Text style={styles.quickStatValue}>#{profile.rank?.rank || '-'}</Text>
                  <Text style={styles.quickStatLabel}>Rank</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Navigation Buttons */}
        <Animated.View style={[styles.navButtons, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Challenges')}
          >
            <View style={[styles.navButtonIcon, { backgroundColor: 'rgba(76, 175, 80, 0.12)' }]}>
              <Icon name="flag-checkered" size={22} color="#4CAF50" />
            </View>
            <Text style={styles.navButtonText}>Challenges</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <View style={[styles.navButtonIcon, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
              <Icon name="podium" size={22} color="#F59E0B" />
            </View>
            <Text style={styles.navButtonText}>Leaderboard</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Category Filter */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Icon
                  name={cat.icon}
                  size={16}
                  color={selectedCategory === cat.id ? '#fff' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Badges Section */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.sectionTitle}>
            Badges ({earnedCount}/{filteredBadges.length})
          </Text>
          <View style={styles.badgesGrid}>
            {filteredBadges.map(badge => (
              <GlassCard
                key={badge.id}
                style={[styles.badgeCard, !badge.earned && styles.badgeCardLocked]}
              >
                <View
                  style={[
                    styles.badgeIconContainer,
                    { borderColor: getRarityColor(badge.rarity) },
                    !badge.earned && styles.badgeIconLocked,
                  ]}
                >
                  <Icon
                    name={getIconName(badge.icon)}
                    size={26}
                    color={badge.earned ? getRarityColor(badge.rarity) : '#D1D5DB'}
                  />
                  {!badge.earned && (
                    <View style={styles.lockOverlay}>
                      <Icon name="lock" size={12} color="#fff" />
                    </View>
                  )}
                </View>
                <Text
                  style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]}
                  numberOfLines={1}
                >
                  {badge.name}
                </Text>
                <Text style={styles.badgeDesc} numberOfLines={2}>
                  {badge.description}
                </Text>
                <View style={styles.badgeXp}>
                  <Icon name="star" size={12} color="#F59E0B" />
                  <Text style={styles.badgeXpText}>+{badge.xpReward} XP</Text>
                </View>
              </GlassCard>
            ))}
          </View>
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
    bottom: 150,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 14,
  },
  levelCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4CAF50',
  },
  levelInfo: {
    flex: 1,
    marginLeft: 14,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  xpText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  streakText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  progressContainer: {
    marginTop: 14,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  quickStatLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
  },
  navButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContainer: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
  },
  categoryChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 12,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  badgeCardLocked: {
    opacity: 0.7,
  },
  badgeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  badgeIconLocked: {
    borderColor: '#D1D5DB',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#9CA3AF',
    borderRadius: 10,
    padding: 3,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginTop: 10,
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: '#9CA3AF',
  },
  badgeDesc: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  badgeXp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  badgeXpText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
});

export default AchievementsScreen;
