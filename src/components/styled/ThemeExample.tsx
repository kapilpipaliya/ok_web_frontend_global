import { createSignal } from "solid-js";
import { As } from "../As";
import { css, withStates } from "~/lib/styles";
import { useTheme } from "~/lib/context/ThemeContext";
import { formatHex, formatRgb, hsl, rgb, wcagContrast } from "culori";

// CSS generation functions using the new approach with ThemeContext
const containerCss = () => css`
  padding: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
`;

const headerCss = () => {
  const theme = useTheme();
  return css`
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    color: ${theme.baseColor};
    border-bottom: 2px solid ${theme.primaryColor};
    padding-bottom: 0.5rem;
  `;
};

const buttonCss = () => {
  const theme = useTheme();
  const baseColor = theme.primaryColor;

  // Darken color for hover/active states
  const hslColor = hsl(baseColor);
  const hoverColor = formatHex(
    hsl({ ...hslColor, l: Math.max(0, (hslColor.l || 0) - 0.1) }),
  );
  const activeColor = formatHex(
    hsl({ ...hslColor, l: Math.max(0, (hslColor.l || 0) - 0.15) }),
  );

  return withStates(
    `
      background-color: ${baseColor};
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease;
    `,
    `background-color: ${hoverColor};`,
    undefined,
    `background-color: ${activeColor};`,
  );
};

const secondaryButtonCss = () => {
  const theme = useTheme();
  const baseColor = theme.secondaryColor;

  // Darken color for hover/active states
  const hslColor = hsl(baseColor);
  const _hoverColor = formatHex(
    hsl({ ...hslColor, l: Math.max(0, (hslColor.l || 0) - 0.1) }),
  );
  const _activeColor = formatHex(
    hsl({ ...hslColor, l: Math.max(0, (hslColor.l || 0) - 0.15) }),
  );

  return withStates(
    `
      background-color: transparent;
      color: ${baseColor};
      border: 1px solid ${baseColor};
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      font-weight: 500;
      cursor: pointer;
      margin-left: 1rem;
      transition: all 0.2s ease;
    `,
    `background-color: ${formatRgb(rgb({ ...rgb(baseColor), alpha: 0.1 }))};`,
    undefined,
    `background-color: ${formatRgb(rgb({ ...rgb(baseColor), alpha: 0.2 }))};`,
  );
};

const sectionCss = () => css`
  margin-bottom: 2rem;
`;

const inputCss = () => {
  const theme = useTheme();
  const baseColor = theme.baseColor;
  const primaryColor = theme.primaryColor;

  return withStates(
    `
      border: 1px solid ${formatRgb(rgb({ ...rgb(baseColor), alpha: 0.2 }))};
      padding: 0.5rem;
      border-radius: 0.25rem;
      width: 100%;
      margin-bottom: 1rem;
      font-size: 1rem;
    `,
    undefined,
    `
      outline: 2px solid ${formatRgb(rgb({ ...rgb(primaryColor), alpha: 0.5 }))};
      border-color: ${primaryColor};
    `,
  );
};

const colorPaletteCss = () => css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const colorBoxCss = (color: string, name: string) => {
  // Calculate contrast to determine text color
  const blackContrast = wcagContrast("#000000", color);
  const whiteContrast = wcagContrast("#ffffff", color);
  const textColor = blackContrast > whiteContrast ? "#000000" : "#ffffff";

  return css`
    height: 80px;
    background-color: ${color};
    border-radius: 0.25rem;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0.5rem;
    color: ${textColor};
    font-size: 0.75rem;
    font-weight: bold;
    position: relative;
    
    &::before {
      content: "${name}";
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      font-size: 0.75rem;
    }
  `;
};

export function ThemeExample() {
  const [count, setCount] = createSignal(0);
  const [name, setName] = createSignal("");
  const theme = useTheme();

  // Theme colors to display
  const themeColorEntries = [
    ["primary", theme.primaryColor],
    ["secondary", theme.secondaryColor],
    ["accent", theme.accentColor],
    ["neutral", theme.neutralColor],
    ["base", theme.baseColor],
    ["info", theme.infoColor],
    ["success", theme.successColor],
    ["warning", theme.warningColor],
    ["error", theme.errorColor],
  ];

  return (
    <As as="div" css={containerCss()}>
      <As as="h1" css={headerCss()}>
        CSS-in-JS Example
      </As>

      <As as="div" css={sectionCss()}>
        <As
          as="input"
          css={inputCss()}
          type="text"
          placeholder="Enter your name"
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
        />

        <As as="div">
          <As
            as="button"
            css={buttonCss()}
            onClick={() => setCount((c) => c + 1)}
          >
            Count: {count()}
          </As>

          <As
            as="button"
            css={secondaryButtonCss()}
            onClick={() => setCount(0)}
          >
            Reset
          </As>
        </As>
      </As>

      <As as="div" css={sectionCss()}>
        <As as="h1" css={headerCss()}>
          Color Palette
        </As>
        <As as="div" css={colorPaletteCss()}>
          {themeColorEntries
            .filter(([_, color]) => !!color)
            .map(([name, color]) => (
              <As as="div" css={colorBoxCss(color as string, name as string)}>
                {name}
              </As>
            ))}
        </As>
      </As>

      <As as="div" css={sectionCss()}>
        <As as="h1" css={headerCss()}>
          Color Shades
        </As>
        <As as="div" css={colorPaletteCss()}>
          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 200, 400, 600, 800, 1000].map(
            (shade) => (
              <As
                as="div"
                css={colorBoxCss(
                  theme[`primaryColor_${shade};`] as string,
                  `primary-${shade}`,
                )}
              >
                {shade}
              </As>
            ),
          )}
        </As>
      </As>

      <As as="div" css={sectionCss()}>
        <As as="h1" css={headerCss()}>
          Theme Controls
        </As>
        <As
          as="div"
          css={css`
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        `}
        >
          <As
            as="button"
            css={buttonCss()}
            onClick={() => theme.toggleColorMode?.()}
          >
            Toggle {theme.colorMode === "dark" ? "Light" : "Dark"} Mode
          </As>

          <As
            as="button"
            css={secondaryButtonCss()}
            onClick={() => theme.resetTheme?.()}
          >
            Reset Theme
          </As>
        </As>
      </As>
    </As>
  );
}
