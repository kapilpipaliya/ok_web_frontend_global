import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

/**
 * Compiles a schema-authored function body (props, css, fns, text) and runs it.
 *
 * Bodies receive shorthand parameters:
 *   _  → full function argument object
 *   f  → _.fns
 *   c  → _.contextData
 *   t  → _.theme
 *   g  → _.graph
 *   sg → _.setGraph
 *   s  → _.executeNamedServerFunction
 *
 * These names are reserved: a top-level `const` of the same name is a SyntaxError.
 */
export const runArgsFunction = (
  body: string,
  _: FunctionArgumentType,
): unknown =>
  new Function("_", "f", "c", "t", "g", "sg", "s", body)(
    _,
    _.fns,
    _.contextData,
    _.theme,
    _.graph,
    _.setGraph,
    _.executeNamedServerFunction,
  );
