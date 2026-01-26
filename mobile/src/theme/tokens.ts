/**
 * Design System Tokens
 * Matches web shadcn/ui styling exactly
 */

// Colors - matching shadcn light theme
export const colors = {
    // Base colors
    background: "#ffffff",
    foreground: "#09090b",

    // Card
    card: "#ffffff",
    cardForeground: "#09090b",

    // Primary (shadcn blue)
    primary: "#2563eb",
    primaryForeground: "#f8fafc",

    // Secondary
    secondary: "#f4f4f5",
    secondaryForeground: "#18181b",

    // Muted
    muted: "#f4f4f5",
    mutedForeground: "#71717a",

    // Accent
    accent: "#f4f4f5",
    accentForeground: "#18181b",

    // Destructive
    destructive: "#ef4444",
    destructiveForeground: "#fafafa",

    // Border & Input
    border: "#e4e4e7",
    input: "#e4e4e7",
    ring: "#2563eb",

    // Semantic Colors
    success: "#22c55e",
    warning: "#eab308",
    orange: "#f97316",
    blue: "#3b82f6",
    purple: "#a855f7",

    // Transparent overlays
    primaryLight: "rgba(37, 99, 235, 0.1)",
    successLight: "rgba(34, 197, 94, 0.1)",
    warningLight: "rgba(234, 179, 8, 0.15)",
    orangeLight: "rgba(249, 115, 22, 0.1)",
};

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
    4: 16, // Base padding
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
    sm: 6,    // rounded-sm
    md: 8,    // rounded-md / rounded
    lg: 12,   // rounded-lg (cards)
    xl: 16,   // rounded-xl
    full: 9999,
};

// Font Sizes - matching Tailwind text-* scale
export const fontSize = {
    xs: 12,    // text-xs
    sm: 14,    // text-sm
    base: 16,  // text-base
    lg: 18,    // text-lg
    xl: 20,    // text-xl
    "2xl": 24, // text-2xl
    "3xl": 30, // text-3xl
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

// Shadows - subtle like shadcn
export const shadows = {
    sm: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
};

// Icon Sizes - matching lucide-react standard sizes
export const iconSize = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
};

export default {
    colors,
    spacing,
    radius,
    fontSize,
    fontWeight,
    lineHeight,
    shadows,
    iconSize,
};
