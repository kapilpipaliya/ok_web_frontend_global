
interface BusyIndicatorProps {
  active: boolean;
}
export const BusyIndicator = (props: BusyIndicatorProps) => {
  return <div data-active={props.active} data-size="Medium">Busy Indicator</div>
}