import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";

import { getTitle } from "~/components/getTitle";
import { FieldAttribute } from "~/lib/meta/FormMetadataType";

export function getTitleSchema(title: string) {
  return {
    attributes: [
      {
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          text: getTitle(title, options.graph),
        }),
      },
    ],
    children: "Login",
    componentName: "Title",
  } as FieldAttribute;
}
