import type { Vertex } from "~/lib/graph/type/vertex";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { createUniqueId } from "~/lib/solid/createUniqueId";
import { createMemo, type Accessor } from "solid-js";
import { processCssContent } from "~/lib/styles/processCss";

/**
 * Creates a memo for CSS styles
 *
 * @param props - Component props containing meta vertex
 * @param options - Options including function argument getter
 * @returns Object with cssStyle accessor (returns string | undefined) and styleId
 *
 * Note: CSS input can be string, array, or function returning either.
 * The output is always a single string (or undefined), as processCssContent
 * handles all array cases internally and joins them.
 */
export function createCssStyleMemo(
  props: {
    meta: Vertex;
  },
  options: {
    getFunctionArgumentWithValue: () => FunctionArgumentType;
  },
): {
  cssStyle: Accessor<string | undefined>;
  styleId: string;
} {
  const styleId = createUniqueId();

  const cssStyle = createMemo<string | undefined>(() => {
    try {
      const functionArgs = options.getFunctionArgumentWithValue();
      return processCssContent(props.meta.P.css, functionArgs, styleId);
    } catch (error) {
      console.error("Error in css:", error);
      return "";
    }
  });

  return { cssStyle, styleId };
}
