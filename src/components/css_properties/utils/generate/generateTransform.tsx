export interface TransformAttributes {
  type: string;
  value: string;
}

export function generateTransform(
  transforms: TransformAttributes[],
  isView?: boolean,
): string {
  if (!transforms) return '';
  const separator = isView ? " " : "|";
  return transforms.filter(transform => transform)
    .map((transform) => {
      const { type = "", value = "" } = transform;
      return `${type}(${value})`;
    })
    .join(separator);
}
