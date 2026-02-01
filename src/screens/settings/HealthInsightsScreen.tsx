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

const HealthInsightsScreen = ({ route }: any) => {
  const { insights } = route.params;

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

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      default:
        return '#4CAF50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'cardiovascular':
        return 'heart-pulse';
      case 'metabolic':
        return 'molecule';
      case 'kidney':
        return 'water';
      case 'liver':
        return 'hospital-box';
      case 'nutrition':
        return 'food-apple';
      default:
        return 'information';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'cardiovascular':
        return '#EF4444';
      case 'metabolic':
        return '#F59E0B';
      case 'kidney':
        return '#3B82F6';
      case 'liver':
        return '#8B5CF6';
      case 'nutrition':
        return '#4CAF50';
      default:
        return '#6B7280';
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
            <Icon name="lightbulb-on" size={36} color="#4CAF50" />
          </View>
          <Text style={styles.title}>Health Insights</Text>
          <Text style={styles.subtitle}>
            Based on your lab results and health profile
          </Text>
        </Animated.View>

        {/* Insights */}
        {insights.insights?.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.sectionTitle}>Key Insights</Text>
            {insights.insights.map((insight: any, index: number) => (
              <GlassCard key={index} style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <View style={[styles.categoryBadge, { backgroundColor: `${getCategoryColor(insight.category)}15` }]}>
                    <Icon
                      name={getCategoryIcon(insight.category)}
                      size={18}
                      color={getCategoryColor(insight.category)}
                    />
                    <Text style={[styles.categoryText, { color: getCategoryColor(insight.category) }]}>
                      {insight.category}
                    </Text>
                  </View>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(insight.priority) }]}>
                    <Text style={styles.priorityText}>{insight.priority}</Text>
                  </View>
                </View>

                <Text style={styles.insightText}>{insight.insight}</Text>

                <View style={styles.actionBox}>
                  <Icon name="check-circle" size={18} color="#4CAF50" />
                  <Text style={styles.actionText}>{insight.actionable}</Text>
                </View>
              </GlassCard>
            ))}
          </Animated.View>
        )}

        {/* Nutrition Focus */}
        {insights.nutritionFocus && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Icon name="food-apple" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.sectionTitle}>Nutrition Focus</Text>
            </View>

            <GlassCard>
              {insights.nutritionFocus.increase?.length > 0 && (
                <View style={styles.nutritionSection}>
                  <View style={styles.nutritionHeader}>
                    <Icon name="arrow-up-circle" size={20} color="#4CAF50" />
                    <Text style={styles.nutritionLabel}>Increase</Text>
                  </View>
                  <View style={styles.nutritionList}>
                    {insights.nutritionFocus.increase.map((item: string, idx: number) => (
                      <View key={idx} style={styles.nutritionItem}>
                        <Icon name="plus-circle" size={16} color="#4CAF50" />
                        <Text style={styles.nutritionItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {insights.nutritionFocus.decrease?.length > 0 && (
                <View style={styles.nutritionSection}>
                  <View style={styles.nutritionHeader}>
                    <Icon name="arrow-down-circle" size={20} color="#F59E0B" />
                    <Text style={styles.nutritionLabel}>Decrease</Text>
                  </View>
                  <View style={styles.nutritionList}>
                    {insights.nutritionFocus.decrease.map((item: string, idx: number) => (
                      <View key={idx} style={[styles.nutritionItem, styles.nutritionItemWarning]}>
                        <Icon name="minus-circle" size={16} color="#F59E0B" />
                        <Text style={styles.nutritionItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {insights.nutritionFocus.supplements?.length > 0 && (
                <View style={styles.nutritionSection}>
                  <View style={styles.nutritionHeader}>
                    <Icon name="pill" size={20} color="#3B82F6" />
                    <Text style={styles.nutritionLabel}>Suggested Supplements</Text>
                  </View>
                  <View style={styles.nutritionList}>
                    {insights.nutritionFocus.supplements.map((item: string, idx: number) => (
                      <View key={idx} style={[styles.nutritionItem, styles.nutritionItemInfo]}>
                        <Icon name="circle-small" size={16} color="#3B82F6" />
                        <Text style={styles.nutritionItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </GlassCard>
          </Animated.View>
        )}

        {/* Exercise Recommendations */}
        {insights.exerciseRecommendations?.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Icon name="run" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.sectionTitle}>Exercise Recommendations</Text>
            </View>

            <GlassCard>
              {insights.exerciseRecommendations.map((rec: string, index: number) => (
                <View key={index} style={styles.exerciseCard}>
                  <Icon name="check-circle" size={20} color="#3B82F6" />
                  <Text style={styles.exerciseText}>{rec}</Text>
                </View>
              ))}
            </GlassCard>
          </Animated.View>
        )}

        {/* Monitoring Plan */}
        {insights.monitoringPlan && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Icon name="clipboard-pulse" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.sectionTitle}>Monitoring Plan</Text>
            </View>

            <GlassCard style={styles.monitoringCard}>
              {insights.monitoringPlan.parameters?.length > 0 && (
                <View style={styles.monitoringSection}>
                  <Text style={styles.monitoringLabel}>What to Monitor:</Text>
                  {insights.monitoringPlan.parameters.map((param: string, idx: number) => (
                    <View key={idx} style={styles.monitoringItem}>
                      <Icon name="circle-small" size={16} color="#F59E0B" />
                      <Text style={styles.monitoringText}>{param}</Text>
                    </View>
                  ))}
                </View>
              )}

              {insights.monitoringPlan.frequency && (
                <View style={styles.monitoringSection}>
                  <Text style={styles.monitoringLabel}>Frequency:</Text>
                  <Text style={styles.monitoringValue}>
                    {insights.monitoringPlan.frequency}
                  </Text>
                </View>
              )}

              {insights.monitoringPlan.targets?.length > 0 && (
                <View style={styles.monitoringSection}>
                  <Text style={styles.monitoringLabel}>Target Goals:</Text>
                  {insights.monitoringPlan.targets.map((target: string, idx: number) => (
                    <View key={idx} style={styles.monitoringItem}>
                      <Icon name="target" size={16} color="#4CAF50" />
                      <Text style={styles.monitoringText}>{target}</Text>
                    </View>
                  ))}
                </View>
              )}
            </GlassCard>
          </Animated.View>
        )}

        <Animated.View style={[styles.disclaimerBox, { opacity: fadeAnim }]}>
          <Icon name="information" size={20} color="#6B7280" />
          <Text style={styles.disclaimerText}>
            These insights are AI-generated based on your health data and should not
            replace professional medical advice. Always consult with your healthcare
            provider before making significant changes to your diet or exercise routine.
          </Text>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 16,
  },
  insightCard: {
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  insightText: {
    fontSize: 15,
    color: '#1A1A2E',
    lineHeight: 24,
    marginBottom: 12,
  },
  actionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  nutritionSection: {
    marginBottom: 16,
  },
  nutritionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  nutritionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  nutritionList: {
    gap: 8,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  nutritionItemWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  nutritionItemInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  nutritionItemText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A2E',
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  exerciseText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A2E',
    lineHeight: 20,
  },
  monitoringCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  monitoringSection: {
    marginBottom: 16,
  },
  monitoringLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  monitoringValue: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  monitoringItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginBottom: 4,
  },
  monitoringText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    marginTop: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});

export default HealthInsightsScreen;
