import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { ModalStateStore } from "~/lib/types/ModalStateStore";
import { css } from "../styles";

export function loadingIconSchema() {
  return {
    attributes: [
      {
        css: css`
  rotate: 2s linear infinite;
`,
        componentName: "Html",
        as: "icon",
        height: 32,
        icon: "ph:spinner",
        width: 32,
      },
    ],
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      show: (options.contextData.modalState as ModalStateStore)[0]?.isLoading,
    }),
  };
}
