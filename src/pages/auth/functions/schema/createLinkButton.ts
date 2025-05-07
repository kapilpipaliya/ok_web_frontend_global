import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { css } from "~/lib/styles";

/**
 * Creates a link button
 * @param text - Button text
 * @param onClick - Click handler
 * @param css - Additional CSS classes
 * @returns Link button schema
 */
export function createLinkButton(
  text: (options: FunctionArgumentType) => string,
  onClick: (options: FunctionArgumentType) => Promise<void> | void,
  cssString = css`text-align:center; margin-top:16px;`,
) {
  return {
    as: "div",
    attributes: [
      {
        as: "a",
        css: css`
  color: #3b82f6;
  cursor: pointer;
`,
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          onClick: async () => {
            if (onClick) {
              await onClick(options);
            }
          },
          text: text(options),
        }),
      },
    ],
    css: cssString,
    componentName: "Html",
  };
}
