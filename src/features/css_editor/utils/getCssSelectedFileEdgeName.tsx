import { toPascal } from "case-switcher-js";

export function getCssSelectedFileEdgeName(
  dataLabel: string,
  propertyName: string,
  cssState: string,
  CssPropertyName: string,
) {
  return `${toPascal(dataLabel)}${toPascal(propertyName)}${toPascal(cssState)}${toPascal(CssPropertyName)}`;
}
