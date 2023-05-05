import {PanelProps} from "../globals";
import {setClassNames} from "../set-class-names";


export function Panel(props: PanelProps) {

  return (
    <div
      id={props.id}
      style={props.style}
   classList={{
     'uk-panel': true,
     [`uk-panel-scrollable`]: props.isScrollable,
     ...setClassNames(props)
   }}
    >
      {props.children}
    </div>
  );
}
