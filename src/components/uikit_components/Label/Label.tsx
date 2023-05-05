import {LabelProps} from "../globals";
import {splitProps} from "solid-js";

export function Label(props: LabelProps) {

  const [selectedProps, customProps] = splitProps(props.meta.properties.props as LabelProps, ['color'])

  return (
    <div
      {...customProps}
      classList={{
          'uk-label': true,
          [`uk-label-${selectedProps.color}`]: !!selectedProps.color,
      }}
    >
      {props.data.properties[props.meta.properties.id]}
    </div>
  );
}
