import { BaseContainerProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function TableFoot(props: BaseContainerProps) {
  return (
    <tfoot id={props.id} style={props.style} classList={setClassNames(props)}>
      {props.children}
    </tfoot>
  );
}
