import type {
  ColorDefinition,
  ColorMode,
  ColorScheme,
  ModeSpecificColor,
} from "~/lib/styles/types/types";

export type OklchColor = {
  l: number;
  c: number;
  h: number;
  a: number;
};

export type ShadeType = "light" | "dark";

/** Lightness threshold for picking black vs white text (no APCA). */
const TEXT_L_THRESHOLD = 0.71;

const WHITE: OklchColor = { l: 1, c: 0, h: 0, a: 1 };
const BLACK: OklchColor = { l: 0, c: 0, h: 0, a: 1 };

const CSS_NAMED_COLORS: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  yellow: "#ffff00",
  cyan: "#00ffff",
  magenta: "#ff00ff",
  orange: "#ffa500",
  purple: "#800080",
  pink: "#ffc0cb",
  gray: "#808080",
  grey: "#808080",
  transparent: "#00000000",
};

/**
 * Checks if a color definition is mode-specific
 */
export function isModeSpecificColor(
  color: string | number | boolean | ColorDefinition | undefined,
): color is ModeSpecificColor {
  return (
    typeof color === "object" &&
    color !== null &&
    "light" in color &&
    "dark" in color
  );
}

/**
 * Resolves a color definition to a specific color string based on the current mode
 */
export function resolveColorForMode(
  colorDef: string | number | boolean | ColorDefinition | undefined,
  mode: ColorMode,
): string {
  const resolvedMode = mode === "system" ? "light" : mode;

  if (isModeSpecificColor(colorDef)) {
    return colorDef[resolvedMode];
  }

  return colorDef as string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function shadeRatio(shade: number): number {
  return clamp(shade, 1, 1000) / 1000;
}

/**
 * Returns CSS named colors or the input if it already looks like a CSS color.
 * Browsers accept keywords inside color-mix; no Color.js lighten/darken hacks.
 */
export function parseColorName(colorName: string): string | undefined {
  const trimmed = colorName.trim();
  if (!trimmed) {
    return undefined;
  }

  const lower = trimmed.toLowerCase();
  if (CSS_NAMED_COLORS[lower]) {
    return lower;
  }

  if (
    /^(#|oklch\(|oklab\(|rgb\(|rgba\(|hsl\(|hsla\(|color\()/i.test(trimmed) ||
    /^[a-z]+$/i.test(trimmed)
  ) {
    return trimmed;
  }

  return undefined;
}

function parseHex(hex: string): OklchColor | undefined {
  const raw = hex.replace("#", "").trim();
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 1;

  if (raw.length === 3 || raw.length === 4) {
    r = Number.parseInt(raw[0] + raw[0], 16);
    g = Number.parseInt(raw[1] + raw[1], 16);
    b = Number.parseInt(raw[2] + raw[2], 16);
    if (raw.length === 4) {
      a = Number.parseInt(raw[3] + raw[3], 16) / 255;
    }
  } else if (raw.length === 6 || raw.length === 8) {
    r = Number.parseInt(raw.slice(0, 2), 16);
    g = Number.parseInt(raw.slice(2, 4), 16);
    b = Number.parseInt(raw.slice(4, 6), 16);
    if (raw.length === 8) {
      a = Number.parseInt(raw.slice(6, 8), 16) / 255;
    }
  } else {
    return undefined;
  }

  if ([r, g, b].some((v) => Number.isNaN(v))) {
    return undefined;
  }

  return srgbToOklch(r / 255, g / 255, b / 255, a);
}

function parseRgb(color: string): OklchColor | undefined {
  const match = color.match(
    /^rgba?\(\s*([+\d.]+%?)\s*[, ]\s*([+\d.]+%?)\s*[, ]\s*([+\d.]+%?)(?:\s*[,/]\s*([+\d.]+%?))?\s*\)$/i,
  );
  if (!match) {
    return undefined;
  }

  const toUnit = (value: string) => {
    if (value.endsWith("%")) {
      return Number.parseFloat(value) / 100;
    }
    return Number.parseFloat(value) / 255;
  };

  const r = toUnit(match[1]);
  const g = toUnit(match[2]);
  const b = toUnit(match[3]);
  let a = 1;
  if (match[4] !== undefined) {
    a = match[4].endsWith("%")
      ? Number.parseFloat(match[4]) / 100
      : Number.parseFloat(match[4]);
  }

  if ([r, g, b, a].some((v) => Number.isNaN(v))) {
    return undefined;
  }

  return srgbToOklch(r, g, b, a);
}

function parseOklchString(color: string): OklchColor | undefined {
  const match = color.match(
    /^oklch\(\s*([+\d.eE-]+%?)\s+([+\d.eE-]+)\s+([+\d.eE-]+)(?:\s*\/\s*([+\d.eE-]+%?))?\s*\)$/i,
  );
  if (!match) {
    return undefined;
  }

  const lRaw = match[1];
  const l = lRaw.endsWith("%")
    ? Number.parseFloat(lRaw) / 100
    : Number.parseFloat(lRaw);
  const c = Number.parseFloat(match[2]);
  const h = Number.parseFloat(match[3]);
  let a = 1;
  if (match[4] !== undefined) {
    a = match[4].endsWith("%")
      ? Number.parseFloat(match[4]) / 100
      : Number.parseFloat(match[4]);
  }

  if ([l, c, h, a].some((v) => Number.isNaN(v))) {
    return undefined;
  }

  return { l, c, h, a };
}

/**
 * Parse a CSS color into OKLCH components. Supports oklch(), #hex, rgb/rgba, and common names.
 */
export function parseToOklch(color: string): OklchColor | undefined {
  const trimmed = color.trim();
  if (!trimmed) {
    return undefined;
  }

  const lower = trimmed.toLowerCase();
  if (CSS_NAMED_COLORS[lower]) {
    return parseHex(CSS_NAMED_COLORS[lower].slice(0, 7));
  }

  if (lower.startsWith("oklch(")) {
    return parseOklchString(trimmed);
  }

  if (trimmed.startsWith("#")) {
    return parseHex(trimmed);
  }

  if (lower.startsWith("rgb")) {
    return parseRgb(trimmed);
  }

  return undefined;
}

function srgbToLinear(c: number): number {
  const abs = Math.abs(c);
  return abs <= 0.04045
    ? c / 12.92
    : (Math.sign(c) || 1) * ((abs + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c: number): number {
  const abs = Math.abs(c);
  return abs <= 0.0031308
    ? 12.92 * c
    : (Math.sign(c) || 1) * (1.055 * abs ** (1 / 2.4) - 0.055);
}

function srgbToOklch(r: number, g: number, b: number, a = 1): OklchColor {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l =
    0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m =
    0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s =
    0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(A * A + B * B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) {
    H += 360;
  }

  return { l: L, c: C, h: C < 1e-8 ? 0 : H, a };
}

function oklchToSrgb(color: OklchColor): { r: number; g: number; b: number; a: number } {
  const hRad = ((color.h || 0) * Math.PI) / 180;
  const A = color.c * Math.cos(hRad);
  const B = color.c * Math.sin(hRad);

  const l_ = color.l + 0.3963377774 * A + 0.2158037573 * B;
  const m_ = color.l - 0.1055613458 * A - 0.0638541728 * B;
  const s_ = color.l - 0.0894841775 * A - 1.291485548 * B;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const lr =
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg =
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb =
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return {
    r: clamp(linearToSrgb(lr), 0, 1),
    g: clamp(linearToSrgb(lg), 0, 1),
    b: clamp(linearToSrgb(lb), 0, 1),
    a: color.a,
  };
}

export function formatOklch(color: OklchColor): string {
  const { l, c, h, a } = color;
  if (a < 1) {
    return `oklch(${l} ${c} ${h} / ${a})`;
  }
  return `oklch(${l} ${c} ${h})`;
}

/**
 * Interpolate toward white or black in OKLCH (same ratio as CSS color-mix shades).
 */
export function mixOklch(
  base: OklchColor,
  toward: ShadeType,
  ratio: number,
): OklchColor {
  const r = clamp(ratio, 0, 1);
  const target = toward === "light" ? WHITE : BLACK;

  const lerp = (a: number, b: number) => a + (b - a) * r;

  // Hue: keep base hue when chroma is meaningful; fade toward achromatic target
  const mixedC = lerp(base.c, target.c);
  let mixedH = base.h;
  if (base.c < 1e-8 && target.c < 1e-8) {
    mixedH = 0;
  } else if (target.c >= 1e-8) {
    // rare for white/black; keep base
    mixedH = base.h;
  }

  return {
    l: lerp(base.l, target.l),
    c: mixedC,
    h: mixedH,
    a: lerp(base.a, target.a),
  };
}

/**
 * Mix a base CSS color toward white/black by shade (1-1000).
 */
export function mixBaseToward(
  baseColor: string,
  shadeType: ShadeType,
  shade: number,
): OklchColor | undefined {
  const base = parseToOklch(baseColor);
  if (!base) {
    return undefined;
  }
  return mixOklch(base, shadeType, shadeRatio(shade));
}

/**
 * CSS shade string for stylesheets only. Never parse this for _text / _hex.
 */
export function getLightShade(baseColor: string, shade: number): string {
  const r = shadeRatio(shade);
  const basePct = (1 - r) * 100;
  const whitePct = r * 100;
  return `color-mix(in oklch, ${baseColor} ${basePct}%, white ${whitePct}%)`;
}

/**
 * CSS shade string for stylesheets only. Never parse this for _text / _hex.
 */
export function getDarkShade(baseColor: string, shade: number): string {
  const r = shadeRatio(shade);
  const basePct = (1 - r) * 100;
  const blackPct = r * 100;
  return `color-mix(in oklch, ${baseColor} ${basePct}%, black ${blackPct}%)`;
}

/**
 * Pick readable text color from a base OKLCH (optionally shaded). Uses L threshold only.
 */
export function getContrastColorFromBase(
  baseColor: string,
  shadeType?: ShadeType,
  shade?: number,
): string {
  const mixed =
    shadeType !== undefined && shade !== undefined
      ? mixBaseToward(baseColor, shadeType, shade)
      : parseToOklch(baseColor);

  if (!mixed) {
    return "oklch(0 0 0)";
  }

  return mixed.l >= TEXT_L_THRESHOLD ? "oklch(0 0 0)" : "oklch(1 0 0)";
}

/**
 * Contrast helper for a resolved (non-shade) color string.
 */
export function getContrastColor(bgColor: string): string {
  return getContrastColorFromBase(bgColor);
}

function channelToHex(value: number): string {
  return Math.round(value * 255)
    .toString(16)
    .padStart(2, "0");
}

export function oklchToHex(color: OklchColor): string {
  const { r, g, b } = oklchToSrgb(color);
  return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
}

/**
 * Hex from original base (+ optional shade). Does not parse color-mix CSS.
 */
export function colorToHexFromBase(
  baseColor: string,
  shadeType?: ShadeType,
  shade?: number,
  fallback = "#000000",
): string {
  const mixed =
    shadeType !== undefined && shade !== undefined
      ? mixBaseToward(baseColor, shadeType, shade)
      : parseToOklch(baseColor);

  if (!mixed) {
    return fallback;
  }

  return oklchToHex(mixed);
}

/**
 * Converts an original CSS color string to #rrggbb. Do not pass color-mix() strings.
 */
export function colorToHex(
  color: string | undefined,
  fallback = "#000000",
): string {
  if (!color?.trim()) {
    return fallback;
  }
  return colorToHexFromBase(color.trim(), undefined, undefined, fallback);
}

/**
 * Create a color scheme from a base color with harmonious hue rotations.
 */
export function createColorScheme(baseColor: string): ColorScheme {
  const base = parseToOklch(baseColor);
  if (!base) {
    return {
      base: baseColor,
      analogous1: baseColor,
      analogous2: baseColor,
      triadic1: baseColor,
      triadic2: baseColor,
      complementary: baseColor,
      split1: baseColor,
      split2: baseColor,
    };
  }

  const createVariant = (hueShift: number) => {
    const h = (((base.h || 0) + hueShift) % 360 + 360) % 360;
    return formatOklch({ ...base, h });
  };

  return {
    base: formatOklch(base),
    analogous1: createVariant(30),
    analogous2: createVariant(-30),
    triadic1: createVariant(120),
    triadic2: createVariant(-120),
    complementary: createVariant(180),
    split1: createVariant(150),
    split2: createVariant(-150),
  };
}
