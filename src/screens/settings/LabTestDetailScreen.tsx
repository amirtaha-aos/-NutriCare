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

const LabTestDetailScreen = ({ route }: any) => {
  const { labTest } = route.params;
  const results = labTest.results || {};

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

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return '#EF4444';
      case 'concerning':
        return '#F59E0B';
      case 'moderate':
        return '#FBBF24';
      case 'mild':
      case 'low':
        return '#84CC16';
      default:
        return '#4CAF50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'critical':
        return 'alert-octagon';
      case 'high':
        return 'arrow-up-circle';
      case 'low':
        return 'arrow-down-circle';
      default:
        return 'check-circle';
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
            <Icon name="flask" size={32} color="#4CAF50" />
          </View>
          <Text style={styles.testType}>{labTest.testType}</Text>
          <Text style={styles.testDate}>
            {new Date(labTest.testDate).toLocaleDateString()}
          </Text>
          {results.overallAssessment && (
            <View style={[styles.overallBadge, { backgroundColor: getSeverityColor(results.overallAssessment.severity) }]}>
              <Text style={styles.overallText}>{results.overallAssessment.severity}</Text>
            </View>
          )}
        </Animated.View>

        {/* Overall Assessment */}
        {results.overallAssessment && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <GlassCard>
              <Text style={styles.sectionTitle}>Overall Assessment</Text>
              <Text style={styles.summaryText}>{results.overallAssessment.summary}</Text>
              {results.overallAssessment.keyFindings?.length > 0 && (
                <View style={styles.findingsList}>
                  {results.overallAssessment.keyFindings.map((finding: string, index: number) => (
                    <View key={index} style={styles.findingItem}>
                      <Icon name="circle-small" size={20} color="#4CAF50" />
                      <Text style={styles.findingText}>{finding}</Text>
                    </View>
                  ))}
                </View>
              )}
            </GlassCard>
          </Animated.View>
        )}

        {/* Extracted Values */}
        {results.extractedValues?.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.sectionTitleOutside}>Test Results</Text>
            {results.extractedValues.map((value: any, index: number) => (
              <GlassCard key={index} style={styles.valueCard}>
                <View style={styles.valueHeader}>
                  <Text style={styles.parameterName}>{value.parameter}</Text>
                  <Icon
                    name={getStatusIcon(value.status)}
                    size={24}
                    color={getSeverityColor(value.status)}
                  />
                </View>
                <View style={styles.valueRow}>
                  <Text style={styles.valueText}>{value.value} {value.unit}</Text>
                  <Text style={styles.rangeText}>Normal: {value.normalRange}</Text>
                </View>
                {value.interpretation && (
                  <Text style={styles.interpretationText}>{value.interpretation}</Text>
                )}
              </GlassCard>
            ))}
          </Animated.View>
        )}

        {/* Abnormalities */}
        {results.abnormalities?.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Icon name="alert-circle" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.sectionTitleOutside}>Abnormalities Detected</Text>
            </View>
            {results.abnormalities.map((abnormality: any, index: number) => (
              <GlassCard key={index} style={styles.abnormalityCard}>
                <View style={styles.abnormalityHeader}>
                  <Text style={styles.abnormalityParameter}>{abnormality.parameter}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getSeverityColor(abnormality.status) }]}>
                    <Text style={styles.statusText}>{abnormality.status}</Text>
                  </View>
                </View>
                <Text style={styles.abnormalityValue}>Value: {abnormality.value}</Text>
                <Text style={styles.significanceText}>{abnormality.significance}</Text>
                {abnormality.possibleCauses?.length > 0 && (
                  <View style={styles.causesList}>
                    <Text style={styles.causesLabel}>Possible causes:</Text>
                    {abnormality.possibleCauses.map((cause: string, idx: number) => (
                      <Text key={idx} style={styles.causeText}>• {cause}</Text>
                    ))}
                  </View>
                )}
              </GlassCard>
            ))}
          </Animated.View>
        )}

        {/* Health Risks */}
        {results.healthRisks?.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Icon name="shield-alert" size={20} color="#EF4444" />
              </View>
              <Text style={styles.sectionTitleOutside}>Health Risks</Text>
            </View>
            {results.healthRisks.map((risk: any, index: number) => (
              <GlassCard key={index} style={styles.riskCard}>
                <View style={styles.riskHeader}>
                  <Text style={styles.riskName}>{risk.risk}</Text>
                  <View style={[styles.riskBadge, { backgroundColor: getSeverityColor(risk.level) }]}>
                    <Text style={styles.riskLevel}>{risk.level}</Text>
                  </View>
                </View>
                <Text style={styles.riskDescription}>{risk.description}</Text>
                <View style={styles.preventionBox}>
                  <Text style={styles.preventionLabel}>Prevention:</Text>
                  <Text style={styles.preventionText}>{risk.prevention}</Text>
                </View>
              </GlassCard>
            ))}
          </Animated.View>
        )}

        {/* Dietary Recommendations */}
        {results.dietaryRecommendations?.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Icon name="food-apple" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.sectionTitleOutside}>Dietary Recommendations</Text>
            </View>
            {results.dietaryRecommendations.map((rec: any, index: number) => (
              <GlassCard key={index}>
                <Text style={styles.dietRecommendation}>{rec.recommendation}</Text>
                <Text style={styles.dietReason}>{rec.reason}</Text>

                {rec.foods && (
                  <View style={styles.foodsContainer}>
                    {rec.foods.increase?.length > 0 && (
                      <View style={styles.foodSection}>
                        <Text style={styles.foodLabel}>Increase:</Text>
                        {rec.foods.increase.map((food: string, idx: number) => (
                          <Text key={idx} style={styles.foodItemGood}>+ {food}</Text>
                        ))}
                      </View>
                    )}

                    {rec.foods.decrease?.length > 0 && (
                      <View style={styles.foodSection}>
                        <Text style={styles.foodLabel}>Decrease:</Text>
                        {rec.foods.decrease.map((food: string, idx: number) => (
                          <Text key={idx} style={styles.foodItemWarning}>- {food}</Text>
                        ))}
                      </View>
                    )}

                    {rec.foods.avoid?.length > 0 && (
                      <View style={styles.foodSection}>
                        <Text style={styles.foodLabel}>Avoid:</Text>
                        {rec.foods.avoid.map((food: string, idx: number) => (
                          <Text key={idx} style={styles.foodItemBad}>✗ {food}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </GlassCard>
            ))}
          </Animated.View>
        )}

        {/* Lifestyle Recommendations */}
        {results.lifestyleRecommendations?.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Icon name="run" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.sectionTitleOutside}>Lifestyle Recommendations</Text>
            </View>
            <GlassCard>
              {results.lifestyleRecommendations.map((rec: string, index: number) => (
                <View key={index} style={styles.lifestyleItem}>
                  <Icon name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.lifestyleText}>{rec}</Text>
                </View>
              ))}
            </GlassCard>
          </Animated.View>
        )}

        {/* Follow-up */}
        {results.followUp && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Icon name="calendar-clock" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.sectionTitleOutside}>Follow-up</Text>
            </View>
            <GlassCard style={styles.followUpCard}>
              <View style={styles.urgencyBadge}>
                <Text style={styles.urgencyText}>Urgency: {results.followUp.urgency}</Text>
              </View>
              <Text style={styles.followUpAction}>{results.followUp.action}</Text>
              <Text style={styles.followUpTimeframe}>Timeframe: {results.followUp.timeframe}</Text>
              {results.followUp.additionalTests?.length > 0 && (
                <View style={styles.additionalTests}>
                  <Text style={styles.additionalTestsLabel}>Additional tests recommended:</Text>
                  {results.followUp.additionalTests.map((test: string, idx: number) => (
                    <Text key={idx} style={styles.additionalTestItem}>• {test}</Text>
                  ))}
                </View>
              )}
            </GlassCard>
          </Animated.View>
        )}

        {/* Disclaimer */}
        {results.disclaimer && (
          <Animated.View style={[styles.disclaimerBox, { opacity: fadeAnim }]}>
            <Icon name="information" size={20} color="#6B7280" />
            <Text style={styles.disclaimerText}>{results.disclaimer}</Text>
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
  testType: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  testDate: {
    fontSize: 15,
    color: '#388E3C',
    marginBottom: 12,
  },
  overallBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  overallText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  sectionTitleOutside: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    color: '#1A1A2E',
    lineHeight: 24,
    marginBottom: 12,
  },
  findingsList: {
    marginTop: 8,
  },
  findingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  findingText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  valueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  valueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  parameterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
  },
  rangeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  interpretationText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  abnormalityCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  abnormalityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  abnormalityParameter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  abnormalityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 8,
  },
  significanceText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  causesList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.2)',
  },
  causesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  causeText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  riskCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    flex: 1,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskLevel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  riskDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  preventionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  preventionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  preventionText: {
    fontSize: 13,
    color: '#6B7280',
  },
  dietRecommendation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  dietReason: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  foodsContainer: {
    gap: 12,
  },
  foodSection: {
    gap: 4,
  },
  foodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  foodItemGood: {
    fontSize: 14,
    color: '#4CAF50',
    paddingLeft: 8,
  },
  foodItemWarning: {
    fontSize: 14,
    color: '#F59E0B',
    paddingLeft: 8,
  },
  foodItemBad: {
    fontSize: 14,
    color: '#EF4444',
    paddingLeft: 8,
  },
  lifestyleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  lifestyleText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  followUpCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  urgencyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D97706',
    textTransform: 'capitalize',
  },
  followUpAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  followUpTimeframe: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  additionalTests: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(76, 175, 80, 0.15)',
  },
  additionalTestsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  additionalTestItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
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

export default LabTestDetailScreen;
