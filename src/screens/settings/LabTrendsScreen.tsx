import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const LabTrendsScreen = ({ route }: any) => {
  const { trendsData } = route.params;

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

  const getTrendIcon = (direction: string) => {
    switch (direction?.toLowerCase()) {
      case 'improving':
        return 'trending-up';
      case 'worsening':
        return 'trending-down';
      case 'fluctuating':
        return 'chart-timeline-variant';
      default:
        return 'minus';
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction?.toLowerCase()) {
      case 'improving':
        return '#4CAF50';
      case 'worsening':
        return '#EF4444';
      case 'fluctuating':
        return '#F59E0B';
      default:
        return '#9CA3AF';
    }
  };

  const getProgressionColor = (progression: string) => {
    switch (progression?.toLowerCase()) {
      case 'improving':
        return '#4CAF50';
      case 'declining':
        return '#EF4444';
      default:
        return '#3B82F6';
    }
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
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerIcon}>
            <Icon name="chart-line" size={32} color="#4CAF50" />
          </View>
          <Text style={styles.title}>Lab Test Trends</Text>
          <Text style={styles.subtitle}>
            Based on {trendsData.testCount} tests from{' '}
            {new Date(trendsData.timespan.from).toLocaleDateString()} to{' '}
            {new Date(trendsData.timespan.to).toLocaleDateString()}
          </Text>
        </Animated.View>

        {/* Overall Progression */}
        {trendsData.overallProgression && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Icon name="pulse" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.sectionTitle}>Overall Health Progression</Text>
            </View>
            <GlassCard style={[styles.progressionCard, { borderLeftColor: getProgressionColor(trendsData.overallProgression) }]}>
              <Icon
                name={getTrendIcon(trendsData.overallProgression)}
                size={40}
                color={getProgressionColor(trendsData.overallProgression)}
              />
              <Text style={[styles.progressionText, { color: getProgressionColor(trendsData.overallProgression) }]}>
                {trendsData.overallProgression.toUpperCase()}
              </Text>
            </GlassCard>
          </Animated.View>
        )}

        {/* Parameter Trends */}
        {trendsData.trends?.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Icon name="chart-areaspline" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.sectionTitle}>Parameter Trends</Text>
            </View>
            {trendsData.trends.map((trend: any, index: number) => (
              <GlassCard key={index}>
                <View style={styles.trendHeader}>
                  <Text style={styles.parameterName}>{trend.parameter}</Text>
                  <View style={[styles.directionBadge, { backgroundColor: `${getTrendColor(trend.direction)}15` }]}>
                    <Icon
                      name={getTrendIcon(trend.direction)}
                      size={18}
                      color={getTrendColor(trend.direction)}
                    />
                    <Text style={[styles.directionText, { color: getTrendColor(trend.direction) }]}>
                      {trend.direction}
                    </Text>
                  </View>
                </View>
                <Text style={styles.changeText}>{trend.change}</Text>
                <View style={styles.significanceBox}>
                  <Icon name="information" size={16} color="#6B7280" />
                  <Text style={styles.significanceText}>{trend.significance}</Text>
                </View>
              </GlassCard>
            ))}
          </Animated.View>
        )}

        {/* Patterns */}
        {trendsData.patterns?.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <Icon name="vector-arrange-below" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.sectionTitle}>Identified Patterns</Text>
            </View>
            <GlassCard>
              {trendsData.patterns.map((pattern: string, index: number) => (
                <View key={index} style={styles.patternItem}>
                  <Icon name="circle-small" size={20} color="#8B5CF6" />
                  <Text style={styles.patternText}>{pattern}</Text>
                </View>
              ))}
            </GlassCard>
          </Animated.View>
        )}

        {/* Risk Assessment */}
        {trendsData.riskAssessment && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Icon name="shield-alert" size={20} color="#EF4444" />
              </View>
              <Text style={styles.sectionTitle}>Risk Assessment</Text>
            </View>
            <GlassCard style={styles.riskCard}>
              <View style={styles.riskRow}>
                <Text style={styles.riskLabel}>Current Risk Level:</Text>
                <Text style={styles.riskValue}>{trendsData.riskAssessment.current}</Text>
              </View>
              <View style={styles.riskRow}>
                <Text style={styles.riskLabel}>Risk Trend:</Text>
                <Text style={[styles.riskValue, { color: getTrendColor(trendsData.riskAssessment.trend) }]}>
                  {trendsData.riskAssessment.trend}
                </Text>
              </View>
              {trendsData.riskAssessment.concerns?.length > 0 && (
                <View style={styles.concernsBox}>
                  <Text style={styles.concernsLabel}>Specific Concerns:</Text>
                  {trendsData.riskAssessment.concerns.map((concern: string, idx: number) => (
                    <View key={idx} style={styles.concernItem}>
                      <Icon name="alert" size={16} color="#F59E0B" />
                      <Text style={styles.concernText}>{concern}</Text>
                    </View>
                  ))}
                </View>
              )}
            </GlassCard>
          </Animated.View>
        )}

        {/* Recommendations */}
        {trendsData.recommendations?.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Icon name="clipboard-check" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.sectionTitle}>Recommendations</Text>
            </View>
            <GlassCard>
              {trendsData.recommendations.map((rec: string, index: number) => (
                <View key={index} style={styles.recommendationItem}>
                  <Icon name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </GlassCard>
          </Animated.View>
        )}

        {/* Summary */}
        {trendsData.summary && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Icon name="text-box" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.sectionTitle}>Summary</Text>
            </View>
            <GlassCard>
              <Text style={styles.summaryText}>{trendsData.summary}</Text>
            </GlassCard>
          </Animated.View>
        )}

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
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2E7D32',
  },
  subtitle: {
    fontSize: 14,
    color: '#388E3C',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    marginTop: 8,
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
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 12,
  },
  progressionCard: {
    alignItems: 'center',
    paddingVertical: 24,
    borderLeftWidth: 4,
  },
  progressionText: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  parameterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    flex: 1,
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  directionText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  changeText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  significanceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 10,
    borderRadius: 10,
  },
  significanceText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  patternText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A2E',
    lineHeight: 20,
  },
  riskCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  riskLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  riskValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
    textTransform: 'capitalize',
  },
  concernsBox: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.2)',
  },
  concernsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  concernItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  concernText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A2E',
    lineHeight: 20,
  },
  summaryText: {
    fontSize: 15,
    color: '#1A1A2E',
    lineHeight: 24,
  },
});

export default LabTrendsScreen;
