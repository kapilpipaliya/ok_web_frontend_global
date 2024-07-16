export function generateBoxShadow(
  shadows: Array<{
    blur: string;
    color?: string;
    inset?: string;
    spread: string;
    'x-offset': string;
    'y-offset': string;
  }>,
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
        'x-offset': xOffset = '0px',
        'y-offset': yOffset = '0px'
      } = shadow;

      const colorPart = color ? `${separator}${color}` : '';
      const insetPart = inset ? `${separator}${inset}` : '';

      return `${xOffset}${separator}${yOffset}${separator}${blur}${separator}${spread}${colorPart}${insetPart}`;
    })
    .join(separator2);
}
