import { BaseContainerProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function TableRow(props: BaseContainerProps) {
  return (
    <tr id={props.id} style={props.style} classList={setClassNames(props)}>
      {props.children}
    </tr>
  );
}
