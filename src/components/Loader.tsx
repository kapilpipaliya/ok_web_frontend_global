import { type Component, createMemo } from "solid-js";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

// A flexible loader component that displays a spinner and optional message
export const Loader: Component<{
  message?: string;
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
}> = (props) => {
  const getSize = createMemo(() => {
    switch (props.size) {
      case "small":
        return { spinner: 24, fontSize: 14 };
      case "large":
        return { spinner: 56, fontSize: 18 };
      case "medium":
      default:
        return { spinner: 40, fontSize: 16 };
    }
  });

  return (
    <As
      as="div"
      css={[
        css`
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        `,
        props.fullScreen
          ? css`
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background-color: \${args.theme.var.color.base_10}80;
          z-index: 9999;
        `
          : "",
      ]}
    >
      <As
        as="div"
        css={[
          css`
            display: inline-block;
            width: ${getSize().spinner}px;
            height: ${getSize().spinner}px;
            border: 3px solid \${args.theme.var.color.base_30};
            border-radius: 50%;
            border-top-color: \${args.theme.var.color.primary};
            animation: spinner 1s ease-in-out infinite;
          `,
          `@keyframes spinner {
            to {transform: rotate(360deg);}
          }`,
        ]}
      />
      {props.message && (
        <As
          as="p"
          css={css`
            color: \${args.theme.var.color.base};
            font-size: ${getSize().fontSize}px;
            margin: 0;
            text-align: center;
          `}
        >
          {props.message}
        </As>
      )}
    </As>
  );
};
