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

const MOODS: Record<string, { emoji: string; color: string }> = {
  great: { emoji: '😄', color: '#4CAF50' },
  good: { emoji: '🙂', color: '#8BC34A' },
  okay: { emoji: '😐', color: '#FFC107' },
  bad: { emoji: '😔', color: '#FF9800' },
  terrible: { emoji: '😢', color: '#F44336' },
};

interface MoodEntry {
  _id: string;
  mood: string;
  moodScore: number;
  energy: string;
  stress: string;
  activities: string[];
  factors: string[];
  notes?: string;
  date: string;
}

interface Analytics {
  averageMood: number;
  averageStress: number;
  totalEntries: number;
  moodTrend: string;
  insights: { type: string; message: string }[];
}

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const MoodHistoryScreen = () => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
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
      const [historyRes, analyticsRes] = await Promise.all([
        apiClient.get('/mood/history?days=30'),
        apiClient.get('/mood/analytics?days=30'),
      ]);

      if (historyRes.data.success) {
        setEntries(historyRes.data.data);
      }
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching mood data:', error);
      // Demo data
      setEntries(getDemoEntries());
      setAnalytics({
        averageMood: 3.8,
        averageStress: 2.3,
        totalEntries: 14,
        moodTrend: 'improving',
        insights: [
          { type: 'positive', message: 'Your mood has been improving!' },
          { type: 'tip', message: 'Exercise seems to boost your mood the most!' },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const getDemoEntries = (): MoodEntry[] => {
    const moods = ['great', 'good', 'okay', 'good', 'great', 'good', 'okay'];
    return moods.map((mood, i) => ({
      _id: `entry_${i}`,
      mood,
      moodScore: mood === 'great' ? 5 : mood === 'good' ? 4 : 3,
      energy: 'medium',
      stress: 'low',
      activities: ['exercise', 'work'],
      factors: ['good_sleep'],
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    }));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return { icon: 'trending-up', color: '#4CAF50' };
      case 'declining': return { icon: 'trending-down', color: '#F44336' };
      default: return { icon: 'minus', color: '#FFC107' };
    }
  };

  const getMoodStars = (score: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Icon
        key={i}
        name={i < score ? 'star' : 'star-outline'}
        size={14}
        color={i < score ? '#FFD700' : '#ddd'}
      />
    ));
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchData}
            tintColor="#4CAF50"
            colors={['#4CAF50']}
          />
        }>
        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerIcon}>
            <Icon name="chart-timeline-variant" size={32} color="#4CAF50" />
          </View>
          <Text style={styles.headerTitle}>Mood History</Text>
          <Text style={styles.headerSubtitle}>Track your emotional journey</Text>
        </Animated.View>

        {/* Analytics Summary */}
        {analytics && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <GlassCard style={styles.analyticsCard}>
              <Text style={styles.cardTitle}>30-Day Summary</Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{analytics.averageMood.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Avg Mood</Text>
                  <View style={styles.starsRow}>{getMoodStars(Math.round(analytics.averageMood))}</View>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <View style={styles.trendRow}>
                    <Icon
                      name={getTrendIcon(analytics.moodTrend).icon}
                      size={28}
                      color={getTrendIcon(analytics.moodTrend).color}
                    />
                  </View>
                  <Text style={styles.statLabel}>Trend</Text>
                  <Text style={[styles.trendText, { color: getTrendIcon(analytics.moodTrend).color }]}>
                    {analytics.moodTrend.charAt(0).toUpperCase() + analytics.moodTrend.slice(1)}
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{analytics.totalEntries}</Text>
                  <Text style={styles.statLabel}>Entries</Text>
                </View>
              </View>

              {/* Insights */}
              {analytics.insights.length > 0 && (
                <View style={styles.insightsContainer}>
                  {analytics.insights.map((insight, i) => (
                    <View key={i} style={styles.insightItem}>
                      <View style={[
                        styles.insightIcon,
                        { backgroundColor: insight.type === 'positive' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 152, 0, 0.15)' }
                      ]}>
                        <Icon
                          name={insight.type === 'positive' ? 'lightbulb-on' : insight.type === 'tip' ? 'star' : 'alert'}
                          size={16}
                          color={insight.type === 'positive' ? '#4CAF50' : '#FF9800'}
                        />
                      </View>
                      <Text style={styles.insightText}>{insight.message}</Text>
                    </View>
                  ))}
                </View>
              )}
            </GlassCard>
          </Animated.View>
        )}

        {/* Mood Chart (Simple Bar) */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.cardTitle}>Recent Week</Text>
            <View style={styles.chartContainer}>
              {entries.slice(0, 7).reverse().map((entry, i) => (
                <View key={entry._id} style={styles.chartBar}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${entry.moodScore * 20}%`,
                        backgroundColor: MOODS[entry.mood]?.color || '#ccc',
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>
                    {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                  </Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Entry List */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          {entries.map(entry => (
            <GlassCard key={entry._id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryEmoji}>{MOODS[entry.mood]?.emoji}</Text>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryMood}>
                    {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                  </Text>
                  <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                </View>
                <View style={styles.entryTags}>
                  <View style={styles.miniTag}>
                    <Text style={styles.miniTagText}>{entry.energy} energy</Text>
                  </View>
                </View>
              </View>
              {entry.activities.length > 0 && (
                <View style={styles.entryActivities}>
                  {entry.activities.slice(0, 3).map(act => (
                    <View key={act} style={styles.activityTag}>
                      <Text style={styles.activityTagText}>{act}</Text>
                    </View>
                  ))}
                </View>
              )}
              {entry.notes && (
                <Text style={styles.entryNotes} numberOfLines={2}>
                  {entry.notes}
                </Text>
              )}
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
    padding: 20,
    marginBottom: 16,
  },
  analyticsCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 12,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  trendRow: {
    height: 36,
    justifyContent: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  insightsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(76, 175, 80, 0.15)',
    gap: 10,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A2E',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    width: 30,
  },
  bar: {
    width: 22,
    borderRadius: 6,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '500',
  },
  entryCard: {
    padding: 14,
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryEmoji: {
    fontSize: 36,
  },
  entryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  entryMood: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  entryDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  entryTags: {
    flexDirection: 'row',
  },
  miniTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  miniTagText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  entryActivities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  activityTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  activityTagText: {
    fontSize: 12,
    color: '#388E3C',
    fontWeight: '500',
  },
  entryNotes: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 12,
    fontStyle: 'italic',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
});

export default MoodHistoryScreen;
