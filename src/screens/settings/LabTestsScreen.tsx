import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../../services/api.config';

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const LabTestsScreen = ({ navigation }: any) => {
  const [labTests, setLabTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadLabTests();
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

  const loadLabTests = async () => {
    try {
      const response = await apiClient.get('/health/profile');
      const profile = response.data.data;
      setLabTests(profile.labTests || []);
    } catch (error) {
      console.error('Error loading lab tests:', error);
      Alert.alert('Error', 'Failed to load lab tests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadLabTests();
  }, []);

  const handleDeleteTest = async (testId: string) => {
    Alert.alert(
      'Delete Lab Test',
      'Are you sure you want to delete this lab test?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/health/lab-test/${testId}`);
              Alert.alert('Success', 'Lab test deleted successfully');
              loadLabTests();
            } catch (error) {
              console.error('Error deleting lab test:', error);
              Alert.alert('Error', 'Failed to delete lab test');
            }
          },
        },
      ]
    );
  };

  const handleViewTrends = async () => {
    if (labTests.length < 2) {
      Alert.alert('Info', 'At least 2 lab tests are required for trend analysis');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get('/health/lab-trends');

      navigation.navigate('LabTrends', {
        trendsData: response.data.data
      });
    } catch (error: any) {
      console.error('Error analyzing trends:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to analyze trends');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInsights = async () => {
    if (labTests.length === 0) {
      Alert.alert('Info', 'No lab tests available for analysis');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get('/health/health-insights');

      navigation.navigate('HealthInsights', {
        insights: response.data.data
      });
    } catch (error: any) {
      console.error('Error getting insights:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to get health insights');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return '#EF4444';
      case 'concerning':
        return '#F59E0B';
      case 'moderate':
        return '#FBBF24';
      case 'mild':
        return '#84CC16';
      default:
        return '#4CAF50';
    }
  };

  const renderLabTest = ({ item, index }: any) => {
    const testDate = new Date(item.testDate).toLocaleDateString();
    const severity = item.results?.overallAssessment?.severity || 'normal';
    const abnormalCount = item.results?.abnormalities?.length || 0;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}>
        <GlassCard style={styles.testCard}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('LabTestDetail', { labTest: item })}>
            <View style={styles.testHeader}>
              <View style={styles.testIconContainer}>
                <Icon name="flask" size={24} color="#4CAF50" />
              </View>
              <View style={styles.testInfo}>
                <Text style={styles.testType}>{item.testType}</Text>
                <Text style={styles.testDate}>{testDate}</Text>
              </View>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(severity) }]}>
                <Text style={styles.severityText}>{severity}</Text>
              </View>
            </View>

            {abnormalCount > 0 && (
              <View style={styles.abnormalityInfo}>
                <Icon name="alert-circle" size={16} color="#F59E0B" />
                <Text style={styles.abnormalityText}>
                  {abnormalCount} abnormal {abnormalCount === 1 ? 'value' : 'values'}
                </Text>
              </View>
            )}

            <View style={styles.testActions}>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => navigation.navigate('LabTestDetail', { labTest: item })}>
                <Icon name="eye" size={18} color="#4CAF50" />
                <Text style={styles.viewButtonText}>View Results</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteTest(item._id)}>
                <Icon name="delete-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </GlassCard>
      </Animated.View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <LinearGradient
          colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.centerContainer}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
          <Text style={styles.loadingText}>Loading lab tests...</Text>
        </View>
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
      <Animated.View
        style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.headerIcon}>
          <Icon name="flask" size={32} color="#4CAF50" />
        </View>
        <Text style={styles.headerTitle}>Lab Tests</Text>
        <Text style={styles.headerSubtitle}>AI-powered analysis of your results</Text>
      </Animated.View>

      {/* Action Buttons */}
      {labTests.length > 0 && (
        <Animated.View
          style={[styles.actionBar, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity
            style={[styles.actionButton, labTests.length < 2 && styles.actionButtonDisabled]}
            onPress={handleViewTrends}
            disabled={labTests.length < 2}>
            <LinearGradient
              colors={labTests.length < 2 ? ['#9CA3AF', '#9CA3AF'] : ['#4CAF50', '#66BB6A']}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Icon name="chart-line" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>View Trends</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleViewInsights}>
            <LinearGradient
              colors={['#8B5CF6', '#A78BFA']}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Icon name="lightbulb" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Health Insights</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

      <FlatList
        data={labTests}
        renderItem={renderLabTest}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4CAF50"
            colors={['#4CAF50']}
          />
        }
        ListEmptyComponent={
          <Animated.View
            style={[styles.emptyContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.emptyIcon}>
              <Icon name="flask-empty-outline" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.emptyText}>No lab tests yet</Text>
            <Text style={styles.emptySubtext}>
              Upload your lab test results to get AI-powered analysis
            </Text>
          </Animated.View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddLabTest', { onSuccess: loadLabTests })}>
        <LinearGradient
          colors={['#4CAF50', '#66BB6A']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Icon name="plus" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#388E3C',
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
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
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 8,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    marginBottom: 12,
  },
  testCard: {
    padding: 16,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  testInfo: {
    flex: 1,
  },
  testType: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  testDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  abnormalityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    padding: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  abnormalityText: {
    fontSize: 13,
    color: '#D97706',
    fontWeight: '500',
  },
  testActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 10,
  },
  viewButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LabTestsScreen;
