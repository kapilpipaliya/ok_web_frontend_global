export function getValueWithoutUnits(valueWithUnits: string): number | string {
  if (!valueWithUnits) return "";
  const unitsToRemove = ["px", "%", "em", "rem", "vh", "vw"];
  const regexPattern = new RegExp(unitsToRemove.join("|"), "g");
  const numericValue = Number.parseFloat(valueWithUnits.replace(regexPattern, ""));
  return isNaN(numericValue) ? "" : numericValue;
}
