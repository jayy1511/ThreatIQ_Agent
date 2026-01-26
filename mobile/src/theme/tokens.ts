/**
 * Design System Tokens
 * Matches web shadcn/ui styling EXACTLY
 * 
 * Web uses HSL values - converted to hex:
 * Light mode: primary = 0 0% 9% (black/#171717)
 * Dark mode: primary = 0 0% 98% (white/#fafafa)
 */

// Light Theme Colors - matching web globals.css exactly
export const lightColors = {
    // Base
    background: "#ffffff",           // 0 0% 100%
    foreground: "#0a0a0a",           // 0 0% 3.9%

    // Card
    card: "#ffffff",
    cardForeground: "#0a0a0a",

    // Primary (BLACK in light theme!)
    primary: "#171717",              // 0 0% 9%
    primaryForeground: "#fafafa",    // 0 0% 98%

    // Secondary
    secondary: "#f5f5f5",            // 0 0% 96.1%
    secondaryForeground: "#171717",  // 0 0% 9%

    // Muted
    muted: "#f5f5f5",                // 0 0% 96.1%
    mutedForeground: "#737373",      // 0 0% 45.1%

    // Accent
    accent: "#f5f5f5",
    accentForeground: "#171717",

    // Destructive
    destructive: "#ef4444",          // 0 84.2% 60.2%
    destructiveForeground: "#fafafa",

    // Border & Input
    border: "#e5e5e5",               // 0 0% 89.8%
    input: "#e5e5e5",
    ring: "#0a0a0a",                 // 0 0% 3.9%

    // Semantic Colors (feature-specific)
    success: "#22c55e",
    warning: "#eab308",
    orange: "#f97316",
    blue: "#3b82f6",
    purple: "#a855f7",
    red: "#ef4444",
    green: "#22c55e",
};

// Dark Theme Colors
export const darkColors = {
    background: "#0a0a0a",           // 0 0% 3.9%
    foreground: "#fafafa",           // 0 0% 98%

    card: "#0a0a0a",
    cardForeground: "#fafafa",

    primary: "#fafafa",              // 0 0% 98%
    primaryForeground: "#171717",    // 0 0% 9%

    secondary: "#262626",            // 0 0% 14.9%
    secondaryForeground: "#fafafa",

    muted: "#262626",
    mutedForeground: "#a3a3a3",      // 0 0% 63.9%

    accent: "#262626",
    accentForeground: "#fafafa",

    destructive: "#7f1d1d",          // 0 62.8% 30.6%
    destructiveForeground: "#fafafa",

    border: "#262626",
    input: "#262626",
    ring: "#d4d4d4",                 // 0 0% 83.1%

    success: "#22c55e",
    warning: "#eab308",
    orange: "#f97316",
    blue: "#3b82f6",
    purple: "#a855f7",
    red: "#ef4444",
    green: "#22c55e",
};

// Default to light theme (can be switched via context)
export const colors = lightColors;

// Spacing - consistent with web Tailwind spacing
export const spacing = {
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
};

// Border Radius - matching web rounded-* classes
export const radius = {
    none: 0,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

// Font Sizes - matching Tailwind text-* scale
export const fontSize = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
};

// Font Weights
export const fontWeight = {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
};

// Line Heights
export const lineHeight = {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
};

// Icon Sizes
export const iconSize = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
};

export default {
    colors,
    lightColors,
    darkColors,
    spacing,
    radius,
    fontSize,
    fontWeight,
    lineHeight,
    iconSize,
};
