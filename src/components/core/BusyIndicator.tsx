
interface BusyIndicatorProps {
  active: boolean;
}
export const BusyIndicator = (props: BusyIndicatorProps) => {
  return <ui5-busy-indicator active={props.active} size="Medium"></ui5-busy-indicator>
}