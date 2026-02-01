import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    round: 999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
    glass: {
      shadowColor: 'rgba(31, 38, 135, 0.37)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 32,
      elevation: 8,
    },
  },
  // Glassmorphism card styles - Nature/Health theme
  glass: {
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(76, 175, 80, 0.12)',
    },
    cardMedium: {
      backgroundColor: 'rgba(255, 255, 255, 0.45)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(76, 175, 80, 0.15)',
    },
    cardStrong: {
      backgroundColor: 'rgba(255, 255, 255, 0.65)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(76, 175, 80, 0.18)',
    },
  },
};

export type Theme = typeof theme;

export { colors } from './colors';
export { spacing } from './spacing';
export { typography } from './typography';
