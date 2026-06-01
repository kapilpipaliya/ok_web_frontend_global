import type { CssType } from "~/components/form/type/CssType";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { hashCssString } from "~/lib/styles/hashCss";
import { processCssContent } from "~/lib/styles/processCss";

const ID_PLACEHOLDER_REGEX = /\._id/g;

export type ScopedComponentCss = {
  hash: string;
  scoped: string;
};

/** Evaluates CSS and scopes `._id` placeholders to a stable hash-based class name. */
export function scopeComponentCss(
  cssContent: CssType | undefined,
  functionArgs: FunctionArgumentType,
): ScopedComponentCss | undefined {
  if (!cssContent) {
    return undefined;
  }

  try {
    const evaluated = processCssContent(cssContent, functionArgs, "", {
      skipIdReplace: true,
    });
    if (!evaluated?.trim()) {
      return undefined;
    }

    const hash = hashCssString(evaluated);
    const scoped = evaluated.replace(ID_PLACEHOLDER_REGEX, `.${hash}`);
    return { hash, scoped };
  } catch (error) {
    console.error("Error in css:", error);
    return undefined;
  }
}
