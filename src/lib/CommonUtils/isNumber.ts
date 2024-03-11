// ts-belt
export function isNumber(i: any) {
  if ("number" == typeof i) {
    return !Number.isNaN(i);
  } else {
    return !1;
  }
}
