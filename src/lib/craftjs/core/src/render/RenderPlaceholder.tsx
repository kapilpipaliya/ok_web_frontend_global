
import { Component, JSXElement } from 'solid-js';
import { useEditor } from '../hooks';
import { Indicator } from '../interfaces';

export type Placeholder = {
  placeholder: Indicator;
  suggestedStyles: any;
};

export const RenderPlaceholder: Component<
  Placeholder & {children?: JSXElement}
> = (props) => {
  const { indicator } = useEditor((state) => ({
    indicator: state.options.indicator,
  }));

  return (
    <div
      style={{
        position: 'fixed',
        display: 'block',
        opacity: 1,
        borderColor: props.placeholder.error ? indicator.error : indicator.success,
        borderStyle: 'solid',
        borderWidth: '1px',
        zIndex: '99999',
        ...props.suggestedStyles,
      }}
    ></div>
  );
};
