import { As } from "~/components/As";
import { DEFAULT_BREAKPOINTS } from "~/lib/styles";
import { useTheme } from "~/lib/context/ThemeContext";
import { styles } from "../styles";

// Helper function to compose multiple style functions
// Since we don't know the exact return type, we'll use a simpler approach
const composeStyles = (...stylesFns: ((options?: any) => string)[]) => {
  // Return a function that will call each style function and concatenate results
  return (options?: any) => {
    return stylesFns.map((styleFn) => styleFn(options)).join("\n");
  };
};

// Create button styles using the @styles decorator
const buttonStyles = (theme: ReturnType<typeof useTheme>) =>
  styles({
    base: {
      backgroundColor: theme.var.color.primary || "#3b82f6",
      color: "#ffffff",
      padding: "0.5rem 1rem",
      borderRadius: "0.25rem",
      border: "none",
      cursor: "pointer",
      fontWeight: "500",
      transition: "all 0.2s ease-in-out",
    },
    hover: {
      backgroundColor: theme.adjustColor(theme.var.color.primary || "#3b82f6", {
        darken: 10,
      }),
    },
    active: {
      backgroundColor: theme.adjustColor(theme.var.color.primary || "#3b82f6", {
        darken: 20,
      }),
    },
    disabled: {
      backgroundColor: "#cccccc",
      cursor: "not-allowed",
      opacity: "0.7",
    },
  });

// Create card styles with static strings
const cardStyles = (theme: ReturnType<typeof useTheme>) =>
  styles({
    base: {
      backgroundColor: "#ffffff",
      borderRadius: "0.5rem",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      padding: "1.5rem",
      margin: "1rem 0",
    },
    // Add responsive styles with media queries
    media: {
      [`(min-width: ${DEFAULT_BREAKPOINTS.md})`]: {
        padding: "2rem",
        margin: "1.5rem 0",
      },
      [`(min-width: ${DEFAULT_BREAKPOINTS.lg})`]: {
        padding: "2.5rem",
        margin: "2rem 0",
      },
    },
    // Add styles for children
    children: {
      h2: {
        fontSize: "1.5rem",
        marginTop: "0",
        color: theme.var.color.base || "#1e293b",
      },
      p: {
        color: theme.adjustColor(theme.var.color.base || "#1e293b", {
          lighten: 20,
        }),
        lineHeight: "1.6",
      },
    },
  });

// Combine multiple styles
const primaryButtonStyles = (theme: ReturnType<typeof useTheme>) =>
  composeStyles(
    buttonStyles(theme),
    styles({
      base: {
        backgroundColor: theme.var.color.success || "#10b981",
        borderRadius: "2rem",
      },
      hover: {
        backgroundColor: theme.adjustColor(
          theme.var.color.success || "#10b981",
          { darken: 10 },
        ),
      },
    }),
  );

export function StylesExample() {
  const theme = useTheme();

  return (
    <div>
      <h1>Styles Decorator Examples</h1>

      {/* Basic button with styles */}
      <As as="button" css={buttonStyles(theme)}>
        Click Me
      </As>

      {/* Disabled button */}
      <As as="button" css={buttonStyles(theme)} disabled>
        Disabled Button
      </As>

      {/* Primary button with merged styles */}
      <As as="button" css={primaryButtonStyles(theme)}>
        Primary Action
      </As>

      {/* Card with child styling */}
      <As as="div" css={cardStyles(theme)}>
        <h2>Card Title</h2>
        <p>
          This card uses the @styles decorator for styling. Note how it handles
          responsive behavior and child element styling using ThemeContext
          helpers.
        </p>
      </As>
    </div>
  );
}
