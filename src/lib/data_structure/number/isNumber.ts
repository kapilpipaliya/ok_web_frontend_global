// https://www.npmjs.com/package/@annexe/number.isnegative
export function isNumber(value: number) {
  return value !== null && !Number.isNaN(value) && Number.isFinite(value);
}
