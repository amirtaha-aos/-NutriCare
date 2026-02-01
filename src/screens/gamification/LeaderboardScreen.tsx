import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { apiClient } from '../../services/api.config';

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

interface LeaderboardEntry {
  userId: string;
  username: string;
  weeklyXp: number;
  weekNumber: number;
  year: number;
}

interface UserRank {
  rank: number;
  weeklyXp: number;
}

const LeaderboardScreen = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchData();
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leaderboardRes, rankRes] = await Promise.all([
        apiClient.get('/gamification/leaderboard?limit=50'),
        apiClient.get('/gamification/rank'),
      ]);

      if (leaderboardRes.data.success) {
        setLeaderboard(leaderboardRes.data.data);
      }
      if (rankRes.data.success) {
        setUserRank(rankRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard(getDemoLeaderboard());
      setUserRank({ rank: 42, weeklyXp: 180 });
    } finally {
      setLoading(false);
    }
  };

  const getDemoLeaderboard = (): LeaderboardEntry[] => {
    const names = [
      'FitnessPro', 'HealthyLife', 'NutritionKing', 'WorkoutQueen',
      'MealMaster', 'GymRat2024', 'CleanEater', 'ActiveLiving',
      'FoodTracker', 'StrongMind', 'BalancedDiet', 'CardioKing',
      'ProteinPower', 'VeggieLife', 'RunnerHigh', 'YogaMaster',
      'WeightLoss', 'MuscleGain', 'HealthyHabits', 'FitnessJunkie',
    ];

    return names.map((name, index) => ({
      userId: `user_${index}`,
      username: name,
      weeklyXp: Math.floor(500 - index * 20 + Math.random() * 10),
      weekNumber: getWeekNumber(new Date()),
      year: new Date().getFullYear(),
    }));
  };

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#4CAF50';
  };

  const getAvatarColor = (index: number) => {
    const colors = ['#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#2E7D32', '#388E3C'];
    return colors[index % colors.length];
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background Gradient */}
      <LinearGradient
        colors={['#2E7D32', '#388E3C', '#4CAF50']}
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchData}
            colors={['#fff']}
            tintColor="#fff"
          />
        }>
        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerIcon}>
            <Icon name="podium" size={32} color="#FFD700" />
          </View>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Text style={styles.headerSubtitle}>This Week's Top Players</Text>
        </Animated.View>

        {/* Top 3 Podium */}
        <Animated.View
          style={[styles.podiumContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.podium}>
            {/* Second Place */}
            {leaderboard[1] && (
              <View style={styles.podiumItem}>
                <View style={[styles.avatar, { backgroundColor: getAvatarColor(1) }]}>
                  <Text style={styles.avatarText}>
                    {leaderboard[1].username.charAt(0)}
                  </Text>
                </View>
                <View style={styles.medalContainer}>
                  <Icon name="medal" size={28} color="#C0C0C0" />
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {leaderboard[1].username}
                </Text>
                <Text style={styles.podiumXp}>{leaderboard[1].weeklyXp} XP</Text>
                <View style={[styles.podiumBar, styles.podiumBar2]}>
                  <Text style={styles.podiumRank}>2</Text>
                </View>
              </View>
            )}

            {/* First Place */}
            {leaderboard[0] && (
              <View style={styles.podiumItem}>
                <View style={[styles.avatar, styles.avatarFirst, { backgroundColor: getAvatarColor(0) }]}>
                  <Text style={[styles.avatarText, styles.avatarTextFirst]}>
                    {leaderboard[0].username.charAt(0)}
                  </Text>
                </View>
                <View style={styles.medalContainer}>
                  <Icon name="crown" size={36} color="#FFD700" />
                </View>
                <Text style={[styles.podiumName, styles.podiumNameFirst]} numberOfLines={1}>
                  {leaderboard[0].username}
                </Text>
                <Text style={[styles.podiumXp, styles.podiumXpFirst]}>
                  {leaderboard[0].weeklyXp} XP
                </Text>
                <View style={[styles.podiumBar, styles.podiumBar1]}>
                  <Text style={[styles.podiumRank, styles.podiumRankFirst]}>1</Text>
                </View>
              </View>
            )}

            {/* Third Place */}
            {leaderboard[2] && (
              <View style={styles.podiumItem}>
                <View style={[styles.avatar, { backgroundColor: getAvatarColor(2) }]}>
                  <Text style={styles.avatarText}>
                    {leaderboard[2].username.charAt(0)}
                  </Text>
                </View>
                <View style={styles.medalContainer}>
                  <Icon name="medal-outline" size={28} color="#CD7F32" />
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {leaderboard[2].username}
                </Text>
                <Text style={styles.podiumXp}>{leaderboard[2].weeklyXp} XP</Text>
                <View style={[styles.podiumBar, styles.podiumBar3]}>
                  <Text style={styles.podiumRank}>3</Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        {/* User's Rank Card */}
        {userRank && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <GlassCard style={styles.userRankCard}>
              <View style={styles.userRankLeft}>
                <Text style={styles.yourRankLabel}>Your Rank</Text>
                <View style={styles.userRankBadge}>
                  <Text style={styles.userRankNumber}>#{userRank.rank}</Text>
                </View>
              </View>
              <View style={styles.userRankRight}>
                <Icon name="star" size={22} color="#FFD700" />
                <Text style={styles.userRankXp}>{userRank.weeklyXp} XP this week</Text>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Full Leaderboard */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icon name="format-list-numbered" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.sectionTitle}>Full Rankings</Text>
          </View>

          <GlassCard>
            {leaderboard.slice(3).map((entry, index) => (
              <View
                key={entry.userId}
                style={[
                  styles.leaderboardItem,
                  index < leaderboard.slice(3).length - 1 && styles.leaderboardItemBorder,
                ]}>
                <View style={styles.rankContainer}>
                  <Text style={styles.rank}>{index + 4}</Text>
                </View>
                <View style={[styles.smallAvatar, { backgroundColor: getAvatarColor(index + 3) }]}>
                  <Text style={styles.smallAvatarText}>
                    {entry.username.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.username} numberOfLines={1}>
                  {entry.username}
                </Text>
                <View style={styles.xpContainer}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={styles.xp}>{entry.weeklyXp}</Text>
                </View>
              </View>
            ))}
          </GlassCard>
        </Animated.View>

        {/* Info Footer */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <GlassCard style={styles.footer}>
            <View style={styles.footerIcon}>
              <Icon name="information-outline" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.footerText}>
              Leaderboard resets every Monday. Earn XP by logging meals, completing workouts, and finishing challenges!
            </Text>
          </GlassCard>
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
    height: 350,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: 150,
    left: -50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 60,
    backgroundColor: '#E8F5E9',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  podiumContainer: {
    marginBottom: 24,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },
  podiumItem: {
    alignItems: 'center',
    width: '30%',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarFirst: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  avatarTextFirst: {
    fontSize: 24,
  },
  medalContainer: {
    marginTop: 8,
  },
  podiumName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    width: 80,
    textAlign: 'center',
  },
  podiumNameFirst: {
    fontSize: 14,
  },
  podiumXp: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 2,
  },
  podiumXpFirst: {
    fontSize: 13,
    color: '#fff',
  },
  podiumBar: {
    width: '80%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  podiumBar1: {
    height: 90,
    backgroundColor: 'rgba(255, 215, 0, 0.4)',
  },
  podiumBar2: {
    height: 70,
    backgroundColor: 'rgba(192, 192, 192, 0.4)',
  },
  podiumBar3: {
    height: 50,
    backgroundColor: 'rgba(205, 127, 50, 0.4)',
  },
  podiumRank: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  podiumRankFirst: {
    fontSize: 22,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 12,
  },
  userRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  yourRankLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  userRankBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  userRankNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  userRankRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userRankXp: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
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
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  leaderboardItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.1)',
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
  },
  rank: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  smallAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  username: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#2E7D32',
    marginLeft: 12,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xp: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  footerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default LeaderboardScreen;
