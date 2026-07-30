import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

/**
 * Compiles a schema-authored function body (props, css, fns, text) and runs it.
 *
 * Besides `args`, the body receives shorthand aliases for the most used
 * members. Adding a name here makes it a reserved identifier for every schema
 * body, so a top-level `const` of the same name becomes a SyntaxError.
 */
export const runArgsFunction = (
  body: string,
  args: FunctionArgumentType,
): unknown =>
  new Function(
    "args",
    "_",
    "f",
    "c",
    "t",
    "g",
    "sg",
    "s",
    body,
  )(
    args,
    args,
    args.fns,
    args.contextData,
    args.theme,
    args.graph,
    args.setGraph,
    args.executeNamedServerFunction,
  );
