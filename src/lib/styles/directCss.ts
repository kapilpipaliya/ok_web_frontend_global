import { colors, defaultColors as themeColors } from "./createCss";

/**
 * Generate CSS for a button with customizable properties
 */
export function buttonCss(options?: {
  backgroundColor?: string;
  textColor?: string;
  hoverColor?: string;
  activeColor?: string;
  fontSize?: string | number;
  padding?: string;
  borderRadius?: string | number;
}) {
  const {
    backgroundColor = themeColors.primary,
    textColor = "#ffffff",
    hoverColor,
    activeColor,
    fontSize = "1rem",
    padding = "0.5rem 1rem",
    borderRadius = "0.25rem",
  } = options || {};

  const hover = hoverColor || colors.darken(backgroundColor, 10);
  const active = activeColor || colors.darken(backgroundColor, 15);

  return `
    background-color: ${backgroundColor};
    color: ${textColor};
    border: none;
    padding: ${padding};
    border-radius: ${typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius};
    font-size: ${typeof fontSize === "number" ? `${fontSize}px` : fontSize};
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: ${hover};
    }
    
    &:active {
      background-color: ${active};
    }
  `;
}

/**
 * Generate CSS for a container with customizable properties
 */
export function containerCss(options?: {
  padding?: string;
  backgroundColor?: string;
  borderRadius?: string | number;
  shadow?: boolean;
  maxWidth?: string;
}) {
  const {
    padding = "1rem",
    backgroundColor = "#ffffff",
    borderRadius = "0.5rem",
    shadow = true,
    maxWidth = "1200px",
  } = options || {};

  return `
    padding: ${padding};
    background-color: ${backgroundColor};
    border-radius: ${typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius};
    ${shadow ? "box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);" : ""}
    width: 100%;
    max-width: ${maxWidth};
    margin: 0 auto;
  `;
}

/**
 * Generate CSS for a flex layout with customizable properties
 */
export function flexCss(options?: {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  alignItems?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
  gap?: string | number;
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
}) {
  const {
    direction = "row",
    justifyContent = "flex-start",
    alignItems = "stretch",
    gap = "0",
    wrap = "nowrap",
  } = options || {};

  return `
    display: flex;
    flex-direction: ${direction};
    justify-content: ${justifyContent};
    align-items: ${alignItems};
    gap: ${typeof gap === "number" ? `${gap}px` : gap};
    flex-wrap: ${wrap};
  `;
}

/**
 * Generate CSS for a grid layout with customizable properties
 */
export function gridCss(options?: {
  columns?: string | number;
  rows?: string;
  gap?: string | number;
  columnGap?: string | number;
  rowGap?: string | number;
  alignItems?: "stretch" | "start" | "end" | "center" | "baseline";
  justifyItems?: "stretch" | "start" | "end" | "center";
}) {
  const {
    columns = "repeat(auto-fit, minmax(250px, 1fr))",
    rows = "auto",
    gap,
    columnGap,
    rowGap,
    alignItems = "stretch",
    justifyItems = "stretch",
  } = options || {};

  const gridTemplateColumns =
    typeof columns === "number" ? `repeat(${columns}, 1fr)` : columns;

  const gapCss =
    gap !== undefined
      ? `gap: ${typeof gap === "number" ? `${gap}px` : gap};`
      : "";

  const columnGapCss =
    columnGap !== undefined
      ? `column-gap: ${typeof columnGap === "number" ? `${columnGap}px` : columnGap};`
      : "";

  const rowGapCss =
    rowGap !== undefined
      ? `row-gap: ${typeof rowGap === "number" ? `${rowGap}px` : rowGap};`
      : "";

  return `
    display: grid;
    grid-template-columns: ${gridTemplateColumns};
    grid-template-rows: ${rows};
    ${gapCss}
    ${columnGapCss}
    ${rowGapCss}
    align-items: ${alignItems};
    justify-items: ${justifyItems};
  `;
}

/**
 * Generate CSS for typography with customizable properties
 */
export function typographyCss(options?: {
  fontSize?: string | number;
  fontWeight?: "normal" | "bold" | "lighter" | "bolder" | number;
  textColor?: string;
  lineHeight?: string | number;
  textAlign?: "left" | "center" | "right" | "justify";
  letterSpacing?: string | number;
}) {
  const {
    fontSize = "1rem",
    fontWeight = "normal",
    textColor = themeColors.base,
    lineHeight = 1.5,
    textAlign = "left",
    letterSpacing,
  } = options || {};

  const letterSpacingCss =
    letterSpacing !== undefined
      ? `letter-spacing: ${typeof letterSpacing === "number" ? `${letterSpacing}px` : letterSpacing};`
      : "";

  return `
    font-size: ${typeof fontSize === "number" ? `${fontSize}px` : fontSize};
    font-weight: ${fontWeight};
    color: ${textColor};
    line-height: ${typeof lineHeight === "number" ? lineHeight : lineHeight};
    text-align: ${textAlign};
    ${letterSpacingCss}
  `;
}
