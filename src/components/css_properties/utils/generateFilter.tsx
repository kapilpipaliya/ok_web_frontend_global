export function generateFilter(filters: Array<{ type: string; value: string; }>, isView?: boolean): string {
  const separator = isView ? " " : "|";
  return filters.map(filter => `${filter.type}(${filter.value})`).join(separator);
}
