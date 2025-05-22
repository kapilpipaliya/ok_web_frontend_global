import { createSignal, createMemo } from "solid-js";
import { As } from "../As";
import { css, withStates } from "~/lib/styles";
import { useTheme } from "~/lib/context/ThemeContext";
import { useThemeToggle } from "~/lib/hooks/useThemeToggle";
import { wcagContrast } from "culori";
import {
  arrow as floatingArrow,
  computePosition,
  flip,
  offset,
  shift,
} from "@floating-ui/dom";

// Types
type ColorEntry = [string, string | undefined];
type ThemeColorEntries = ColorEntry[];

// Constants
const COLOR_SHADES = [
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800,
  900,
];
const GRID_COLUMNS = `120px repeat(${COLOR_SHADES.length}, 40px)`;

// Styles
const containerStyles = () => css`
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 1400px;
  margin: 2rem auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto;
  gap: 2rem;
  grid-template-areas: 
    "header header"
    "controls palette"
    "shades shades";
    
  @media (max-width: 768px) {
    padding: 1.5rem;
    gap: 1.5rem;
    grid-template-columns: 1fr;
    grid-template-areas: 
      "header"
      "controls"
      "palette"
      "shades";
  }
`;

const mainHeaderStyles = () => {
  const theme = useTheme();
  return css`
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, ${theme.var?.color?.primary} 0%, ${theme.var?.color?.info} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-align: center;
    margin: 0;
    letter-spacing: -0.02em;
  `;
};

const sectionHeaderStyles = () => {
  const theme = useTheme();
  return css`
    font-size: 1.5rem;
    font-weight: 700;
    color: ${theme.var?.color?.base};
    margin: 0 0 1.5rem 0;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -0.5rem;
      left: 0;
      width: 100%;
      height: 3px;
      background: ${theme.var?.color?.primary};
      border-radius: 2px;
    }
  `;
};

const buttonStyles = () => {
  return withStates(
    `
      background-color: \${args.theme.var.color.primary};
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease;
    `,
    `background-color: \${args.theme.var.color.primary_40};`,
  );
};

const sectionCardStyles = (gridArea?: string) => css`
  ${gridArea ? `grid-area: ${gridArea};` : ""}
  padding: 2rem;
  border-radius: 1rem;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);
    transform: translateY(-2px);
  }
`;

const colorPaletteGridStyles = () => css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 0;
`;

const colorBoxStyles = (color: string | undefined) => {
  let textColor = "#ffffff";

  if (color) {
    try {
      const blackContrast = wcagContrast("#000000", color);
      const whiteContrast = wcagContrast("#ffffff", color);
      textColor = blackContrast > whiteContrast ? "#000000" : "#ffffff";
    } catch (e) {
      console.warn(`Contrast calculation failed for color: ${color}`);
    }
  }

  return css`
    width: 60px;
    height: 60px;
    min-width: 60px;
    background-color: ${color};
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${textColor};
    font-weight: 600;
    position: relative;
    font-size: 0.75rem;
    box-shadow: 0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08);
    border: 2px solid white;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 12px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.1);
    }
  `;
};

const variationsGridHeaderStyles = () => css`
  display: grid; 
  grid-template-columns: ${GRID_COLUMNS}; 
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(0,0,0,0.02);
  border-radius: 0.5rem;
  overflow-x: auto;
`;

const variationsRowStyles = () => css`
  display: grid; 
  grid-template-columns: ${GRID_COLUMNS}; 
  gap: 0.5rem;
  align-items: center;
  padding: 1rem;
  background: white;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 0.75rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  overflow-x: auto;
`;

const shadeSwatchStyles = (shadeColor: string) => css`
  width: 40px;
  height: 40px;
  background-color: ${shadeColor};
  border-radius: 0.5rem;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    z-index: 10;
  }
`;

const emptyShadeStyles = () => css`
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  background: repeating-linear-gradient(
    45deg,
    #f0f0f0,
    #f0f0f0 2px,
    transparent 2px,
    transparent 4px
  );
  border: 1px solid rgba(0,0,0,0.1);
`;

const tooltipStyles = (isVisible: boolean) => css`
  position: absolute;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'Monaco', 'Menlo', monospace;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  transform: translateY(-4px);
  opacity: ${isVisible ? 1 : 0};
  visibility: ${isVisible ? "visible" : "hidden"};
  transition: opacity 0.2s ease, visibility 0.2s ease;
`;

const arrowStyles = () => css`
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(0, 0, 0, 0.9);
  transform: rotate(45deg);
  z-index: -1;
`;

// Utility functions
const getThemeColors = (theme: any): ThemeColorEntries => [
  ["primary", theme.var?.color?.primary],
  ["info", theme.var?.color?.info],
  ["success", theme.var?.color?.success],
  ["warning", theme.var?.color?.warning],
  ["error", theme.var?.color?.error],
];

// Hook for tooltip functionality
const useTooltip = () => {
  const [tooltipContent, setTooltipContent] = createSignal("");
  const [showTooltip, setShowTooltip] = createSignal(false);

  let tooltipRef: HTMLDivElement | undefined;
  let arrowRef: HTMLDivElement | undefined;

  const showColorTooltip = async (event: MouseEvent, colorValue: string) => {
    const target = event.currentTarget as HTMLElement;
    setTooltipContent(colorValue);
    setShowTooltip(true);

    if (tooltipRef && arrowRef) {
      const { x, y, placement, middlewareData } = await computePosition(
        target,
        tooltipRef,
        {
          placement: "top",
          middleware: [
            offset(8),
            flip(),
            shift({ padding: 8 }),
            floatingArrow({ element: arrowRef }),
          ],
        },
      );

      Object.assign(tooltipRef.style, {
        left: `${x}px`,
        top: `${y}px`,
      });

      // Position the arrow
      const { x: arrowX, y: arrowY } = middlewareData.arrow!;
      const staticSide = {
        top: "bottom",
        right: "left",
        bottom: "top",
        left: "right",
      }[placement.split("-")[0]]!;

      Object.assign(arrowRef.style, {
        left: arrowX != null ? `${arrowX}px` : "",
        top: arrowY != null ? `${arrowY}px` : "",
        right: "",
        bottom: "",
        [staticSide]: "-4px",
      });
    }
  };

  const hideColorTooltip = () => {
    setShowTooltip(false);
  };

  return {
    tooltipContent,
    showTooltip,
    tooltipRef: (ref: HTMLDivElement) => {
      tooltipRef = ref;
    },
    arrowRef: (ref: HTMLDivElement) => {
      arrowRef = ref;
    },
    showColorTooltip,
    hideColorTooltip,
  };
};

// Component parts
const HeaderSection = () => (
  <As
    as="div"
    css={css`grid-area: header; text-align: center; margin-bottom: 1rem;`}
  >
    <As as="h1" css={mainHeaderStyles()}>
      Theme Designer
    </As>
    <As
      as="p"
      css={css`
      font-size: 1.1rem; 
      color: rgba(0,0,0,0.6); 
      margin: 1rem 0 0 0; 
      font-weight: 400;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    `}
    >
      Explore and customize your application's color system with live theme
      controls
    </As>
  </As>
);

const ThemeControlsSection = () => {
  const { toggleTheme, resetTheme, currentMode } = useThemeToggle();

  return (
    <As as="div" css={sectionCardStyles("controls")}>
      <As as="h2" css={sectionHeaderStyles()}>
        Theme Controls
      </As>
      <As as="div" css={css`display: flex; flex-direction: column; gap: 1rem;`}>
        <As as="button" css={buttonStyles()} onClick={toggleTheme}>
          Toggle {currentMode() === "dark" ? "Light" : "Dark"} Mode
        </As>

        <As as="button" css={buttonStyles()} onClick={resetTheme}>
          Reset Theme
        </As>

        <As
          as="div"
          css={css`
          font-size: 1rem; 
          opacity: 0.7; 
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(0,0,0,0.03);
          border-radius: 0.5rem;
          text-align: center;
          font-weight: 500;
        `}
        >
          Current mode: <strong>{currentMode()}</strong>
        </As>
      </As>
    </As>
  );
};

const ColorPaletteSection = (props: { themeColors: ThemeColorEntries }) => (
  <As as="div" css={sectionCardStyles("palette")}>
    <As as="h2" css={sectionHeaderStyles()}>
      Primary Colors
    </As>
    <As as="div" css={colorPaletteGridStyles()}>
      {props.themeColors
        .filter(([_, color]) => !!color)
        .map(([name, color]) => (
          <As
            as="div"
            css={css`display: flex; flex-direction: column; align-items: center; gap: 0.5rem;`}
          >
            <As as="div" css={colorBoxStyles(color as string)} />
            <As
              as="span"
              css={css`
              font-size: 0.9rem; 
              font-weight: 600; 
              text-transform: capitalize;
              color: rgba(0,0,0,0.7);
            `}
            >
              {name}
            </As>
            <As
              as="code"
              css={css`
              font-size: 0.75rem; 
              background: rgba(0,0,0,0.05); 
              padding: 0.25rem 0.5rem; 
              border-radius: 0.25rem;
              color: rgba(0,0,0,0.6);
              font-family: 'Monaco', monospace;
            `}
            >
              {color}
            </As>
          </As>
        ))}
    </As>
  </As>
);

const ColorVariationsSection = (props: {
  themeColors: ThemeColorEntries;
  showColorTooltip: (event: MouseEvent, color: string) => void;
  hideColorTooltip: () => void;
}) => {
  const theme = useTheme();

  return (
    <As as="div" css={sectionCardStyles("shades")}>
      <As as="h2" css={sectionHeaderStyles()}>
        Color Variations
      </As>
      <As
        as="p"
        css={css`
        font-size: 1rem; 
        color: rgba(0,0,0,0.6); 
        margin: 0 0 2rem 0; 
        font-weight: 400;
      `}
      >
        Complete color scale from light (10) to dark (900) variations
      </As>

      {/* Table Header */}
      <As as="div" css={variationsGridHeaderStyles()}>
        <As
          as="div"
          css={css`
          font-weight: 700;
          font-size: 0.9rem;
          color: rgba(0,0,0,0.8);
        `}
        >
          Color
        </As>
        {COLOR_SHADES.map((shade) => (
          <As
            as="div"
            css={css`
            font-size: 0.7rem;
            font-weight: 600;
            color: rgba(0,0,0,0.6);
            text-align: center;
          `}
          >
            {shade}
          </As>
        ))}
      </As>

      {/* Color Rows */}
      <As as="div" css={css`display: flex; flex-direction: column; gap: 1rem;`}>
        {props.themeColors.map(([colorName]) => (
          <As as="div" css={variationsRowStyles()}>
            <As
              as="div"
              css={css`
              font-weight: 700;
              font-size: 1rem;
              text-transform: capitalize;
              color: rgba(0,0,0,0.8);
            `}
            >
              {colorName}
            </As>
            {COLOR_SHADES.map((shade) => {
              const colorKey = `${colorName}_${shade}`;
              const shadeColor = theme.var?.color?.[colorKey];

              if (!shadeColor) {
                return <As as="div" css={emptyShadeStyles()} />;
              }

              return (
                <As
                  as="div"
                  css={shadeSwatchStyles(shadeColor as string)}
                  onMouseEnter={(e) =>
                    props.showColorTooltip(e, shadeColor as string)
                  }
                  onMouseLeave={props.hideColorTooltip}
                />
              );
            })}
          </As>
        ))}
      </As>
    </As>
  );
};

const TooltipComponent = (props: {
  tooltipContent: () => string;
  showTooltip: () => boolean;
  tooltipRef: (ref: HTMLDivElement) => void;
  arrowRef: (ref: HTMLDivElement) => void;
}) => (
  <As as="div" ref={props.tooltipRef} css={tooltipStyles(props.showTooltip())}>
    {props.tooltipContent()}
    <As as="div" ref={props.arrowRef} css={arrowStyles()} />
  </As>
);

// Main component
export function ThemeExample() {
  const theme = useTheme();
  const themeColors = createMemo(() => getThemeColors(theme));
  const {
    tooltipContent,
    showTooltip,
    tooltipRef,
    arrowRef,
    showColorTooltip,
    hideColorTooltip,
  } = useTooltip();

  return (
    <As as="div" css={containerStyles()}>
      <HeaderSection />
      <ThemeControlsSection />
      <ColorPaletteSection themeColors={themeColors()} />
      <ColorVariationsSection
        themeColors={themeColors()}
        showColorTooltip={showColorTooltip}
        hideColorTooltip={hideColorTooltip}
      />
      <TooltipComponent
        tooltipContent={tooltipContent}
        showTooltip={showTooltip}
        tooltipRef={tooltipRef}
        arrowRef={arrowRef}
      />
    </As>
  );
}
