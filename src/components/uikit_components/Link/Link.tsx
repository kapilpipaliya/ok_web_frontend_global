import { setClassNames } from "../set-class-names";
import { LinkProps } from "../globals";

export function Link(props: LinkProps) {
  return (
    <a
      id={props.id}
      style={props.style}
      data-uk-toggle={props.toggleOptions ? props.toggleOptions : null}
      href={props.href}
      classList={{
        [`uk-link-${props.type}`]: !!props.type,
        ...setClassNames(props),
      }}
    >
      {props.children}
    </a>
  );
}
