// Define color properties that can have shades
export type ThemeColorKey =
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "text"
  | "background"
  | "border";
// Typography and layout types removed - use fixed values in CSS
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

// Typography settings removed - use fixed values in CSS

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
      info: ColorDefinition;
      success: ColorDefinition;
      warning: ColorDefinition;
      error: ColorDefinition;

      // Semantic colors
      // Always use semantic tokens in components (text, background, border, etc.). Under the hood, map them to primary, etc.
      text?: ColorDefinition;
      background?: ColorDefinition;
      border?: ColorDefinition;

      [key: string]: ColorDefinition | undefined;
    };

    // Typography and layout settings removed - use fixed values in CSS

    // Animation settings removed - use fixed values in CSS

    // Advanced theming
    variables?: ThemeVariables;

    [key: string]: unknown;
  };

  // ===========================================
  // = DYNAMIC ACCESS PATTERNS (PROXY-POWERED)
  // ===========================================
  // These are implemented via proxy-based accessors
  // Examples:
  // - Color shades: theme.primary_light_100, theme.error_dark_900 (light/dark, 1-1000)
  // - Color palettes: theme.primaryPalette, theme.infoPalette
  // - Color schemes: theme.primaryScheme, theme.infoScheme

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
  // setTypography removed - use fixed values in CSS
  setAllColors?: (colors: Record<ThemeColorKey, string>) => void;
  setColorScheme?: (baseColor: string, colorKeys?: ThemeColorKey[]) => void;
  // getBorderRadius removed - use fixed values in CSS

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
