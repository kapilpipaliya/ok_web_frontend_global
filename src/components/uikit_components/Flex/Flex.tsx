import { FlexProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function Flex(props: FlexProps) {
  const alignments = () => (props.alignment ? props.alignment.split(" ") : []);
  return (
    <div
      id={props.id}
      style={props.style}
      classList={{
        "uk-flex": true,
        [`uk-flex-${alignments()[0]}`]: !!alignments()[0],
        [`uk-flex-${alignments()[1]}`]: !!alignments()[1],
        [`uk-flex-${props.direction}`]: !!props.direction,
        [`uk-flex-${props.wrap}`]: !!props.wrap,
        ...setClassNames(props),
      }}
    >
      {props.children}
    </div>
  );
}
