export interface TransformAttributes {
  type: string;
  value: string;
}

export function generateTransform(transforms: Array<TransformAttributes>, isView?: boolean): string {
  const separator = isView ? " " : "|";
  return transforms.map(transform => {
    const { type = '', value = '' } = transform;
    return `${type}(${value})`;
  }).join(separator);
}
