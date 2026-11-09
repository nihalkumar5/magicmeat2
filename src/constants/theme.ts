// Minimalist Modern Design System
export const THEME = {
  colors: {
    // Canvas & Surfaces
    background: '#FFFFFF',
    canvasBg: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceSubtle: '#F5F5F7',
    surfaceBorder: '#EAEAED',
    surfaceHover: '#EEEEF2',

    // Primary Accents
    primary: '#111111',
    primaryBlack: '#111111',
    primaryLight: '#333333',
    primaryMuted: '#71717A',

    // Subtle Badges
    badgeMagenta: '#111111',
    badgeMagentaBg: '#F5F5F7',
    badgeGreen: '#166534',
    badgeGreenBg: '#F0FDF4',

    // Macro Colors (Refined subtle)
    macroProtein: '#DC2626',
    macroProteinBg: 'rgba(220, 38, 38, 0.08)',
    macroCarbs: '#D97706',
    macroCarbsBg: 'rgba(217, 119, 6, 0.08)',
    macroFat: '#2563EB',
    macroFatBg: 'rgba(37, 99, 235, 0.08)',
    macroCalories: '#111111',

    // Subtle Indicators
    accentEmerald: '#166534',
    accentEmeraldBg: '#F0FDF4',
    accentAmber: '#854D0E',
    accentAmberBg: '#FEFCE8',
    accentCyan: '#0369A1',
    accentCyanBg: '#F0F9FF',

    // Text Hierarchy
    textPrimary: '#111111',
    textSecondary: '#666666',
    textMuted: '#999999',
    textInverse: '#FFFFFF',

    // Status
    danger: '#DC2626',
    success: '#166534',
    warning: '#D97706',
    info: '#2563EB',
  },
  radius: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  shadow: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
    subtle: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    button: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
  },
};
