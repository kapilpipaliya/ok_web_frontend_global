import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

export function getErrorSchema(key: string, customClass?: string) {
  return {
    as: "span",
    class: customClass || "fg:red grid-column:span|2@xs mt:-22",
    componentName: "Html",
    key: key,
    props: (args: FunctionArgumentType) => ({
      hidden: !args.error(),
      text: args.error()
    }),
  };
}
