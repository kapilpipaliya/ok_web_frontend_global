import type { Vertex } from "~/lib/graph/type/vertex";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { createMemo } from "solid-js";
import type { DynamicPropsType } from "~/components/form/dynamic_component/functions/DynamicPropsType";
import { runArgsFunction } from "~/lib/utils/createArgsFunction";

/**
 * Creates a memo for processed text
 */
export function createProcessedTextMemo(
  props: {
    meta: Vertex;
  },
  options: {
    dynamicProps: () => DynamicPropsType;
    getFunctionArgumentWithValue: () => FunctionArgumentType;
  },
) {
  return createMemo(() => {
    try {
      if (
        options.dynamicProps().text !== undefined &&
        options.dynamicProps().text !== null
      ) {
        return options.dynamicProps().text;
      }

      const text = props.meta.P.text;
      if (text && typeof text === "string" && text.includes("${")) {
        return runArgsFunction(
          `return \`${text}\``,
          options.getFunctionArgumentWithValue(),
        );
      }
      return text;
    } catch (error) {
      console.error("Error processing text:", error);
      return props.meta.P.text;
    }
  });
}
