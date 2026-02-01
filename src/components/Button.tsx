import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const handlePress = () => {
    console.log('Button: Press detected', { title, disabled, loading });
    if (!disabled && !loading) {
      onPress();
    }
  };
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.gradient.primary;
      case 'secondary':
        return theme.colors.gradient.secondary;
      default:
        return [theme.colors.background, theme.colors.background];
    }
  };

  const buttonStyle = [
    styles.button,
    styles[size],
    variant === 'outline' && styles.outline,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${size}`],
    variant === 'outline' && styles.outlineText,
    disabled && styles.disabledText,
    textStyle,
  ];

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={buttonStyle}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.7}>
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <Text style={textStyles}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.gradientContainer, style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      <LinearGradient
        colors={disabled ? [theme.colors.disabled, theme.colors.disabled] : getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, styles[size]]}>
        {loading ? (
          <ActivityIndicator color={theme.colors.textLight} />
        ) : (
          <Text style={textStyles}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  small: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  medium: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  large: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: theme.colors.textLight,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  text_small: {
    fontSize: theme.typography.fontSize.sm,
  },
  text_medium: {
    fontSize: theme.typography.fontSize.md,
  },
  text_large: {
    fontSize: theme.typography.fontSize.lg,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },
});
