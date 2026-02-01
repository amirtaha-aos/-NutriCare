import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  I18nManager,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import RNRestart from 'react-native-restart';
import { changeLanguage, getCurrentLanguage } from '../../i18n';

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

const LanguageSettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(getCurrentLanguage());

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

  const languages = [
    { code: 'en', name: t('settings.english'), icon: 'translate', isRTL: false },
    { code: 'fa', name: t('settings.persian'), icon: 'translate', isRTL: true },
  ];

  const handleLanguageChange = async (languageCode: string, isRTL: boolean) => {
    try {
      await changeLanguage(languageCode as 'en' | 'fa');
      setSelectedLanguage(languageCode);

      const needsRestart = I18nManager.isRTL !== isRTL;

      if (needsRestart) {
        Alert.alert(
          t('settings.languageChanged'),
          'The app will restart to apply RTL changes.',
          [
            {
              text: t('common.ok'),
              onPress: () => {
                I18nManager.forceRTL(isRTL);
                if (Platform.OS === 'android') {
                  RNRestart.Restart();
                } else {
                  Alert.alert('Info', 'Please restart the app manually to apply RTL changes.');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(t('common.success'), t('settings.languageChanged'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to change language');
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

      {/* Header */}
      <Animated.View
        style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.headerIcon}>
          <Icon name="translate" size={32} color="#4CAF50" />
        </View>
        <Text style={styles.headerTitle}>{t('settings.selectLanguage')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('settings.currentLanguage')}: {selectedLanguage === 'en' ? 'English' : 'فارسی'}
        </Text>
      </Animated.View>

      {/* Language List */}
      <Animated.View
        style={[styles.languageList, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            onPress={() => handleLanguageChange(language.code, language.isRTL)}
          >
            <GlassCard
              style={[
                styles.languageItem,
                selectedLanguage === language.code && styles.languageItemActive,
              ]}
            >
              <View style={styles.languageLeft}>
                <View
                  style={[
                    styles.languageIcon,
                    selectedLanguage === language.code && styles.languageIconActive,
                  ]}
                >
                  <Icon
                    name={language.icon}
                    size={24}
                    color={selectedLanguage === language.code ? '#fff' : '#4CAF50'}
                  />
                </View>
                <Text
                  style={[
                    styles.languageName,
                    selectedLanguage === language.code && styles.languageNameActive,
                  ]}
                >
                  {language.name}
                </Text>
              </View>

              {selectedLanguage === language.code && (
                <View style={styles.checkIcon}>
                  <Icon name="check-circle" size={24} color="#4CAF50" />
                </View>
              )}
            </GlassCard>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Info Box */}
      <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 16 }}>
        <GlassCard style={styles.infoBox}>
          <View style={styles.infoIconContainer}>
            <Icon name="information" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.infoText}>
            Changing to Persian (فارسی) will enable Right-to-Left (RTL) layout and may require an app restart.
          </Text>
        </GlassCard>
      </Animated.View>
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
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    paddingTop: 60,
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
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#388E3C',
    textAlign: 'center',
  },
  languageList: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    padding: 16,
    marginBottom: 12,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  languageItemActive: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  languageIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageIconActive: {
    backgroundColor: '#4CAF50',
  },
  languageName: {
    fontSize: 18,
    color: '#1A1A2E',
    fontWeight: '500',
  },
  languageNameActive: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  checkIcon: {
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
  },
});

export default LanguageSettingsScreen;
