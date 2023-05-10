import { ButtonProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function Button(props: ButtonProps) {
  const isLink = () => {
    return !!props.href;
  };
  const _setClassNames = (): string => {
    return classNames("uk-button", {
      [`uk-button-default`]: !props.color,
      [`uk-button-${props.color}`]: !!props.color,
      [`uk-button-${props.size}`]: !!props.size,
      ...setClassNames(props),
    });
  };
  return isLink() ? (
    <a
      id={props.id}
      style={props.style}
      data-uk-toggle={props.toggleOptions}
      href={props.href}
      onClick={props.onClick}
      class={_setClassNames()}
    >
      {props.children}
    </a>
  ) : (
    <button
      id={props.id}
      style={props.style}
      data-uk-toggle={props.toggleOptions}
      onClick={props.onClick}
      class={_setClassNames()}
    >
      {props.children}
    </button>
  );
}
