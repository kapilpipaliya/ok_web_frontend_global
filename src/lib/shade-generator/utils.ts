import * as Models from "./models";
import { oklch, formatHex, formatRgb, rgb as rgbConverter, wcagLuminance, type Rgb } from "culori";

const clamp = (val: number, min: number, max: number) => {
  return Math.min(Math.max(val, min), max);
};

export const hexOpacityToAlpha = (hexAlpha: string): number => {
  const alphaHexToDec = parseInt(hexAlpha, 16);
  const alpha = +(((alphaHexToDec / 255) * 1000) / 1000).toFixed(2);
  return alpha;
};

export const hexToRgba = (hexColor: string) => {
  // Try to use culori for conversion first
  try {
    const color = rgbConverter(hexColor);
    if (color) {
      return {
        r: Math.round(color.r * 255),
        g: Math.round(color.g * 255),
        b: Math.round(color.b * 255),
        a: color.alpha !== undefined ? color.alpha : 1
      };
    }
  } catch {
    // Fall back to manual conversion if culori fails
  }

  // Manual conversion as fallback
  const rdx = 16;
  const hasHash = hexColor[0] === "#";

  const rgba: Models.Rgba = { r: 0, g: 0, b: 0, a: 1 };

  //Remove hashtag if present
  const hex = hasHash ? hexColor.substring(1) : hexColor;

  const shortHand = hex.length === 3;
  const longHand = hex.length === 6;
  const hasAlpha = hex.length === 8;

  if (shortHand) {
    rgba.r = +parseInt(`${hex[0]}${hex[0]}`, rdx);
    rgba.g = +parseInt(`${hex[1]}${hex[1]}`, rdx);
    rgba.b = +parseInt(`${hex[2]}${hex[2]}`, rdx);
    rgba.a = 1;
  } else if (longHand) {
    rgba.r = +parseInt(`${hex[0]}${hex[1]}`, rdx);
    rgba.g = +parseInt(`${hex[2]}${hex[3]}`, rdx);
    rgba.b = +parseInt(`${hex[4]}${hex[5]}`, rdx);
    rgba.a = 1;
  } else if (hasAlpha) {
    rgba.r = +parseInt(`${hex[0]}${hex[1]}`, rdx);
    rgba.g = +parseInt(`${hex[2]}${hex[3]}`, rdx);
    rgba.b = +parseInt(`${hex[4]}${hex[5]}`, rdx);
    rgba.a = hexOpacityToAlpha(`${hex[6]}${hex[7]}`);
  }

  return rgba;
};

export const parseDecAlpha = (decAlpha: number) =>
  decAlpha > 1 ? 1 : decAlpha < 0 ? 0 : decAlpha;

export const decToHex = (val: number, isAlpha = false) => {
  const v = isAlpha ? parseDecAlpha(val) * 255 : val;
  const value = Math.round(clamp(v, 0, 255));
  const hex = value.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
};

export const rgbaToHex = (
  rgba: Models.Rgba,
  hash?: boolean,
  withAlpha = false
) => {
  // Use culori for better color conversion
  const color: Rgb = {
    mode: "rgb", 
    r: rgba.r / 255, 
    g: rgba.g / 255, 
    b: rgba.b / 255
  };
  
  if (rgba.a !== undefined && rgba.a !== null) {
    color.alpha = rgba.a;
  }
  
  // Try using culori's formatHex
  try {
    let result = formatHex(color);
    if (result) {
      // If alpha is needed and the result doesn't include it
      if (withAlpha && rgba.a !== undefined && rgba.a !== null && rgba.a < 1) {
        result = formatHex(color);
      }
      return result.toUpperCase();
    }
  } catch {
    // Fall back to manual conversion
  }

  // Manual conversion as fallback
  const { r, g, b, a } = rgba;

  const hexR = decToHex(r);
  const hexG = decToHex(g);
  const hexB = decToHex(b);
  const hexA = a ? decToHex(a, true) : "";

  const hexColor = withAlpha
    ? `${hexR}${hexG}${hexB}${hexA}`
    : `${hexR}${hexG}${hexB}`;

  const hex = hash ? `#${hexColor}` : hexColor;

  return hex.toUpperCase();
};

export const rgbToHsl = (rgba: Models.Rgba) => {
  // Use culori for better color conversion
  try {
    const color: Rgb = {
      mode: "rgb", 
      r: rgba.r / 255, 
      g: rgba.g / 255, 
      b: rgba.b / 255
    };
    
    if (rgba.a !== undefined && rgba.a !== null) {
      color.alpha = rgba.a;
    }
    
    const oklchColor = oklch(color);
    
    if (oklchColor) {
      return { 
        h: Math.round(oklchColor.h || 0), 
        s: Math.round((oklchColor.c || 0) * 100), // Chroma maps roughly to saturation
        l: Math.round((oklchColor.l || 0) * 100)  // Lightness
      };
    }
  } catch {
    // Fall back to manual conversion
  }

  // Manual fallback using traditional HSL conversion
  const r = rgba.r / 255;
  const g = rgba.g / 255;
  const b = rgba.b / 255;
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  let l = 0;

  if (max === min) h = 0;
  else if (r === max) h = (g - b) / delta;
  else if (g === max) h = 2 + (b - r) / delta;
  else if (b === max) h = 4 + (r - g) / delta;

  h = Math.min(h * 60, 360);

  if (h < 0) h += 360;

  l = (min + max) / 2;

  if (max === min) s = 0;
  else if (l <= 0.5) s = delta / (max + min);
  else s = delta / (2 - max - min);

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
};

export const rgbToHsv = (rgba: Models.Rgba) => {
  // Use culori for better color conversions if possible
  try {
    const color: Rgb = {
      mode: "rgb", 
      r: rgba.r / 255, 
      g: rgba.g / 255, 
      b: rgba.b / 255
    };
    
    if (rgba.a !== undefined && rgba.a !== null) {
      color.alpha = rgba.a;
    }
    
    const oklchColor = oklch(color);
    
    if (oklchColor) {
      // Approximate HSV from OKLCH
      // Note: This is a rough approximation as HSV and OKLCH have different models
      return { 
        h: Math.round(oklchColor.h || 0), 
        s: Math.round((oklchColor.c || 0) * 250), // Amplify chroma for better saturation range
        v: Math.round((oklchColor.l || 0) * 100)  // Value is similar to lightness
      };
    }
  } catch {
    // Fall back to manual conversion
  }

  // Fallback to manual HSV conversion
  const r = rgba.r;
  const g = rgba.g;
  const b = rgba.b;
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  let v = 0;

  if (max === 0) s = 0;
  else s = ((delta / max) * 1000) / 10;

  if (max === min) h = 0;
  else if (r === max) h = (g - b) / delta;
  else if (g === max) h = 2 + (b - r) / delta;
  else if (b === max) h = 4 + (r - g) / delta;

  h = Math.min(h * 60, 360);

  if (h < 0) h += 360;

  v = ((max / 255) * 1000) / 10;

  return { h: Math.round(h), s: Math.round(s), v: Math.round(v) };
};

export const isHexColor = (color?: string, strict: boolean = true) => {
  // Use culori to validate
  if (color) {
    try {
      if (oklch(color)) {
        return true;
      }
    } catch {
      // If culori can't parse it, continue to regex check
    }
  }

  // Fallback to regex validation
  const hasHash = color?.[0] === "#";
  const hex = hasHash ? color?.substring(1) : color;
  const longHand = hex?.length === 6;

  const pattern = strict
    ? /^#([a-f0-9]{3,4}|[a-f0-9]{4}(?:[a-f0-9]{2}){1,2})\b$/i
    : /#([a-f0-9]{3}|[a-f0-9]{4}(?:[a-f0-9]{2}){0,2})\b/gi;

  return color?.match(pattern) !== null && longHand;
};

export const luminance = (rgba: Models.Rgba) => {
  // Use culori's wcagLuminance for more accurate results
  try {
    const color: Rgb = {
      mode: "rgb", 
      r: rgba.r / 255, 
      g: rgba.g / 255, 
      b: rgba.b / 255
    };
    
    return wcagLuminance(color);
  } catch {
    // Fallback to manual calculation
  }

  // Manual luminance calculation as fallback
  const { r, g, b } = rgba;
  const sRGB = [r, g, b].map(function (value) {
    value /= 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return sRGB[0] * 0.2126 + sRGB[1] * 0.7152 + sRGB[2] * 0.0722;
};

export const contrastRatio = (
  foreground: Models.Rgba,
  background: Models.Rgba
) => {
  const L1 = luminance(foreground);
  const L2 = luminance(background);
  return (
    Math.round(((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)) * 100) /
    100
  );
};

export const formatRgba = ({ r, g, b, a }: Models.Rgba) => {
  // Use culori for more consistent formatting
  try {
    const color: Rgb = {
      mode: "rgb", 
      r: r / 255, 
      g: g / 255, 
      b: b / 255
    };
    
    if (a !== undefined && a !== null) {
      color.alpha = a;
    }
    
    return formatRgb(color);
  } catch {
    // Fallback to manual formatting
  }

  // Manual formatting
  if (a === undefined || a === null || a === 1) {
    return `rgb(${r}, ${g}, ${b})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
