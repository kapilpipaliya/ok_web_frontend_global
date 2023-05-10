import { MarginProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function Margin(props: MarginProps) {
  const _setClassNames = () => {
    const stringArray = props.type.split("; ");
    let classString: string;

    stringArray.map((string, idx) => {
      classString = `${classString} uk-margin-${string}`;
    });

    return {
      classString: true,
      ...setClassNames(props),
    };
  };

  return (
    <div id={props.id} style={props.style} data-uk-margin={props.dynamicWrapping} classList={_setClassNames()}>
      {props.children}
    </div>
  );
}
