import { Portal } from 'solid-js/web';

export const RenderIndicator = (props) => {
  const style = {
    position: 'fixed',
    display: 'block',
    opacity: 1,
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'transparent',
    zIndex: 99999,
    ...props.style,
  };

  const indicator = (
    <div style={style}></div>
  );

  // Using SolidJS Portal to render the indicator in a different part of the DOM
  if (props.parentDom && props.parentDom.ownerDocument !== document) {
    return <Portal mount={props.parentDom.ownerDocument.body}>{indicator}</Portal>;
  }

  return indicator;
};
