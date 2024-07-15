export function generateTransform(transforms: Array<{ type: string; value: string; }>, isView?: boolean): string {
  const separator = isView ? " " : "|";
  return transforms.map(transform => `${transform.type}(${transform.value})`).join(separator);
}
