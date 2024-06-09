export function getIndicatorPosition(e: MouseEvent, node: HTMLElement) {
  let bounds: DOMRect;
  // for page designer canvas use the first element in `.contents` class
  if (node.classList.contains("contents")) {
    if (node.lastElementChild) {
      bounds = node.lastElementChild.getBoundingClientRect();
    } else {
      return undefined;
    }
  } else {
    bounds = node.getBoundingClientRect();
  }
  const offset = e.clientY - bounds.top;
  const height = bounds.bottom - bounds.top;
  if (offset < height * 0.25) {
    return "before";
  }
  if (offset > height * 0.75) {
    return "after";
  }
  return "center";
  // if (offset < (height + 10)) {
  //  return 'before';
  // } else if (offset > (height - 10)) {
  //  return 'after';
  // } else {
  //  return 'center';
  // }
}
