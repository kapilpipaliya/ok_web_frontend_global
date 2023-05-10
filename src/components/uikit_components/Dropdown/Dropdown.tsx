import { DropdownProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function Dropdown(props: DropdownProps) {
  return (
    <div id={props.id} classList={setClassNames(props)} data-uk-dropdown={props.options ? props.options : ""}>
      {props.children}
    </div>
  );
}
