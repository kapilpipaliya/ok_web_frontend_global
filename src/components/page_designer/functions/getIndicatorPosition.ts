/* eslint-disable perfectionist/sort-objects */

export function getBoundingRect(node: HTMLElement): DOMRect {
  // Get bounding rectangles of the direct children elements
  const elementDirectChildrens = Array.from(node.children);
  const rectangles = elementDirectChildrens
    .filter(element => element)
    .map(element => element.getBoundingClientRect());

  // If there are no child rectangles, use the node's bounding rectangle
  if (rectangles.length === 0) {
    return node.getBoundingClientRect();
  } else {
    const getMaxProperty = (property: keyof DOMRect) => Math.max(...rectangles.map(rect => rect[property]));
    const getMinProperty = (property: keyof DOMRect) => Math.min(...rectangles.map(rect => rect[property]));

    return {
      top: getMinProperty('top'),
      right: getMaxProperty('right'),
      bottom: getMaxProperty('bottom'),
      left: getMinProperty('left'),
      width: getMaxProperty('right') - getMinProperty('left'),
      height: getMaxProperty('bottom') - getMinProperty('top'),
      x: getMinProperty('left'),
      y: getMinProperty('top'),
      toJSON: () => ({})
    } as DOMRect;
  }
}

export function getIndicatorPosition(e: MouseEvent, node: HTMLElement) {
  const bounds = getBoundingRect(node);

  // Calculate the offset and dimensions
  const offsetY = e.clientY - bounds.top;
  const offsetX = e.clientX - bounds.left;
  const height = bounds.bottom - bounds.top;
  const width = bounds.right - bounds.left;

  // Determine the position based on offsets
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
}
