
export interface TransitionAttributes {
  delay: string;
  duration: string;
  property: string;
  timingFunction: string;
}

export function generateTransition(transitions: Array<TransitionAttributes>, isView?: boolean): string {
  const separator = isView ? " " : "|";
  const separator2 = isView ? ", " : ",";

  return transitions.map(transition => {
    const {
      delay = '0s',
      duration = '0s',
      property = 'all',
      timingFunction = 'ease'
    } = transition;

    return `${property}${separator}${duration}${separator}${timingFunction}${separator}${delay}`;
  }).join(separator2);
}