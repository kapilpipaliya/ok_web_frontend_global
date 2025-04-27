import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { css } from "../styles";

export function loadingIconSchema() {
  return {
    attributes: [
      {
        css: css`
  rotate: 2s linear infinite;
`,
        componentName: "Html", as: "icon",
        height: 32,
        icon: "ph:spinner",
        width: 32,
      },
    ],
    componentName: "Show",
    props: (options: FunctionArgumentType) => ({
      when: options.contextData.modalState[0]?.isLoading,
    }),
  };
}
