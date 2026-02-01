import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  category: string;
  requirement: {
    type: string;
    value: number;
  };
  xpReward: number;
  progress: number;
  completed: boolean;
  joined: boolean;
}

const ChallengesScreen = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchChallenges();
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

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/gamification/challenges');
      if (response.data.success) {
        setChallenges(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setChallenges(getDemoChallenges());
    } finally {
      setLoading(false);
    }
  };

  const getDemoChallenges = (): Challenge[] => [
    { id: 'daily_3meals', title: 'Three Square Meals', description: 'Log 3 meals today', type: 'daily', category: 'nutrition', requirement: { type: 'meals', value: 3 }, xpReward: 30, progress: 2, completed: false, joined: true },
    { id: 'daily_water8', title: 'Stay Hydrated', description: 'Drink 8 glasses of water', type: 'daily', category: 'hydration', requirement: { type: 'water', value: 8 }, xpReward: 25, progress: 5, completed: false, joined: true },
    { id: 'daily_exercise', title: 'Get Moving', description: 'Complete 1 workout', type: 'daily', category: 'exercise', requirement: { type: 'exercise', value: 1 }, xpReward: 35, progress: 1, completed: true, joined: true },
    { id: 'weekly_meals20', title: 'Consistent Logger', description: 'Log 20 meals this week', type: 'weekly', category: 'nutrition', requirement: { type: 'meals', value: 20 }, xpReward: 150, progress: 12, completed: false, joined: true },
    { id: 'weekly_exercise5', title: 'Active Week', description: 'Complete 5 workouts this week', type: 'weekly', category: 'exercise', requirement: { type: 'exercise', value: 5 }, xpReward: 200, progress: 3, completed: false, joined: true },
    { id: 'weekly_streak7', title: 'Perfect Week', description: 'Maintain a 7-day streak', type: 'weekly', category: 'mixed', requirement: { type: 'streak', value: 7 }, xpReward: 250, progress: 4, completed: false, joined: false },
  ];

  const joinChallenge = async (challengeId: string) => {
    try {
      await apiClient.post(`/gamification/challenges/${challengeId}/join`);
      setChallenges(prev =>
        prev.map(c => (c.id === challengeId ? { ...c, joined: true } : c))
      );
    } catch (error) {
      setChallenges(prev =>
        prev.map(c => (c.id === challengeId ? { ...c, joined: true } : c))
      );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nutrition': return 'food-apple';
      case 'exercise': return 'dumbbell';
      case 'hydration': return 'water';
      case 'mixed': return 'star';
      default: return 'flag';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'nutrition': return '#4CAF50';
      case 'exercise': return '#66BB6A';
      case 'hydration': return '#81C784';
      case 'mixed': return '#2E7D32';
      default: return '#388E3C';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return '#F59E0B';
      case 'weekly': return '#3B82F6';
      case 'special': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const filteredChallenges = challenges.filter(
    c => selectedType === 'all' || c.type === selectedType
  );

  const types = [
    { id: 'all', name: 'All', icon: 'view-grid' },
    { id: 'daily', name: 'Daily', icon: 'calendar-today' },
    { id: 'weekly', name: 'Weekly', icon: 'calendar-week' },
  ];

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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchChallenges}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }>
        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerIcon}>
            <Icon name="trophy" size={32} color="#4CAF50" />
          </View>
          <Text style={styles.headerTitle}>Challenges</Text>
          <Text style={styles.headerSubtitle}>Complete challenges to earn XP</Text>
        </Animated.View>

        {/* Stats Card */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
                  <Icon name="check-circle" size={24} color="#4CAF50" />
                </View>
                <Text style={styles.statValue}>
                  {challenges.filter(c => c.completed).length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Icon name="progress-clock" size={24} color="#3B82F6" />
                </View>
                <Text style={styles.statValue}>
                  {challenges.filter(c => c.joined && !c.completed).length}
                </Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Icon name="star" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.statValue}>
                  {challenges.reduce((sum, c) => c.completed ? sum + c.xpReward : sum, 0)}
                </Text>
                <Text style={styles.statLabel}>XP Earned</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Type Filter */}
        <Animated.View style={[styles.filterContainer, { opacity: fadeAnim }]}>
          {types.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.filterButton,
                selectedType === type.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedType(type.id)}>
              <Icon
                name={type.icon}
                size={18}
                color={selectedType === type.id ? '#fff' : '#4CAF50'}
              />
              <Text
                style={[
                  styles.filterText,
                  selectedType === type.id && styles.filterTextActive,
                ]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Challenges List */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {filteredChallenges.map(challenge => (
            <GlassCard
              key={challenge.id}
              style={challenge.completed && styles.challengeCardCompleted}>
              <View style={styles.challengeHeader}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: `${getCategoryColor(challenge.category)}15` },
                  ]}>
                  <Icon
                    name={getCategoryIcon(challenge.category)}
                    size={24}
                    color={getCategoryColor(challenge.category)}
                  />
                </View>
                <View style={styles.challengeInfo}>
                  <View style={styles.challengeTitleRow}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: getTypeColor(challenge.type) },
                      ]}>
                      <Text style={styles.typeBadgeText}>
                        {challenge.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.challengeDesc}>{challenge.description}</Text>
                </View>
              </View>

              {/* Progress */}
              {challenge.joined && (
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressText}>
                      {challenge.progress} / {challenge.requirement.value}
                    </Text>
                    <View style={styles.xpBadge}>
                      <Icon name="star" size={14} color="#F59E0B" />
                      <Text style={styles.xpText}>+{challenge.xpReward} XP</Text>
                    </View>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(
                            (challenge.progress / challenge.requirement.value) * 100,
                            100
                          )}%`,
                          backgroundColor: challenge.completed
                            ? '#4CAF50'
                            : getCategoryColor(challenge.category),
                        },
                      ]}
                    />
                  </View>
                </View>
              )}

              {/* Action Button */}
              {!challenge.joined ? (
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => joinChallenge(challenge.id)}>
                  <LinearGradient
                    colors={['#4CAF50', '#66BB6A']}
                    style={styles.joinButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}>
                    <Icon name="plus" size={18} color="#fff" />
                    <Text style={styles.joinButtonText}>Join Challenge</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : challenge.completed ? (
                <View style={styles.completedBadge}>
                  <Icon name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.completedText}>Completed!</Text>
                </View>
              ) : null}
            </GlassCard>
          ))}
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
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
  filterTextActive: {
    color: '#fff',
  },
  challengeCardCompleted: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  challengeDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  progressSection: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  joinButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
  },
  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
  },
  completedText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChallengesScreen;
