function canScroll(container: HTMLElement): boolean {
  return container.scrollHeight > container.clientHeight + 1;
}

function resolveScrollContainer(
  preferredContainer: HTMLElement,
): HTMLElement {
  if (canScroll(preferredContainer)) {
    return preferredContainer;
  }

  let current: HTMLElement | null = preferredContainer.parentElement;
  while (current) {
    if (canScroll(current)) {
      return current;
    }
    if (current === document.body || current === document.documentElement) {
      break;
    }
    current = current.parentElement;
  }

  return preferredContainer;
}

export function scrollElementIntoContainer(
  element: HTMLElement,
  container: HTMLElement,
  options?: { behavior?: ScrollBehavior; block?: "nearest" | "start" | "end" },
): void {
  const behavior = options?.behavior ?? "auto";
  const block = options?.block ?? "nearest";
  const scrollContainer = resolveScrollContainer(container);

  const elementRect = element.getBoundingClientRect();
  const containerRect = scrollContainer.getBoundingClientRect();

  const elementTop =
    elementRect.top - containerRect.top + scrollContainer.scrollTop;
  const elementBottom = elementTop + elementRect.height;
  const containerHeight = scrollContainer.clientHeight;
  const maxScrollTop = Math.max(
    0,
    scrollContainer.scrollHeight - containerHeight,
  );

  let newScrollTop = scrollContainer.scrollTop;

  if (block === "start") {
    newScrollTop = elementTop;
  } else if (block === "end") {
    newScrollTop = elementBottom - containerHeight;
  } else if (block === "nearest") {
    const visibleTop = scrollContainer.scrollTop;
    const visibleBottom = visibleTop + containerHeight;

    if (elementTop < visibleTop) {
      newScrollTop = elementTop;
    } else if (elementBottom > visibleBottom) {
      newScrollTop = elementBottom - containerHeight;
    }
  }

  newScrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop));

  if (Math.abs(newScrollTop - scrollContainer.scrollTop) > 1) {
    scrollContainer.scrollTo({ top: newScrollTop, behavior });
  }
}
