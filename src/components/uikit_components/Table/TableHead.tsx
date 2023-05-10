import { setClassNames } from "../set-class-names";
import { TableHeadProps } from "../globals";

export function TableHead(props: TableHeadProps) {
  return (
    <thead id={props.id} style={props.style} classList={setClassNames(props)}>
      {props.children}
    </thead>
  );
}
