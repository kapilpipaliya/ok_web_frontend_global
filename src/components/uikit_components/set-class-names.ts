
export function setClassNames(props: any) {
  return {
    [`${props.class}`]: props.class,
    [`uk-align-${props.align}`]: props.align,
    [`uk-height-${props.height}`]: props.height,
    [`uk-width-${props.width}`]: props.width,
    [`uk-background-${props.background}`]: props.background,
    [`uk-position-${props.position}`]: props.position,
  }
}
