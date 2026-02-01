export const colors = {
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#81C784',
  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFB74D',

  accent: '#2196F3',

  // Glassmorphism backgrounds
  background: '#F0F4F8',
  backgroundSecondary: '#E8EEF4',
  surface: 'rgba(255, 255, 255, 0.7)',
  surfaceGlass: 'rgba(255, 255, 255, 0.25)',

  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#FFFFFF',

  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  info: '#3B82F6',

  // Glass borders
  border: 'rgba(255, 255, 255, 0.3)',
  borderGlass: 'rgba(255, 255, 255, 0.18)',
  divider: 'rgba(0, 0, 0, 0.08)',

  disabled: '#9CA3AF',
  placeholder: '#9CA3AF',

  // Modern gradients for glassmorphism - Nature/Health theme
  gradient: {
    primary: ['#4CAF50', '#81C784'],
    secondary: ['#66BB6A', '#A5D6A7'],
    accent: ['#43A047', '#76D275'],
    glass: ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)'],
    background: ['#E8F5E9', '#C8E6C9', '#A5D6A7'],
    backgroundAlt: ['#C8E6C9', '#E8F5E9'],
    cool: ['#E8F5E9', '#C8E6C9'],
  },

  nutrition: {
    protein: '#EC4899',
    carbs: '#F59E0B',
    fats: '#8B5CF6',
    calories: '#EF4444',
  },

  // Glass specific - Nature/Health theme
  glass: {
    white: 'rgba(255, 255, 255, 0.25)',
    whiteMedium: 'rgba(255, 255, 255, 0.4)',
    whiteStrong: 'rgba(255, 255, 255, 0.6)',
    dark: 'rgba(0, 0, 0, 0.1)',
    border: 'rgba(76, 175, 80, 0.15)',
    shadow: 'rgba(76, 175, 80, 0.12)',
  },
};

export type Colors = typeof colors;
