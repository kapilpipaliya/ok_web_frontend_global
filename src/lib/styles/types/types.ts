// Define color properties that can have shades
export type ThemeColorKey =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "base"
  | "info"
  | "success"
  | "warning"
  | "error";
// Space scale options
export type SpacingScale = "compact" | "default" | "loose";
// Border radius size options
export type RadiusSize = "none" | "sm" | "md" | "lg" | "xl" | "full";
// Animation easing presets
export type EasingPreset =
  | "linear"
  | "ease"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad";
// Media breakpoints
export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";
// Color modes
export type ColorMode = "light" | "dark" | "system";

// Mode-specific color definition
export type ModeSpecificColor = {
  light: string;
  dark: string;
};

// Color definition can be either unified or mode-specific
export type ColorDefinition = string | ModeSpecificColor;
// Color shade range (5% increments from 0-100)
export type ShadeNumber =
  | 0
  | 5
  | 10
  | 15
  | 20
  | 25
  | 30
  | 35
  | 40
  | 45
  | 50
  | 55
  | 60
  | 65
  | 70
  | 75
  | 80
  | 85
  | 90
  | 95
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 1000;

// Color adjustment options
export interface ColorAdjustments {
  lighten?: number;
  darken?: number;
  saturate?: number;
  desaturate?: number;
  spin?: number;
  alpha?: number;
}

// Typography settings
export interface TypographySettings {
  fontFamily?: string;
  fontHeading?: string;
  fontMono?: string;
  fontSizeBase?: string;
  lineHeightBase?: string | number;
  fontWeightBase?: number;
}

// Color palette (all shades of a color)
export type ColorPalette = Record<ShadeNumber, string>;

// Color scheme (related color variations)
export interface ColorScheme {
  base: string;
  analogous1: string;
  analogous2: string;
  triadic1: string;
  triadic2: string;
  complementary: string;
  split1: string;
  split2: string;
}

// Advanced variable system
export interface ThemeVariables {
  [key: string]: string | { "@light": string; "@dark": string };
}

// CSS generation context
export interface CssContext {
  theme?: ThemeContext;

  [key: string]: unknown;
}

// Define the comprehensive theme context type
export interface ThemeContext {
  var: {
    // Color settings (base colors) - now support mode-specific colors
    color: {
      primary: ColorDefinition;
      secondary: ColorDefinition;
      accent: ColorDefinition;
      neutral: ColorDefinition;
      base: ColorDefinition;
      info: ColorDefinition;
      success: ColorDefinition;
      warning: ColorDefinition;
      error: ColorDefinition;

      // Semantic colors
      // Always use semantic tokens in components (text, background, border, etc.). Under the hood, map them to primary, neutral, etc.
      text?: ColorDefinition;
      background?: ColorDefinition;
      surface?: ColorDefinition;
      border?: ColorDefinition;
      muted?: ColorDefinition;

      [key: string]: ColorDefinition | undefined;
    };

    // Typography settings
    fontFamily?: string;
    fontHeading?: string;
    fontMono?: string;
    fontSizeBase?: string;
    lineHeightBase?: string | number;
    fontWeightBase?: number;

    // Layout settings
    borderRadius?: string;
    spacingScale?: SpacingScale;
    containerPadding?: string;
    sectionPadding?: string;

    // Animation settings
    transitionDurationFast?: string;
    transitionDurationNormal?: string;
    transitionDurationSlow?: string;
    defaultEasing?: EasingPreset;

    // Advanced theming
    variables?: ThemeVariables;

    [key: string]: unknown;
  };

  // ===========================================
  // = DYNAMIC ACCESS PATTERNS (PROXY-POWERED)
  // ===========================================
  // These are implemented via proxy-based accessors
  // Examples:
  // - Color shades: theme.primaryColor_10, theme.errorColor_90
  // - Color palettes: theme.primaryPalette, theme.accentPalette
  // - Color schemes: theme.primaryScheme, theme.accentScheme
  // - Font presets: theme.fontSystem, theme.fontSans, theme.fontSerif
  // - Spacing scales: theme.spacingXs, theme.spacingMd, theme.spacing2xl
  // - Border radius: theme.radiusNone, theme.radiusMd, theme.radiusFull
  // - Semantic colors: theme.textColor, theme.surfaceColor, theme.borderColor
  // - Dynamic HSL variants: theme.primaryColorH, theme.primaryColorS, theme.primaryColorL

  // ===========================================
  // = THEME MODIFICATION FUNCTIONS
  // ===========================================

  // Basic theme helpers
  setTheme?: (newTheme: Partial<ThemeContext>) => void;
  setColorMode?: (mode: ColorMode) => void;
  toggleColorMode?: () => void;
  setColor?: (colorName: ThemeColorKey | string, value: string) => void;
  resetTheme?: () => void;

  // Advanced theme helpers
  setSpacingScale?: (scale: SpacingScale) => void;
  setTypography?: (settings: TypographySettings) => void;
  setAllColors?: (colors: Record<ThemeColorKey, string>) => void;
  setColorScheme?: (baseColor: string, colorKeys?: ThemeColorKey[]) => void;
  getBorderRadius?: (size: RadiusSize) => string;

  // ===========================================
  // = COLOR UTILITY FUNCTIONS
  // ===========================================

  // Color manipulation
  adjustColor?: (color: string, adjustments: ColorAdjustments) => string;
  getColorPalette?: (color: string) => ColorPalette;
  getColorScheme?: (color: string) => ColorScheme;
  getContrastColor?: (color: string) => string;

  // Advanced color utilities
  getSemanticColor?: (
    context: "text" | "background" | "border" | "surface" | "muted",
  ) => string;
  mixColors?: (color1: string, color2: string, amount?: number) => string;
  createGradient?: (
    type: "linear" | "radial",
    colors: string[],
    stops?: number[],
  ) => string;
  getHsl?: (color: string) => { h: number; s: number; l: number; a: number };

  // Accessibility helpers
  getContrastRatio: (color1: string, color2: string) => number;
  meetsAccessibilityStandards: (
    foreground: string,
    background: string,
    level?: "AA" | "AAA",
    size?: "normal" | "large",
  ) => boolean;
  findAccessibleColor: (
    baseColor: string,
    backgroundColor: string,
    level?: "AA" | "AAA",
    size?: "normal" | "large",
  ) => string;

  // ===========================================
  // = MEDIA QUERY HELPERS
  // ===========================================

  getMediaQuery?: (breakpoint: Breakpoint) => string;
  getPrefersColorSchemeQuery?: (mode: "light" | "dark") => string;
  getContainerQuery?: (size: string) => string;

  // Animation helpers
  getAnimationDefinition: (
    name: string,
    duration?: string,
    timing?: string,
    delay?: string,
    iterationCount?: string | number,
    direction?: string,
    fillMode?: string,
  ) => string;

  // Dynamic property access (enables all proxy-based functionality)
  [key: string]: unknown;
}
