import { setClassNames } from "../set-class-names";
import { IconProps } from "../globals";

export function Icon(props: IconProps) {
  const renderIconType = () => {
    if (props.href) {
      return (
        <a
          id={props.id}
          style={props.style}
          classList={{
            [`uk-icon`]: true,
            [`uk-icon-button`]: props.button,
            [`uk-icon-link`]: !!props.href,
            [`uk-icon-image`]: !!props.image,
            ...setClassNames(props),
          }}
          href={props.href}
          data-uk-icon={props.options}
        />
      );
    }

    if (props.image) {
      return (
        <span
          id={props.id}
          classList={{
            [`uk-icon`]: true,
            [`uk-icon-button`]: props.button,
            [`uk-icon-link`]: !!props.href,
            [`uk-icon-image`]: !!props.image,
            ...setClassNames(props),
          }}
          style={{
            backgroundImage: `url(${props.image})`,
            // @ts-ignore
            ...props.style,
          }}
          data-uk-icon={props.options}
        />
      );
    }

    return (
      <em
        id={props.id}
        style={props.style}
        classList={{
          [`uk-icon`]: true,
          [`uk-icon-button`]: props.button,
          [`uk-icon-link`]: !!props.href,
          [`uk-icon-image`]: !!props.image,
          ...setClassNames(props),
        }}
        data-uk-icon={props.options}
      />
    );
  };

  return renderIconType();
}
