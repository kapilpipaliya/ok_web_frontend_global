export function generateBoxShadow(shadows: Array<{ blur: string; color: string; inset?: string; spread: string; 'x-offset': string; 'y-offset': string }>, isView?: boolean): string {
  const separator = isView ? " " : "|";
  return shadows.map(shadow => `${shadow["x-offset"] || '0px'}${separator}${shadow["y-offset"] || '0px'}${separator}${shadow.blur || '0px'}${separator}${shadow.spread || '0px'}${separator}${shadow.color ||""}${shadow.inset ? `${separator}${shadow.inset} ` : ''}`).join(', ');
}
