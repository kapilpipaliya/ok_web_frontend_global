export interface FilterAttributes {
  type: string;
  value: string;
}

export function generateFilter(filters: Array<FilterAttributes>, isView?: boolean): string {
  const separator = isView ? " " : "|";
  return filters.map(filter => {
    const { type = '', value = '' } = filter;
    return `${type}(${value})`;
  }).join(separator);
}