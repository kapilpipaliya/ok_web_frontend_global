export function getDnDBoxShadowArgs(position: null | string, color: string, inset = "inset") {
  const boxShadowProps = {
    'x-offset': "0",
    'y-offset': "0",
    // eslint-disable-next-line perfectionist/sort-objects
    blur: "0",
    spread: "0",
    // eslint-disable-next-line perfectionist/sort-objects
    color: color,
    inset: inset
  };

  switch (position) {
    case "before":
      boxShadowProps['y-offset'] = "8px";
      boxShadowProps.spread = "-6px";
      break;
    case "after":
      boxShadowProps['y-offset'] = "-8px";
      boxShadowProps.spread = "-6px";
      break;
    case "left":
      boxShadowProps['x-offset'] = "8px";
      boxShadowProps.spread = "-6px";
      break;
    case "right":
      boxShadowProps['x-offset'] = "-8px";
      boxShadowProps.spread = "-6px";
      break;
    default:
      boxShadowProps.color = "gray-30";
      boxShadowProps.spread = "2px";
  }

  return boxShadowProps;
}
