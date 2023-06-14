import { ButtonProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function Button(props: ButtonProps) {
  const isLink = () => {
    return !!props.href;
  };
  return isLink() ? (
    <a
      id={props.id}
      style={props.style}
      data-uk-toggle={props.toggleOptions}
      href={props.href}
      onClick={props.onClick}
      classList={{
        "uk-button": true,
        [`uk-button-default`]: !props.color,
        [`uk-button-${props.color}`]: !!props.color,
        [`uk-button-${props.size}`]: !!props.size,
        ...setClassNames(props),
      }}
    >
      {props.children}
    </a>
  ) : (
    <button
      id={props.id}
      style={props.style}
      data-uk-toggle={props.toggleOptions}
      onClick={props.onClick}
      classList={{
        "uk-button": true,
        [`uk-button-default`]: !props.color,
        [`uk-button-${props.color}`]: !!props.color,
        [`uk-button-${props.size}`]: !!props.size,
        ...setClassNames(props),
      }}
    >
      {props.children}
    </button>
  );
}
