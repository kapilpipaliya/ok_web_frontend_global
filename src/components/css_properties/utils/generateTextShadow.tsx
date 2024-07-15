export function generateTextShadow(shadows: Array<{ blurRadius: string; color: string; offsetX: string; offsetY: string; }>, isView: boolean): string {
  const separator = isView ? " " : "|";
  return shadows.map(shadow => `${shadow.offsetX}${separator}${shadow.offsetY}${separator}${shadow.blurRadius}${separator}${shadow.color}`).join(', ');
}
