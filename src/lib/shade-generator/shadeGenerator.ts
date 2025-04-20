import * as Models from "./models";
import * as Utils from "./utils";
import { oklch, formatHex, interpolate } from "culori";

export const ShadeGenerator: Models.IShadeGenerator = {
  baseColor: { r: 0, g: 0, b: 0 },
  shades: {
    "10": { multiplier: 0.9, value: { r: 0, g: 0, b: 0, a: 1 } },
    "20": { multiplier: 0.8, value: { r: 0, g: 0, b: 0, a: 1 } },
    "30": { multiplier: 0.7, value: { r: 0, g: 0, b: 0, a: 1 } },
    "40": { multiplier: 0.6, value: { r: 0, g: 0, b: 0, a: 1 } },
    "50": { multiplier: 0.5, value: { r: 0, g: 0, b: 0, a: 1 } },
    "60": { multiplier: 0.4, value: { r: 0, g: 0, b: 0, a: 1 } },
    "70": { multiplier: 0.3, value: { r: 0, g: 0, b: 0, a: 1 } },
    "80": { multiplier: 0.2, value: { r: 0, g: 0, b: 0, a: 1 } },
    "90": { multiplier: 0.1, value: { r: 0, g: 0, b: 0, a: 1 } },
    "100": { multiplier: 0, value: { r: 0, g: 0, b: 0, a: 1 } },
    "200": { multiplier: 0.9, value: { r: 0, g: 0, b: 0, a: 1 } },
    "300": { multiplier: 0.8, value: { r: 0, g: 0, b: 0, a: 1 } },
    "400": { multiplier: 0.7, value: { r: 0, g: 0, b: 0, a: 1 } },
    "500": { multiplier: 0.6, value: { r: 0, g: 0, b: 0, a: 1 } },
    "600": { multiplier: 0.5, value: { r: 0, g: 0, b: 0, a: 1 } },
    "700": { multiplier: 0.4, value: { r: 0, g: 0, b: 0, a: 1 } },
    "800": { multiplier: 0.3, value: { r: 0, g: 0, b: 0, a: 1 } },
    "900": { multiplier: 0.2, value: { r: 0, g: 0, b: 0, a: 1 } },
    "1000": { multiplier: 0.1, value: { r: 0, g: 0, b: 0, a: 1 } },
  },
  currentShade: "100",
  config(shades) {
    const shadeKeys = Object.keys(this.shades) as Models.Shade[];
    shadeKeys.forEach((shade) => {
      this.shades[shade].multiplier = shades[shade];
    });

    return this;
  },
  hue(color) {
    const isHex = Utils.isHexColor(color);

    if (isHex && color) {
      // Use OKLCH instead of RGBA
      this.baseColor = Utils.hexToRgba(color);
    } else {
      throw new Error(`The color: ${color}  you provided is not valid`);
    }

    this.generateShades();

    return this;
  },
  shade(shade) {
    this.currentShade = shade;

    return this;
  },
  shadesMap(colorFormat) {
    const shadeEntries = Object.entries(this.shades) as Array<
      [Models.Shade, Models.ShadeOption]
    >;
    return shadeEntries.reduce(
      (acc, [shade, option]): Record<Models.Shade, string> => {
        acc[shade] = this[colorFormat](option.value);
        return acc;
      },
      {} as Record<Models.Shade, string>
    );
  },
  generateShades() {
    const shadeKeys = Object.keys(this.shades) as Models.Shade[];
    shadeKeys.forEach((shade) => {
      this.shades[shade].value = this.generateShade(shade);
    });
  },
  calculateMultiplier(shade) {
    const shadeNum = +shade;
    
    if (this.shades[shade]?.multiplier !== undefined) {
      return this.shades[shade].multiplier;
    }
    
    if (shadeNum === 100) {
      return 0;
    } else if (shadeNum < 100) {
      // For tints (0-90), multiplier decreases from 1 to 0.1 as shade increases
      // 0 -> 1.0, 10 -> 0.9, 20 -> 0.8, etc.
      return 1 - (shadeNum / 100);
    } else {
      // For shades (200-1000), it matches the pattern where:
      // 200 -> 0.9, 300 -> 0.8, 400 -> 0.7, etc.
      const step = Math.floor(shadeNum / 100);
      return Math.max(0, 1 - (step * 0.1));
    }
  },
  generateShade(shade) {
    const { r, g, b, a } = this.baseColor;
    const shadeNum = +shade;
    const multiplier = this.calculateMultiplier(shade);

    // Convert the base color to OKLCH for better color transitions
    const baseOklch = oklch(Utils.formatRgba(this.baseColor));
    
    if (shadeNum === 100) {
      // Return the base color unchanged
      return this.baseColor;
    } else if (shadeNum < 100) {
      // For tints (lighter colors), interpolate between white and base color
      const white = oklch("white");
      if (!baseOklch || !white) return this.baseColor;
      
      // Interpolate in OKLCH space for perceptually uniform lightness
      const ratio = shadeNum / 100;
      const interpolated = interpolate([white, baseOklch])(ratio);
      
      // Convert back to RGB for compatibility with existing code
      const rgbaColor = Utils.hexToRgba(formatHex(interpolated) || "#000000");
      return {
        ...rgbaColor,
        a
      };
    } else {
      // For shades (darker colors), interpolate between base color and black
      const black = oklch("black");
      if (!baseOklch || !black) return this.baseColor;
      
      // Calculate interpolation ratio (how far between base color and black)
      const ratio = (shadeNum - 100) / 900;
      const interpolated = interpolate([baseOklch, black])(ratio);
      
      // Convert back to RGB for compatibility
      const rgbaColor = Utils.hexToRgba(formatHex(interpolated) || "#000000");
      return {
        ...rgbaColor,
        a
      };
    }
  },
  opacity(amount) {
    const opacity = Utils.parseDecAlpha(amount);
    
    // Get or generate the current shade value
    let shadeValue;
    if (this.shades[this.currentShade]) {
      shadeValue = this.shades[this.currentShade].value;
      this.shades[this.currentShade].value = {
        ...shadeValue,
        a: +opacity.toFixed(2),
      };
    } else {
      // Generate on the fly
      shadeValue = this.generateShade(this.currentShade);
      // Store it temporarily
      this.shades[this.currentShade] = {
        multiplier: this.calculateMultiplier(this.currentShade),
        value: {
          ...shadeValue,
          a: +opacity.toFixed(2),
        }
      };
    }
    
    return this;
  },
  currentShadeValue() {
    // If the current shade is already in the shades object, return its value
    if (this.shades[this.currentShade]) {
      return this.shades[this.currentShade].value;
    }
    
    // Otherwise generate the shade on-the-fly
    return this.generateShade(this.currentShade);
  },
  hsv() {
    return Utils.rgbToHsv(this.currentShadeValue());
  },
  rgba(color) {
    return Utils.formatRgba(color ?? this.currentShadeValue());
  },
  hsl(color) {
    const { h, s, l } = Utils.rgbToHsl(color ?? this.currentShadeValue());
    return `hsl(${h}deg, ${s}%, ${l}%)`;
  },
  hex(color) {
    // For hex output, we can use culori's formatHex directly on OKLCH
    const shadeValue = color ?? this.currentShadeValue();
    
    // For colors with transparency, we need to handle alpha
    if (shadeValue.a !== 1) {
      // Convert to OKLCH first
      const oklchColor = oklch(Utils.formatRgba(shadeValue));
      return oklchColor ? formatHex(oklchColor) : Utils.rgbaToHex(shadeValue, true, true);
    }
    
    // For opaque colors
    return Utils.rgbaToHex(shadeValue, true, false);
  },
};
