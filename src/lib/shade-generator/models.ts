export type Rgba = {
  r: number;
  g: number;
  b: number;
  a?: number | null;
};

export type Hsv = {
  h: number;
  s: number;
  v: number;
};

export type Shade = string;

export type ShadeOption = { multiplier: number; value: Rgba };
export type Shades = Record<Shade, ShadeOption>;
export type ColorFormat = "rgba" | "hsl" | "hex";

export interface IShadeGenerator {
  baseColor: Rgba;
  shades: Shades;
  currentShade: Shade;
  currentShadeValue(): Rgba;
  config(shades: Record<Shade, number>): IShadeGenerator;
  /**
   *
   * @param color : Can be both hex or rgba;
   */
  hue(color?: string): IShadeGenerator;
  shade(shade: Shade): IShadeGenerator;
  shadesMap(colorFormat: ColorFormat): Record<Shade, string>;
  calculateMultiplier(shade: Shade): number;
  generateShade(shade: Shade): Rgba;
  generateShades(): void;
  opacity(amount: number): IShadeGenerator;
  hsv(): Hsv;
  rgba(color?: Rgba): string;
  hsl(color?: Rgba): string;
  hex(color?: Rgba): string;
}
