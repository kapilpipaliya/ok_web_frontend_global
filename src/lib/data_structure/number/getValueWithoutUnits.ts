import { sizeTypes } from "~/features/css_editor/constants/csseditor_constants";
import { isNumber } from "~/lib/data_structure/number/isNumber";

export function getValueWithoutUnits(
  valueWithUnits: number | string,
): number | string {
  if (isNumber(valueWithUnits)) {
    return valueWithUnits;
  }
  if (!valueWithUnits) {
    return "";
  }
  const regexPattern = new RegExp(sizeTypes.join("|"), "g");
  const numericValue = Number.parseFloat(
    valueWithUnits.replace(regexPattern, ""),
  );
  return Number.isNaN(numericValue) ? "" : numericValue;
}
