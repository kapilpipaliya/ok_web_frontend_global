export interface ShadowAttributes {
  blur: string;
  color?: string;
  inset?: string;
  spread: string;
  'offset-x': string;
  'offset-y': string;
}
export function generateBoxShadow(
  shadows: Array<ShadowAttributes>,
  isView?: boolean
): string {
  const separator = isView ? " " : "|";
  const separator2 = isView ? ", " : ",";

  return shadows
    .map(shadow => {
      const {
        blur = '0px',
        color = '',
        inset = '',
        spread = '0px',
        'offset-x': xOffset = '0px',
        'offset-y': yOffset = '0px'
      } = shadow;

      const colorPart = color ? `${separator}${color}` : '';
      const insetPart = inset ? `${separator}${inset}` : '';

      return `${xOffset}${separator}${yOffset}${separator}${blur}${separator}${spread}${colorPart}${insetPart}`;
    })
    .join(separator2);
}
