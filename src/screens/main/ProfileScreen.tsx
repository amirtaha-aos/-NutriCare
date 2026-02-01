import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, setUser } from '../../store/slices/authSlice';
import { userService } from '../../services';

// Glass Card Component
const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: any;
}> = ({ children, style }) => {
  return (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );
};

const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    weight: user?.weight?.toString() || '',
    height: user?.height?.toString() || '',
    age: user?.age?.toString() || '',
    gender: user?.gender || 'male',
    activityLevel: user?.activityLevel || 'moderate',
    goalType: user?.goals?.goalType || 'maintain',
  });
  const [isSaving, setIsSaving] = useState(false);

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

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const updatedUser = await userService.updateProfile({
        name: editData.name || undefined,
        weight: parseFloat(editData.weight) || undefined,
        height: parseFloat(editData.height) || undefined,
        age: parseInt(editData.age) || undefined,
        gender: editData.gender as 'male' | 'female' | 'other',
        activityLevel: editData.activityLevel as any,
        goals: {
          ...user?.goals,
          goalType: editData.goalType as any,
        },
      });
      dispatch(setUser(updatedUser));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate BMI
  const calculateBMI = () => {
    if (!user?.weight || !user?.height) return null;
    const heightInMeters = user.height / 100;
    return Math.round((user.weight / (heightInMeters * heightInMeters)) * 10) / 10;
  };

  // Get BMI category
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: '#FFA500' };
    if (bmi < 25) return { label: 'Normal', color: '#4CAF50' };
    if (bmi < 30) return { label: 'Overweight', color: '#FFA500' };
    return { label: 'Obese', color: '#F44336' };
  };

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    if (!user?.weight || !user?.height || !user?.age || !user?.gender) return null;
    let bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age;
    if (user.gender === 'male') bmr += 5;
    else if (user.gender === 'female') bmr -= 161;
    else bmr -= 78;
    return Math.round(bmr);
  };

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = () => {
    const bmr = calculateBMR();
    if (!bmr) return null;
    const activityFactors: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const factor = activityFactors[user?.activityLevel || 'moderate'] || 1.55;
    return Math.round(bmr * factor);
  };

  // Calculate recommended daily calories based on goal
  const calculateRecommendedCalories = () => {
    const tdee = calculateTDEE();
    if (!tdee) return null;
    if (user?.goals?.goalType === 'lose_weight') return tdee - 500;
    if (user?.goals?.goalType === 'gain_muscle') return tdee + 400;
    return tdee;
  };

  // Calculate ideal weight range
  const calculateIdealWeight = () => {
    if (!user?.height) return null;
    const heightInMeters = user.height / 100;
    return {
      min: Math.round(18.5 * heightInMeters * heightInMeters),
      max: Math.round(24.9 * heightInMeters * heightInMeters),
    };
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(bmi) : null;
  const recommendedCalories = calculateRecommendedCalories();
  const idealWeight = calculateIdealWeight();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  const ProfileItem: React.FC<{ icon: string; label: string; value?: string }> = ({
    icon,
    label,
    value,
  }) => (
    <View style={styles.profileItem}>
      <View style={styles.profileItemIcon}>
        <Icon name={icon} size={20} color="#4CAF50" />
      </View>
      <View style={styles.profileItemContent}>
        <Text style={styles.profileLabel}>{label}</Text>
        {value && <Text style={styles.profileValue}>{value}</Text>}
      </View>
    </View>
  );

  const MenuItem: React.FC<{ icon: string; label: string; onPress?: () => void }> = ({
    icon,
    label,
    onPress,
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemIcon}>
        <Icon name={icon} size={20} color="#4CAF50" />
      </View>
      <Text style={styles.menuText}>{label}</Text>
      <Icon name="chevron-right" size={22} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const genderOptions = ['male', 'female', 'other'];
  const activityOptions = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
  const goalOptions = ['lose_weight', 'maintain', 'gain_muscle'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Edit Profile Modal */}
      <Modal visible={isEditing} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.name}
                  onChangeText={(v) => setEditData({ ...editData, name: v })}
                  placeholder="Your name"
                  autoCapitalize="words"
                />
              </View>

              {/* Weight */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.weight}
                  onChangeText={(v) => setEditData({ ...editData, weight: v })}
                  keyboardType="numeric"
                  placeholder="e.g. 70"
                />
              </View>

              {/* Height */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.height}
                  onChangeText={(v) => setEditData({ ...editData, height: v })}
                  keyboardType="numeric"
                  placeholder="e.g. 175"
                />
              </View>

              {/* Age */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.age}
                  onChangeText={(v) => setEditData({ ...editData, age: v })}
                  keyboardType="numeric"
                  placeholder="e.g. 25"
                />
              </View>

              {/* Gender */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.optionsRow}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionButton,
                        editData.gender === option && styles.optionButtonActive,
                      ]}
                      onPress={() => setEditData({ ...editData, gender: option })}>
                      <Text
                        style={[
                          styles.optionText,
                          editData.gender === option && styles.optionTextActive,
                        ]}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Activity Level */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Activity Level</Text>
                <View style={styles.optionsColumn}>
                  {activityOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionButtonWide,
                        editData.activityLevel === option && styles.optionButtonActive,
                      ]}
                      onPress={() => setEditData({ ...editData, activityLevel: option })}>
                      <Text
                        style={[
                          styles.optionText,
                          editData.activityLevel === option && styles.optionTextActive,
                        ]}>
                        {option.replace('_', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Goal Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Goal</Text>
                <View style={styles.optionsColumn}>
                  {goalOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionButtonWide,
                        editData.goalType === option && styles.optionButtonActive,
                      ]}
                      onPress={() => setEditData({ ...editData, goalType: option })}>
                      <Text
                        style={[
                          styles.optionText,
                          editData.goalType === option && styles.optionTextActive,
                        ]}>
                        {option.replace('_', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSaveProfile}
              disabled={isSaving}>
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

      {/* Header with Avatar */}
      <LinearGradient
        colors={['#4CAF50', '#81C784']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <View style={styles.avatarContainer}>
          <Icon name="person" size={50} color="#fff" />
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Health Metrics - BMI & Calories */}
        {(bmi || recommendedCalories) && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <GlassCard>
              <Text style={styles.sectionTitle}>Health Metrics</Text>

              {/* BMI Display */}
              {bmi && bmiCategory && (
                <View style={styles.bmiContainer}>
                  <View style={styles.bmiCircle}>
                    <Text style={styles.bmiValue}>{bmi}</Text>
                    <Text style={styles.bmiLabel}>BMI</Text>
                  </View>
                  <View style={styles.bmiInfo}>
                    <Text style={[styles.bmiCategory, { color: bmiCategory.color }]}>
                      {bmiCategory.label}
                    </Text>
                    <Text style={styles.bmiDescription}>
                      {bmi < 18.5 && 'Consider gaining some weight for optimal health.'}
                      {bmi >= 18.5 && bmi < 25 && 'Great job! Your weight is in a healthy range.'}
                      {bmi >= 25 && bmi < 30 && 'Consider losing some weight for better health.'}
                      {bmi >= 30 && 'Talk to a doctor about weight management.'}
                    </Text>
                    {idealWeight && (
                      <Text style={styles.idealWeight}>
                        Ideal weight: {idealWeight.min} - {idealWeight.max} kg
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Recommended Calories */}
              {recommendedCalories && (
                <View style={styles.caloriesContainer}>
                  <View style={styles.caloriesIconContainer}>
                    <Icon name="local-fire-department" size={24} color="#FF6B6B" />
                  </View>
                  <View style={styles.caloriesInfo}>
                    <Text style={styles.caloriesLabel}>Recommended Daily Calories</Text>
                    <Text style={styles.caloriesValue}>{recommendedCalories} kcal</Text>
                    <Text style={styles.caloriesNote}>
                      Based on your profile{user?.goals?.goalType ? ` and ${user.goals.goalType.replace('_', ' ')} goal` : ''}
                    </Text>
                  </View>
                </View>
              )}

              {/* Missing Data Warning */}
              {(!user?.weight || !user?.height || !user?.age || !user?.gender) && (
                <TouchableOpacity
                  style={styles.warningContainer}
                  onPress={() => setIsEditing(true)}>
                  <Icon name="info" size={20} color="#FFA500" />
                  <Text style={styles.warningText}>
                    Tap here to complete your profile for accurate calculations
                  </Text>
                  <Icon name="edit" size={18} color="#FFA500" />
                </TouchableOpacity>
              )}
            </GlassCard>
          </Animated.View>
        )}

        {/* Personal Information */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Icon name="edit" size={20} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            <ProfileItem icon="email" label="Email" value={user?.email} />
            {user?.age && <ProfileItem icon="cake" label="Age" value={`${user.age} years`} />}
            {user?.gender && (
              <ProfileItem
                icon="person"
                label="Gender"
                value={user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
              />
            )}
            {user?.weight && <ProfileItem icon="fitness-center" label="Weight" value={`${user.weight} kg`} />}
            {user?.height && <ProfileItem icon="height" label="Height" value={`${user.height} cm`} />}
          </GlassCard>
        </Animated.View>

        {/* Goals */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Daily Goals</Text>
            <ProfileItem
              icon="local-fire-department"
              label="Daily Calories"
              value={`${user?.goals?.dailyCalories || recommendedCalories || 2000} kcal`}
            />
            {user?.goals?.dailyProtein && (
              <ProfileItem
                icon="restaurant"
                label="Daily Protein"
                value={`${user.goals.dailyProtein}g`}
              />
            )}
            {user?.goals?.goalType && (
              <ProfileItem
                icon="flag"
                label="Goal"
                value={user.goals.goalType.replace('_', ' ').toUpperCase()}
              />
            )}
            {user?.activityLevel && (
              <ProfileItem
                icon="directions-run"
                label="Activity Level"
                value={user.activityLevel.replace('_', ' ').toUpperCase()}
              />
            )}
          </GlassCard>
        </Animated.View>

        {/* Menu Items */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <GlassCard>
            <MenuItem icon="settings" label="Settings" />
            <MenuItem icon="help" label="Help & Support" />
            <MenuItem icon="privacy-tip" label="Privacy Policy" />
          </GlassCard>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <Icon name="logout" size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Logout</Text>
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
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    top: 200,
    right: -80,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(129, 199, 132, 0.06)',
    bottom: 150,
    left: -60,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 14,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  profileItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileItemContent: {
    flex: 1,
  },
  profileLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  profileValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A2E',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  bmiCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  bmiValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
  },
  bmiLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  bmiInfo: {
    flex: 1,
  },
  bmiCategory: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  bmiDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  idealWeight: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 6,
    fontWeight: '500',
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  caloriesIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  caloriesInfo: {
    flex: 1,
  },
  caloriesLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  caloriesValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    marginTop: 2,
  },
  caloriesNote: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#B45309',
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionsColumn: {
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionButtonWide: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  optionTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ProfileScreen;
