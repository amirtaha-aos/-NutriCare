import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import apiClient from '../../services/api.config';

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

interface DrugInteraction {
  severity: string;
  hasInteractions: boolean;
  summary: string;
  urgency: string;
}

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const MedicationsScreen = ({ navigation }: any) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [interactionStatus, setInteractionStatus] = useState<DrugInteraction | null>(null);
  const [checkingInteractions, setCheckingInteractions] = useState(false);
  const isFocused = useIsFocused();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const fetchMedications = useCallback(async () => {
    try {
      const response = await apiClient.get('/health/profile');
      if (response.data.success) {
        setMedications(response.data.data.medications || []);
      }
    } catch (error: any) {
      console.error('Error fetching medications:', error);
      Alert.alert('Error', 'Failed to load medications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const checkDrugInteractions = async () => {
    if (medications.length === 0) {
      Alert.alert('No Medications', 'Add at least one medication to check interactions');
      return;
    }

    setCheckingInteractions(true);
    try {
      const response = await apiClient.get('/health/drug-interactions');
      if (response.data.success) {
        setInteractionStatus(response.data.data);

        const { severity, urgency, summary } = response.data.data;

        if (urgency === 'urgent' || severity === 'severe') {
          Alert.alert(
            '⚠️ Severe Drug Interaction Detected!',
            summary,
            [
              { text: 'View Details', onPress: () => showInteractionDetails(response.data.data) },
              { text: 'OK', style: 'cancel' }
            ]
          );
        } else if (severity === 'moderate') {
          Alert.alert(
            'Drug Interaction Warning',
            summary,
            [
              { text: 'View Details', onPress: () => showInteractionDetails(response.data.data) },
              { text: 'OK', style: 'cancel' }
            ]
          );
        } else {
          Alert.alert('✅ No Significant Interactions', summary);
        }
      }
    } catch (error: any) {
      console.error('Error checking interactions:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to check drug interactions');
    } finally {
      setCheckingInteractions(false);
    }
  };

  const showInteractionDetails = (data: any) => {
    navigation.navigate('DrugInteractionDetails', { interactionData: data });
  };

  const deleteMedication = async (medicationId: string) => {
    Alert.alert(
      'Delete Medication',
      'Are you sure you want to delete this medication?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/health/medication/${medicationId}`);
              Alert.alert('Success', 'Medication deleted successfully');
              fetchMedications();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete medication');
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMedications();
  };

  useEffect(() => {
    if (isFocused) {
      fetchMedications();
    }
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
  }, [fetchMedications, isFocused]);

  const renderMedication = ({ item }: { item: Medication }) => {
    const isActive = !item.endDate || new Date(item.endDate) > new Date();

    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <GlassCard style={styles.medicationCard}>
          <View style={styles.medicationHeader}>
            <View style={styles.medicationIconContainer}>
              <Icon name="pill" size={24} color="#EF4444" />
            </View>
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName}>{item.name}</Text>
              <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
                <Text style={[styles.statusText, isActive ? styles.activeText : styles.inactiveText]}>
                  {isActive ? 'Active' : 'Completed'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteMedication(item._id)}>
              <Icon name="delete-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <View style={styles.medicationDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="pill" size={14} color="#4CAF50" />
              </View>
              <Text style={styles.detailText}>Dosage: {item.dosage}</Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="clock-outline" size={14} color="#4CAF50" />
              </View>
              <Text style={styles.detailText}>Frequency: {item.frequency}</Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="calendar" size={14} color="#4CAF50" />
              </View>
              <Text style={styles.detailText}>
                Started: {new Date(item.startDate).toLocaleDateString()}
              </Text>
            </View>
            {item.notes && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Icon name="note-text-outline" size={14} color="#4CAF50" />
                </View>
                <Text style={styles.detailText} numberOfLines={2}>{item.notes}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.viewInfoButton}
            onPress={() => navigation.navigate('MedicationInfo', { medicationName: item.name })}>
            <Icon name="information-outline" size={18} color="#4CAF50" />
            <Text style={styles.viewInfoText}>View Drug Information</Text>
          </TouchableOpacity>
        </GlassCard>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <LinearGradient
          colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.centered}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
          <Text style={styles.loadingText}>Loading medications...</Text>
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
          <Icon name="pill" size={32} color="#EF4444" />
        </View>
        <Text style={styles.headerTitle}>My Medications</Text>
        <Text style={styles.headerSubtitle}>Manage and check interactions</Text>
      </Animated.View>

      {/* Interaction Check Section */}
      {medications.length > 0 && (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], paddingHorizontal: 16 }}>
          <GlassCard style={styles.interactionSection}>
            <TouchableOpacity
              style={styles.checkInteractionButton}
              onPress={checkDrugInteractions}
              disabled={checkingInteractions}>
              <LinearGradient
                colors={checkingInteractions ? ['#9CA3AF', '#9CA3AF'] : ['#F59E0B', '#FBBF24']}
                style={styles.checkButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                {checkingInteractions ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="alert-circle-outline" size={22} color="#fff" />
                    <Text style={styles.checkInteractionText}>Check Drug Interactions</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {interactionStatus && (
              <View style={[
                styles.statusCard,
                interactionStatus.severity === 'severe' ? styles.severeCard :
                interactionStatus.severity === 'moderate' ? styles.moderateCard :
                styles.safeCard
              ]}>
                <Icon
                  name={
                    interactionStatus.severity === 'severe' ? 'alert-circle' :
                    interactionStatus.severity === 'moderate' ? 'alert' :
                    'check-circle'
                  }
                  size={20}
                  color={
                    interactionStatus.severity === 'severe' ? '#EF4444' :
                    interactionStatus.severity === 'moderate' ? '#F59E0B' :
                    '#4CAF50'
                  }
                />
                <Text style={styles.statusSummary}>{interactionStatus.summary}</Text>
              </View>
            )}
          </GlassCard>
        </Animated.View>
      )}

      <FlatList
        data={medications}
        renderItem={renderMedication}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Animated.View
            style={[styles.emptyContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.emptyIcon}>
              <Icon name="pill" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.emptyText}>No medications added yet</Text>
            <Text style={styles.emptySubtext}>
              Add your medications to check for interactions
            </Text>
          </Animated.View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4CAF50"
            colors={['#4CAF50']}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddMedication')}>
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
  centered: {
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
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
  interactionSection: {
    marginBottom: 8,
  },
  checkInteractionButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  checkButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 10,
  },
  checkInteractionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  severeCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  moderateCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  safeCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  statusSummary: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A2E',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  medicationCard: {
    marginBottom: 12,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  medicationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  medicationInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  medicationName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeText: {
    color: '#4CAF50',
  },
  inactiveText: {
    color: '#6B7280',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicationDetails: {
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  viewInfoButton: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  viewInfoText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
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
  addButton: {
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

export default MedicationsScreen;
