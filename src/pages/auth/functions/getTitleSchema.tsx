import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { getTitle } from "~/components/getTitle";

export function getTitleSchema(title: string) {
  return {
    attributes: [
      {
        componentName: "Title",
        props: (options: FunctionArgumentType) => ({
          text: getTitle(title, options.graph),
        }),
      } as FieldAttribute,
    ],
  };
}
