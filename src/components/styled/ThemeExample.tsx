import { createSignal } from "solid-js";
import { As } from "../As";
import { css, withStates } from "~/lib/styles";
import { useTheme } from "~/lib/context/ThemeContext";
import { useThemeToggle } from "~/lib/hooks/useThemeToggle";
import { wcagContrast } from "culori";

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
    color: ${theme.var?.color?.base};
    border-bottom: 2px solid ${theme.var?.color?.primary};
    padding-bottom: 0.5rem;
  `;
};

const buttonCss = () => {
  // Darken color for hover/active states

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

const sectionCss = () => css`
  margin-bottom: 2rem;
`;

const inputCss = () => {
  const theme = useTheme();
  const primaryColor = theme.var?.color?.primary;

  return withStates(
    `
      padding: 0.5rem;
      border-radius: 0.25rem;
      width: 100%;
      margin-bottom: 1rem;
      font-size: 1rem;
    `,
    undefined,
    `
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

const colorBoxCss = (color: string | undefined, name: string) => {
  // Calculate contrast to determine text color - safely
  let textColor = "#ffffff";

  // Only calculate contrast if we have a valid color
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
    width: 70px;
    height: 70px;
    background-color: ${color};
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${textColor};
    font-weight: bold;
    position: relative;
    overflow: visible;
    font-size: 0.85rem;
  `;
};

export function ThemeExample() {
  const [count, setCount] = createSignal(0);
  const [name, setName] = createSignal("");
  const theme = useTheme();
  const { toggleTheme, resetTheme, currentMode } = useThemeToggle();

  // Theme colors to display
  const themeColorEntries = [
    ["primary", theme.var?.color?.primary],
    ["secondary", theme.var?.color?.secondary],
    ["accent", theme.var?.color?.accent],
    ["neutral", theme.var?.color?.neutral],
    ["base", theme.var?.color?.base],
    ["info", theme.var?.color?.info],
    ["success", theme.var?.color?.success],
    ["warning", theme.var?.color?.warning],
    ["error", theme.var?.color?.error],
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

          <As as="button" onClick={() => setCount(0)}>
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
                {color || "undefined"}
              </As>
            ))}
        </As>
      </As>

      <As as="div" css={sectionCss()}>
        <As as="h1" css={headerCss()}>
          Color Shades
        </As>
        <As
          as="div"
          css={css`display: flex; flex-direction: column; gap: 2rem;`}
        >
          {themeColorEntries.map(([colorName]) => (
            <As as="div">
              <As as="h2" css={css`font-size: 1.2rem; margin: 0.5rem 0;`}>
                {colorName} Shades
              </As>
              <As
                as="div"
                css={css`display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 1.5rem;`}
              >
                {/* First row: 0-100 */}
                <As
                  as="div"
                  css={css`display: flex; gap: 1.25rem; overflow-x: auto; padding-bottom: 0.5rem; min-width: 100%;`}
                >
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((shade) => {
                    const colorKey = `${colorName}_${shade}`;
                    const shadeColor = theme.var?.color?.[colorKey];
                    if (!shadeColor) return null;
                    return (
                      <As
                        as="div"
                        css={colorBoxCss(shadeColor as string, `${shade}`)}
                      >
                        {shade}
                      </As>
                    );
                  })}
                </As>

                {/* Second row: 200-1000 */}
                <As
                  as="div"
                  css={css`display: flex; gap: 1.25rem; overflow-x: auto; padding-bottom: 0.5rem; min-width: 100%;`}
                >
                  {[200, 300, 400, 500, 600, 700, 800, 900, 1000].map(
                    (shade) => {
                      const colorKey = `${colorName}_${shade}`;
                      const shadeColor = theme.var?.color?.[colorKey];
                      if (!shadeColor) return null;
                      return (
                        <As
                          as="div"
                          css={colorBoxCss(shadeColor as string, `${shade}`)}
                        >
                          {shade}
                        </As>
                      );
                    },
                  )}
                </As>
              </As>
            </As>
          ))}
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
          <As as="button" css={buttonCss()} onClick={toggleTheme}>
            Toggle {currentMode() === "dark" ? "Light" : "Dark"} Mode
          </As>

          <As as="button" onClick={resetTheme}>
            Reset Theme
          </As>

          <As
            as="div"
            css={css`margin-left: auto; font-size: 0.875rem; opacity: 0.7;`}
          >
            Current mode: {currentMode()}
          </As>
        </As>
      </As>
    </As>
  );
}
