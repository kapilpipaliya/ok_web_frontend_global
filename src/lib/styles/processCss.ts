import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { CssType } from "~/components/form/type/CssType";

/**
 * Processes CSS content from different formats into a single string
 * Used by both As.tsx and DynamicComponent.tsx for consistent CSS handling
 *
 * @param cssContent - CSS content that can be a string, function, or array of either
 * @param functionArgs - Arguments to pass to CSS functions, typically contains theme
 * @param uniqueId - The unique ID to replace '._id' placeholders with
 * @returns Processed CSS string
 */
export const processCssContent = (
  cssContent: CssType,
  functionArgs: FunctionArgumentType,
  uniqueId: string,
): string | undefined => {
  if (!cssContent) {
    return undefined;
  }

  // Handle array of CSS strings/functions
  if (Array.isArray(cssContent)) {
    return cssContent
      .map((cssItem) => {
        if (typeof cssItem === "function") {
          return processStyle(cssItem(functionArgs), functionArgs, uniqueId);
        }
        return processStyle(cssItem, functionArgs, uniqueId);
      })
      .filter(Boolean)
      .join("\n");
  }

  // Handle function CSS
  if (typeof cssContent === "function") {
    return processStyle(cssContent(functionArgs), functionArgs, uniqueId);
  }

  // Handle string CSS directly
  return processStyle(cssContent, functionArgs, uniqueId);
};

/**
 * Helper function to process a CSS string and replace ._id placeholders
 * Also evaluates template strings with variables
 */
export const processStyle = (
  style: string | string[] | undefined,
  functionArgs: FunctionArgumentType,
  uniqueId: string,
): string => {
  if (!style) {
    return "";
  }

  if (Array.isArray(style)) {
    return style
      .map((s) => processStyle(s, functionArgs, uniqueId))
      .filter(Boolean)
      .join("\n");
  }

  if (typeof style === "string") {
    // Handle template string evaluation
    if (
      style.trim() !== "" &&
      (style.includes("args.") || style.includes("return"))
    ) {
      try {
        const cssFunction = style.includes("return")
          ? new Function("args", style)
          : new Function("args", `return \`${style}\``);
        const evaluatedStyle = cssFunction(functionArgs);
        return typeof evaluatedStyle === "string" &&
          evaluatedStyle.includes("._id")
          ? evaluatedStyle.replace(/\._id/g, `.${uniqueId}`)
          : evaluatedStyle || "";
      } catch (error) {
        console.error("Error evaluating css template string:", error, style);
        return "";
      }
    }

    // Handle plain CSS with ._id replacement
    if (style.includes("._id")) {
      return style.replace(/\._id/g, `.${uniqueId}`);
    }

    return style;
  }

  return "";
};
