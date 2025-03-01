import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";

export function loadingIconSchema() {
  return {
    attributes: [
      {
        class: "@rotate|2s|linear|infinite",
        componentName: "Icon",
        height: 32,
        icon: "ph:spinner",
        width: 32,
      },
    ],
    componentName: "Show",
    props: (options: FunctionArgumentType) => ({
      when: options.dataContext.modalState[0]?.isLoading,
    }),
  };
}
