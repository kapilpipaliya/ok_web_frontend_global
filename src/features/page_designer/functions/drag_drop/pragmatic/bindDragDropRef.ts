type DragDropCleanup = () => void;

const CLEANUP_KEY = "__pageDesignerDragDropCleanup";
const ATTACH_KEY = "__pageDesignerDragDropAttachKey";

type DragDropElement = HTMLElement & {
  [CLEANUP_KEY]?: DragDropCleanup;
  [ATTACH_KEY]?: string;
};

export function bindDragDropRef<T extends HTMLElement>(
  attachKey: string,
  attach: (element: T) => DragDropCleanup,
): (element: T | undefined) => void {
  return (element) => {
    if (!element) {
      return;
    }

    const target = element as DragDropElement;

    if (target[ATTACH_KEY] === attachKey) {
      return;
    }

    target[CLEANUP_KEY]?.();

    target[CLEANUP_KEY] = attach(element);
    target[ATTACH_KEY] = attachKey;
  };
}

export function cleanupDragDropRef(element: HTMLElement | undefined) {
  if (!element) {
    return;
  }

  const target = element as DragDropElement;
  target[CLEANUP_KEY]?.();
  delete target[CLEANUP_KEY];
  delete target[ATTACH_KEY];
}
