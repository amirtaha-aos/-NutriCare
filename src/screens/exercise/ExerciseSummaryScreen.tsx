import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const ExerciseSummaryScreen = ({ route, navigation }: any) => {
  const { exerciseType, exerciseName, stats, analysis, duration } = route.params;

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getFormAccuracy = () => {
    if (stats.totalReps === 0) return 0;
    return Math.round((stats.correctReps / stats.totalReps) * 100);
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return '#4CAF50';
    if (accuracy >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getPerformanceRating = () => {
    const accuracy = getFormAccuracy();
    if (accuracy >= 90) return { rating: 'Excellent', icon: 'trophy' };
    if (accuracy >= 75) return { rating: 'Great', icon: 'star' };
    if (accuracy >= 60) return { rating: 'Good', icon: 'thumb-up' };
    if (accuracy >= 40) return { rating: 'Fair', icon: 'arm-flex' };
    return { rating: 'Keep Practicing', icon: 'target' };
  };

  const performance = getPerformanceRating();
  const accuracy = getFormAccuracy();

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
          <View style={[styles.headerIcon, { backgroundColor: `${getAccuracyColor(accuracy)}20` }]}>
            <Icon name={performance.icon} size={40} color={getAccuracyColor(accuracy)} />
          </View>
          <Text style={styles.performanceRating}>{performance.rating}</Text>
          <Text style={styles.exerciseName}>{exerciseName} Complete!</Text>
        </Animated.View>

        {/* Main Stats */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <View style={styles.statRow}>
              <View style={styles.mainStat}>
                <Text style={styles.mainStatValue}>{stats.totalReps}</Text>
                <Text style={styles.mainStatLabel}>Total Reps</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.mainStat}>
                <Text style={[styles.mainStatValue, { color: getAccuracyColor(accuracy) }]}>
                  {accuracy}%
                </Text>
                <Text style={styles.mainStatLabel}>Accuracy</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.mainStat}>
                <Text style={styles.mainStatValue}>{formatTime(duration)}</Text>
                <Text style={styles.mainStatLabel}>Duration</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Rep Breakdown */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.cardTitle}>Rep Breakdown</Text>
            <View style={styles.repBreakdown}>
              <View style={styles.repItem}>
                <View style={[styles.repIcon, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
                  <Icon name="check-circle" size={28} color="#4CAF50" />
                </View>
                <Text style={styles.repValue}>{stats.correctReps}</Text>
                <Text style={styles.repLabel}>Correct Form</Text>
              </View>
              <View style={styles.repItem}>
                <View style={[styles.repIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Icon name="alert-circle" size={28} color="#EF4444" />
                </View>
                <Text style={styles.repValue}>{stats.incorrectReps}</Text>
                <Text style={styles.repLabel}>Needs Work</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${accuracy}%`,
                      backgroundColor: getAccuracyColor(accuracy),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{accuracy}% Form Accuracy</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* AI Analysis */}
        {analysis && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <GlassCard>
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <Icon name="brain" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.cardTitle}>AI Analysis</Text>
              </View>

              {/* Form Consistency */}
              {analysis.formConsistency !== undefined && (
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>Form Consistency</Text>
                  <Text style={styles.analysisValue}>{analysis.formConsistency}%</Text>
                </View>
              )}

              {/* Fatigue Indicators */}
              {analysis.fatigueIndicators?.detected && (
                <View style={styles.fatigueWarning}>
                  <Icon name="alert" size={20} color="#F59E0B" />
                  <Text style={styles.fatigueText}>
                    Fatigue detected: {analysis.fatigueIndicators.recommendation}
                  </Text>
                </View>
              )}

              {/* Strengths */}
              {analysis.overallFeedback?.strengths?.length > 0 && (
                <View style={styles.feedbackSection}>
                  <Text style={styles.feedbackTitle}>Strengths</Text>
                  {analysis.overallFeedback.strengths.map((strength: string, index: number) => (
                    <View key={index} style={styles.feedbackItem}>
                      <Icon name="check" size={16} color="#4CAF50" />
                      <Text style={styles.feedbackText}>{strength}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Areas to Improve */}
              {analysis.overallFeedback?.weaknesses?.length > 0 && (
                <View style={styles.feedbackSection}>
                  <Text style={styles.feedbackTitle}>Areas to Improve</Text>
                  {analysis.overallFeedback.weaknesses.map((weakness: string, index: number) => (
                    <View key={index} style={styles.feedbackItem}>
                      <Icon name="arrow-right" size={16} color="#F59E0B" />
                      <Text style={styles.feedbackText}>{weakness}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Progress Tip */}
              {analysis.overallFeedback?.progressTip && (
                <View style={styles.tipBox}>
                  <Icon name="lightbulb-outline" size={20} color="#3B82F6" />
                  <Text style={styles.tipText}>{analysis.overallFeedback.progressTip}</Text>
                </View>
              )}
            </GlassCard>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              navigation.replace('ExerciseSession', { exerciseType, exerciseName })
            }>
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={styles.primaryButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Icon name="replay" size={22} color="#fff" />
              <Text style={styles.primaryButtonText}>Do Another Set</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.popToTop()}>
            <Icon name="home" size={22} color="#4CAF50" />
            <Text style={styles.secondaryButtonText}>Back to Exercises</Text>
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
    width: 90,
    height: 90,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  performanceRating: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 16,
    color: '#388E3C',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  mainStat: {
    alignItems: 'center',
    flex: 1,
  },
  mainStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
  },
  mainStatLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  repItem: {
    alignItems: 'center',
  },
  repIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  repValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
  },
  repLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  analysisItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.1)',
  },
  analysisLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  analysisValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  fatigueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  fatigueText: {
    flex: 1,
    fontSize: 14,
    color: '#D97706',
  },
  feedbackSection: {
    marginTop: 16,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A2E',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#2563EB',
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    gap: 10,
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExerciseSummaryScreen;
