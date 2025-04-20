// Export the type using export type for isolatedModules
export type { StyleDefinition } from "./styles";

// ============================
// = CORE CSS HELPER FUNCTIONS
// ============================

// Template literal helper for CSS - Converts template strings to scoped CSS
export const css = (
  strings: TemplateStringsArray,
  ...values: unknown[]
): string => {
  const rawCss = String.raw({ raw: strings }, ...values);

  // Add ._id wrapper if not already present
  if (!rawCss.includes("._id")) {
    return `._id {\n  ${rawCss.replace(/\n/g, "\n  ")}\n}`;
  }

  return rawCss;
};

// ======================================
// = THEME SYSTEM TYPE DEFINITIONS
// ======================================

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

// Font preset keys
export type FontPreset = "system" | "sans" | "serif" | "mono" | "heading";

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
    // Base theme settings
    colorMode?: ColorMode;

    // Color settings (base colors)
    color: {
      primary: string;
      secondary: string;
      accent: string;
      neutral: string;
      base: string;
      info: string;
      success: string;
      warning: string;
      error: string;
      [key: string]: string;
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

// ======================================
// = ADVANCED CSS GENERATION UTILITIES
// ======================================

// Helper to create themed CSS with context
export const themedCss = (fn: (theme: ThemeContext) => string) => {
  return (options?: CssContext): string => {
    const theme = options?.theme || {};
    return fn(theme as ThemeContext);
  };
};

// Utility for creating CSS class with interactive states
export const withStates = (
  baseStyles: string,
  hoverStyles?: string,
  focusStyles?: string,
  activeStyles?: string,
  focusVisibleStyles?: string,
  disabledStyles?: string,
): string => {
  let result = `._id {\n  ${baseStyles.replace(/\n/g, "\n  ")}\n}`;

  if (hoverStyles) {
    result += `\n\n._id:hover:not(:disabled) {\n  ${hoverStyles.replace(/\n/g, "\n  ")}\n}`;
  }

  if (focusStyles) {
    result += `\n\n._id:focus {\n  ${focusStyles.replace(/\n/g, "\n  ")}\n}`;
  }

  if (focusVisibleStyles) {
    result += `\n\n._id:focus-visible {\n  ${focusVisibleStyles.replace(/\n/g, "\n  ")}\n}`;
  }

  if (activeStyles) {
    result += `\n\n._id:active:not(:disabled) {\n  ${activeStyles.replace(/\n/g, "\n  ")}\n}`;
  }

  if (disabledStyles) {
    result += `\n\n._id:disabled {\n  ${disabledStyles.replace(/\n/g, "\n  ")}\n}`;
  }

  return result;
};

// Helper to create styled components using the As component
export const styled = <T extends keyof HTMLElementTagNameMap>(
  tag: T,
  styles: string | ((props?: Record<string, unknown>) => string),
) => {
  return (props: Record<string, unknown> = {}) => {
    const cssContent = typeof styles === "function" ? styles(props) : styles;
    return {
      as: tag,
      css: cssContent,
      ...props,
    };
  };
};

// ======================================
// = THEME VARIABLE ACCESSORS
// ======================================

// Creates a CSS variable reference with optional fallback
export const themeVar = (name: string, fallback?: string) => {
  return fallback ? `var(--${name}, ${fallback})` : `var(--${name})`;
};

// Access a theme color with a specific shade
export const colorWithShade = (
  colorName: ThemeColorKey | string,
  shade: ShadeNumber = 50,
) => {
  return shade === 50
    ? themeVar(colorName as string)
    : themeVar(`${colorName}-${shade}`);
};

// Creates a conditional CSS block based on color mode
export const colorModeStyle = (
  lightStyles: string,
  darkStyles: string,
  systemStyles?: string,
) => {
  let css = `
  @media (prefers-color-scheme: light) {
    :root:not([data-theme='dark']) ._id {
      ${lightStyles}
    }
  }
  
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) ._id {
      ${darkStyles}
    }
  }
  
  :root[data-theme='light'] ._id {
    ${lightStyles}
  }
  
  :root[data-theme='dark'] ._id {
    ${darkStyles}
  }`;

  // Add optional system-based styles
  if (systemStyles) {
    css += `
  
  :root[data-theme='system'] ._id {
    ${systemStyles}
  }`;
  }

  return css;
};

// ======================================
// = RESPONSIVE DESIGN UTILITIES
// ======================================

// Default breakpoints for responsive design
export const DEFAULT_BREAKPOINTS: Record<Breakpoint, string> = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// Helper for responsive styles with breakpoints
export const responsiveStyles = (
  styles: Record<string, string>,
  breakpoints: Record<string, string> = DEFAULT_BREAKPOINTS,
) => {
  let result = `._id {\n  ${styles.base.replace(/\n/g, "\n  ")}\n}`;

  Object.entries(styles).forEach(([breakpoint, style]) => {
    if (breakpoint !== "base" && breakpoints[breakpoint as Breakpoint]) {
      result += `\n\n@media (min-width: ${breakpoints[breakpoint as Breakpoint]}) {\n  ._id {\n    ${style.replace(/\n/g, "\n    ")}\n  }\n}`;
    }
  });

  return result;
};

// Create styles that apply at specific breakpoints without requiring a "base"
export const atBreakpoint = (breakpoint: Breakpoint, styles: string) => {
  return `@media (min-width: ${DEFAULT_BREAKPOINTS[breakpoint]}) {\n  ._id {\n    ${styles.replace(/\n/g, "\n    ")}\n  }\n}`;
};

// Creates styles for container queries
export const containerQuery = (size: string, styles: string) => {
  return `@container (min-width: ${size}) {\n  ._id {\n    ${styles.replace(/\n/g, "\n    ")}\n  }\n}`;
};

// ======================================
// = ADVANCED STYLE COMPOSITION
// ======================================

// Combine multiple CSS generators
export const composeCss = (
  ...cssGenerators: Array<string | (() => string)>
) => {
  return () =>
    cssGenerators
      .map((generator) =>
        typeof generator === "function" ? generator() : generator,
      )
      .join("\n\n");
};

// Create scoped CSS for child selectors
export const withChildSelector = (selector: string, styles: string) => {
  return `._id ${selector} {\n  ${styles.replace(/\n/g, "\n  ")}\n}`;
};

// Create CSS for pseudo-elements
export const withPseudoElement = (
  element: "before" | "after",
  styles: string,
  content = '""',
) => {
  return `._id::${element} {\n  content: ${content};\n  ${styles.replace(/\n/g, "\n  ")}\n}`;
};

// Create CSS with animation keyframes
export const withAnimation = (
  name: string,
  keyframes: Record<string, string>,
  duration = "1s",
  timing = "ease",
  iterationCount: string | number = 1,
  direction = "normal",
  fillMode = "none",
) => {
  let keyframesString = `@keyframes ${name} {\n`;

  Object.entries(keyframes).forEach(([key, value]) => {
    keyframesString += `  ${key} {\n    ${value.replace(/\n/g, "\n    ")}\n  }\n`;
  });

  keyframesString += "}\n\n";

  const animationValue = `${name} ${duration} ${timing} ${iterationCount} ${direction} ${fillMode}`;

  return `${keyframesString}._id {\n  animation: ${animationValue};\n}`;
};
