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
  const offsetY = e.clientY - bounds.top;
  const offsetX = e.clientX - bounds.left;
  const height = bounds.bottom - bounds.top;
  const width = bounds.right - bounds.left;

  if (offsetY < height * 0.25) {
    return "before";
  }
  if (offsetY > height * 0.75) {
    return "after";
  }
  if (offsetX < width * 0.25) {
    return "left";
  }
  if (offsetX > width * 0.75) {
    return "right";
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

