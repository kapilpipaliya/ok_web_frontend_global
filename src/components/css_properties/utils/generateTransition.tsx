export function generateTransition(transitions: Array<{ delay: string; duration: string; property: string; timingFunction: string; }>, isView?: boolean): string {
  const separator = isView ? " " : "|";
  return transitions.map(transition => `${transition.property}${separator}${transition.duration}${separator}${transition.timingFunction}${separator}${transition.delay}`).join(', ');
}
