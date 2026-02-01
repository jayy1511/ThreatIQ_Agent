// Theme colors matching WEB UI exactly
export const colors = {
    // Background colors (matches web dark theme)
    background: '#0B0B10',      // Near black
    card: '#12121A',            // Slightly lighter dark
    cardBorder: '#1E1E2E',      // Subtle border

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#E5E7EB',
    textMuted: '#9CA3AF',
    textDim: '#6B7280',

    // Primary accent (purple - matches web)
    primary: '#7C3AED',         // Primary purple
    primaryLight: '#8B5CF6',    // Lighter purple
    primaryDark: '#6D28D9',     // Darker purple

    // Accent alias
    accent: '#8B5CF6',
    accentLight: '#A78BFA',
    accentDark: '#7C3AED',

    // Status colors (matches web)
    success: '#10B981',         // Green
    successLight: '#34D399',
    successBg: 'rgba(16, 185, 129, 0.15)',

    warning: '#F59E0B',         // Orange/Yellow
    warningLight: '#FBBF24',
    warningBg: 'rgba(245, 158, 11, 0.15)',

    error: '#EF4444',           // Red
    errorLight: '#F87171',
    errorBg: 'rgba(239, 68, 68, 0.15)',

    // Input/form colors
    inputBackground: '#1A1A2E',
    inputBorder: '#2D2D44',
    inputFocusBorder: '#7C3AED',

    // Other
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    full: 9999,
};

export const fontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    hero: 40,
};

export const fontWeight = {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};
