import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Card, Button } from '../../components';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { theme } from '../../theme';

const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

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
      <Icon name={icon} size={24} color={theme.colors.primary} />
      <View style={styles.profileItemContent}>
        <Text style={styles.profileLabel}>{label}</Text>
        {value && <Text style={styles.profileValue}>{value}</Text>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.gradient.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <View style={styles.avatarContainer}>
          <Icon name="person" size={60} color={theme.colors.textLight} />
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Card>
          <Text style={styles.sectionTitle}>Personal Information</Text>
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
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Goals</Text>
          {user?.goals?.dailyCalories && (
            <ProfileItem
              icon="local-fire-department"
              label="Daily Calories"
              value={`${user.goals.dailyCalories} kcal`}
            />
          )}
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
        </Card>

        <Card>
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="settings" size={24} color={theme.colors.text} />
            <Text style={styles.menuText}>Settings</Text>
            <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Icon name="help" size={24} color={theme.colors.text} />
            <Text style={styles.menuText}>Help & Support</Text>
            <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Icon name="privacy-tip" size={24} color={theme.colors.text} />
            <Text style={styles.menuText}>Privacy Policy</Text>
            <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  header: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  name: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textLight,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  profileItemContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  profileLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  profileValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  logoutButton: {
    marginVertical: theme.spacing.lg,
  },
});

export default ProfileScreen;
