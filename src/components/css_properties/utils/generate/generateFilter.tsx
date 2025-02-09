export interface FilterAttributes {
  type: string;
  value: string;
}

export function generateFilter(
  filters: FilterAttributes[],
  isView?: boolean,
): string {
  if (!filters) {
    return "";
  }
  const separator = isView ? " " : "|";
  return filters
    .filter((filter) => filter)
    .map((filter) => {
      const { type = "", value = "" } = filter;
      return `${type}(${value})`;
    })
    .join(separator);
}
