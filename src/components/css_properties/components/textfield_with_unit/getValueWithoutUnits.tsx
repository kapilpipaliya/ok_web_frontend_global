import { sizeTypes } from "../../constants/csseditor_constants";

export function getValueWithoutUnits(valueWithUnits: string): number | string {
  if (!valueWithUnits) return "";
  const regexPattern = new RegExp(sizeTypes.join("|"), "g");
  const numericValue = Number.parseFloat(valueWithUnits.replace(regexPattern, ""));
  return isNaN(numericValue) ? "" : numericValue;
}
