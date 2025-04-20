import { defaultColors as themeColors } from "./createCss";
import { colors } from "./createCss";

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
    border-radius: ${typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius};
    font-size: ${typeof fontSize === 'number' ? `${fontSize}px` : fontSize};
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
    border-radius: ${typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius};
    ${shadow ? 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);' : ''}
    width: 100%;
    max-width: ${maxWidth};
    margin: 0 auto;
  `;
}

/**
 * Generate CSS for a flex layout with customizable properties
 */
export function flexCss(options?: {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  gap?: string | number;
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}) {
  const {
    direction = 'row',
    justifyContent = 'flex-start',
    alignItems = 'stretch',
    gap = '0',
    wrap = 'nowrap',
  } = options || {};
  
  return `
    display: flex;
    flex-direction: ${direction};
    justify-content: ${justifyContent};
    align-items: ${alignItems};
    gap: ${typeof gap === 'number' ? `${gap}px` : gap};
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
  alignItems?: 'stretch' | 'start' | 'end' | 'center' | 'baseline';
  justifyItems?: 'stretch' | 'start' | 'end' | 'center';
}) {
  const {
    columns = 'repeat(auto-fit, minmax(250px, 1fr))',
    rows = 'auto',
    gap,
    columnGap,
    rowGap,
    alignItems = 'stretch',
    justifyItems = 'stretch',
  } = options || {};
  
  const gridTemplateColumns = typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns;
  
  const gapCss = gap !== undefined
    ? `gap: ${typeof gap === 'number' ? `${gap}px` : gap};`
    : '';
  
  const columnGapCss = columnGap !== undefined 
    ? `column-gap: ${typeof columnGap === 'number' ? `${columnGap}px` : columnGap};`
    : '';
  
  const rowGapCss = rowGap !== undefined
    ? `row-gap: ${typeof rowGap === 'number' ? `${rowGap}px` : rowGap};`
    : '';
  
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
  fontWeight?: 'normal' | 'bold' | 'lighter' | 'bolder' | number;
  textColor?: string;
  lineHeight?: string | number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  letterSpacing?: string | number;
}) {
  const {
    fontSize = '1rem',
    fontWeight = 'normal',
    textColor = themeColors.base,
    lineHeight = 1.5,
    textAlign = 'left',
    letterSpacing,
  } = options || {};
  
  const letterSpacingCss = letterSpacing !== undefined
    ? `letter-spacing: ${typeof letterSpacing === 'number' ? `${letterSpacing}px` : letterSpacing};`
    : '';
  
  return `
    font-size: ${typeof fontSize === 'number' ? `${fontSize}px` : fontSize};
    font-weight: ${fontWeight};
    color: ${textColor};
    line-height: ${typeof lineHeight === 'number' ? lineHeight : lineHeight};
    text-align: ${textAlign};
    ${letterSpacingCss}
  `;
}

/**
 * Convert a Master CSS class string directly to CSS
 */
export function masterClassToCss(masterCssClass: string): string {
  const properties: string[] = [];
  
  // Split by spaces to get individual class parts
  const classParts = masterCssClass.split(/\s+/);
  
  classParts.forEach(part => {
    // Parse the Master CSS class part
    if (part.includes(':')) {
      const [property, value] = part.split(':');
      
      switch (property) {
        // Layout
        case 'p': properties.push(`padding: ${value}px;`); break;
        case 'px': properties.push(`padding-left: ${value}px; padding-right: ${value}px;`); break;
        case 'py': properties.push(`padding-top: ${value}px; padding-bottom: ${value}px;`); break;
        case 'm': properties.push(`margin: ${value}px;`); break;
        case 'mx': properties.push(`margin-left: ${value}px; margin-right: ${value}px;`); break;
        case 'my': properties.push(`margin-top: ${value}px; margin-bottom: ${value}px;`); break;
        case 'w': properties.push(`width: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'h': properties.push(`height: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'min-w': properties.push(`min-width: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'min-h': properties.push(`min-height: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'max-w': properties.push(`max-width: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'max-h': properties.push(`max-height: ${value.includes('%') ? value : `${value}px`};`); break;
        
        // Display & Position
        case 'display': properties.push(`display: ${value};`); break;
        case 'd': properties.push(`display: ${value};`); break;
        case 'position': properties.push(`position: ${value};`); break;
        case 'top': properties.push(`top: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'right': properties.push(`right: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'bottom': properties.push(`bottom: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'left': properties.push(`left: ${value.includes('%') ? value : `${value}px`};`); break;
        case 'z-index': properties.push(`z-index: ${value};`); break;
        
        // Flexbox
        case 'flex': properties.push('display: flex;'); break;
        case 'flex-direction': properties.push(`flex-direction: ${value};`); break;
        case 'jc': 
          switch(value) {
            case 'center': properties.push('justify-content: center;'); break;
            case 'space-between': properties.push('justify-content: space-between;'); break;
            case 'space-around': properties.push('justify-content: space-around;'); break;
            case 'flex-start': properties.push('justify-content: flex-start;'); break;
            case 'flex-end': properties.push('justify-content: flex-end;'); break;
            default: properties.push(`justify-content: ${value};`);
          }
          break;
        case 'ai':
          switch(value) {
            case 'center': properties.push('align-items: center;'); break;
            case 'flex-start': properties.push('align-items: flex-start;'); break;
            case 'flex-end': properties.push('align-items: flex-end;'); break;
            case 'baseline': properties.push('align-items: baseline;'); break;
            case 'stretch': properties.push('align-items: stretch;'); break;
            default: properties.push(`align-items: ${value};`);
          }
          break;
          
        // Grid
        case 'grid': properties.push('display: grid;'); break;
        case 'grid-cols': properties.push(`grid-template-columns: repeat(${value}, 1fr);`); break;
        case 'gap': 
          if (value.includes('|')) {
            const [rowGap, columnGap] = value.split('|');
            properties.push(`gap: ${rowGap}px ${columnGap}px;`);
          } else {
            properties.push(`gap: ${value}px;`);
          }
          break;
        case 'gap-x': properties.push(`column-gap: ${value}px;`); break;
        case 'gap-y': properties.push(`row-gap: ${value}px;`); break;
        
        // Typography
        case 'color': 
        case 'fg': 
          if (value.includes('-')) {
            const [colorName, shadePart] = value.split('-');
            const colorKey = colorName as keyof typeof themeColors;
            const shade = parseInt(shadePart, 10);
            
            if (colorKey in themeColors) {
              const baseColor = themeColors[colorKey];
              properties.push(`color: ${!isNaN(shade) ? colors.lighten(baseColor, 100 - shade) : baseColor};`);
            } else {
              properties.push(`color: ${value};`);
            }
          } else if (value in themeColors) {
            properties.push(`color: ${themeColors[value as keyof typeof themeColors]};`);
          } else {
            properties.push(`color: ${value};`);
          }
          break;
        case 'bg': 
          if (value.includes('-')) {
            const [colorName, shadePart] = value.split('-');
            const colorKey = colorName as keyof typeof themeColors;
            const shade = parseInt(shadePart, 10);
            
            if (colorKey in themeColors) {
              const baseColor = themeColors[colorKey];
              properties.push(`background-color: ${!isNaN(shade) ? colors.lighten(baseColor, 100 - shade) : baseColor};`);
            } else {
              properties.push(`background-color: ${value};`);
            }
          } else if (value in themeColors) {
            properties.push(`background-color: ${themeColors[value as keyof typeof themeColors]};`);
          } else {
            properties.push(`background-color: ${value};`);
          }
          break;
        case 'font-weight': properties.push(`font-weight: ${value};`); break;
        case 'font-size': properties.push(`font-size: ${value}px;`); break;
        case 'f': properties.push(`font-size: ${value}px;`); break;
        case 'font': properties.push(`font-size: ${value}px;`); break;
        case 'text-align': properties.push(`text-align: ${value};`); break;
        case 'text': properties.push(`white-space: ${value};`); break;
        
        // Borders & Radius
        case 'r': properties.push(`border-radius: ${value}px;`); break;
        case 'border': 
          if (value.includes('|')) {
            const parts = value.split('|');
            if (parts.length === 3 && parts[2] in themeColors) {
              properties.push(`border: ${parts[0]} ${parts[1]} ${themeColors[parts[2] as keyof typeof themeColors]};`);
            } else {
              properties.push(`border: ${value.replace(/\|/g, ' ')};`);
            }
          } else {
            properties.push(`border: ${value}px solid;`);
          }
          break;
        case 'b': 
          if (value.includes('|')) {
            const parts = value.split('|');
            if (parts.length === 3 && parts[2] in themeColors) {
              properties.push(`border: ${parts[0]} ${parts[1]} ${themeColors[parts[2] as keyof typeof themeColors]};`);
            } else {
              properties.push(`border: ${value.replace(/\|/g, ' ')};`);
            }
          } else {
            properties.push(`border: ${value}px solid;`);
          }
          break;
        case 'border-top': 
          if (value.includes('|')) {
            const parts = value.split('|');
            if (parts.length === 3 && parts[2] in themeColors) {
              properties.push(`border-top: ${parts[0]} ${parts[1]} ${themeColors[parts[2] as keyof typeof themeColors]};`);
            } else {
              properties.push(`border-top: ${value.replace(/\|/g, ' ')};`);
            }
          } else {
            properties.push(`border-top: ${value}px solid;`);
          }
          break;
          
        // Other
        case 'cursor': properties.push(`cursor: ${value};`); break;
        case 'opacity': properties.push(`opacity: ${value};`); break;
        case 'transform': properties.push(`transform: ${value.replace(/\|/g, ' ')};`); break;
        case 'transition': properties.push(`transition: ${value.replace(/\|/g, ' ')};`); break;
        
        default:
          // For unknown properties, add a comment
          properties.push(`/* ${property}:${value} */`);
      }
    } else if (part === 'hidden') {
      properties.push('display: none;');
    } else if (part === 'block') {
      properties.push('display: block;');
    } else if (part === 'inline') {
      properties.push('display: inline;');
    } else if (part === 'inline-block') {
      properties.push('display: inline-block;');
    } else if (part === 'inline-flex') {
      properties.push('display: inline-flex;');
    } else if (part !== '') {
      // For unknown single properties, add a comment
      properties.push(`/* ${part} */`);
    }
  });
  
  return properties.join('\n');
} 