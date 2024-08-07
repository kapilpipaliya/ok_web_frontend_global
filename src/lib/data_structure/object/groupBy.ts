export function groupBy(
  xs: { [key: string]: any }[],
  groupFn: (record: { [key: string]: any }) => string,
) {
  return xs.reduce((acc, element) => {
    const key = groupFn(element);
    const value = acc[key];
    if (value !== void 0) {
      value.push(element);
    } else {
      acc[key] = [element];
    }
    return acc;
  }, {});
}
