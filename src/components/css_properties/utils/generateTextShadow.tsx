export interface TextShadowAttributes {
  blurRadius: string;
  color: string;
  offsetX: string;
  offsetY: string;
}
export function generateTextShadow(shadows: Array<TextShadowAttributes>, isView?: boolean): string {
  const separator = isView ? " " : "|";
  return shadows.map(shadow => `${shadow.offsetX}${separator}${shadow.offsetY}${separator}${shadow.blurRadius}${separator}${shadow.color}`).join(', ');
}
