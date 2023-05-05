import {ImageProps} from "../globals";


export function Image(props: ImageProps) {
  // @ts-ignore
  return (
    <img
      id={props.id}
      class={props.className}
      width={props.width}
      height={props.height}
      style={props.style}
      data-src={props.src}
      data-uk-img={props.options ? props.options : ''}
    />
  );
}
