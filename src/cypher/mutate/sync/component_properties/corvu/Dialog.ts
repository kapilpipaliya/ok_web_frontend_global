export const Dialog = [
  {
    "componentName": "'dialog' | 'alertdialog'",
    "default": "'dialog'",
    "description": "The role attribute of the dialog element.",
    "key": "role",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "-",
    "description": "Whether the dialog is open.",
    "key": "open",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(open: boolean) => void",
    "default": "-",
    "description": "Callback fired when the open state changes.",
    "key": "onOpenChange",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the dialog is open initially.",
    "key": "initialOpen",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the dialog should be rendered as a modal.",
    "key": "modal",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the dialog should close when the user presses the Escape key.",
    "key": "closeOnEscapeKeyDown",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(event: KeyboardEvent) => void",
    "default": "-",
    "description": "Callback fired when the user presses the Escape key. Can be prevented by calling event.preventDefault.",
    "key": "onEscapeKeyDown",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true if trapFocus is true, false otherwise",
    "description": "Whether the dialog should be closed if a focus event happens outside the bounds of .",
    "key": "closeOnOutsideFocus",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true if modal is true, false otherwise",
    "description": "Whether the dialog should be closed if the user interacts outside the bounds of .",
    "key": "closeOnOutsidePointer",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "'pointerdown' | 'pointerup'",
    "default": "'pointerup'",
    "description": "Whether closeOnOutsidePointer should be triggered on pointerdown or pointerup.",
    "key": "closeOnOutsidePointerStrategy",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(event: CustomEvent) => void",
    "default": "-",
    "description": "Callback fired when a focus event happens outside the bounds of . Can only happen if trapFocus is set to false and can be prevented by calling event.preventDefault.",
    "key": "onOutsideFocus",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(event: PointerEvent) => void",
    "default": "-",
    "description": "Callback fired when the user interacts outside the bounds of . Can be prevented by calling event.preventDefault.",
    "key": "onOutsidePointer",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true if modal is true, false otherwise",
    "description": "Whether pointer events outside of  should be disabled.",
    "key": "noOutsidePointerEvents",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true if modal is true, false otherwise",
    "description": "Whether scroll outside of the dialog should be prevented.",
    "key": "preventScroll",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the scrollbar of the  element should be hidden. Only applies if preventScroll is true.",
    "key": "hideScrollbar",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether padding should be added to the  element to avoid layout shift.",
    "key": "preventScrollbarShift",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "'padding' | 'margin'",
    "default": "'padding'",
    "description": "Whether padding or margin should be used to avoid layout shift.",
    "key": "preventScrollbarShiftMode",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether to restore the  scroll position with window.scrollTo to avoid possible layout shift after closing the dialog.",
    "key": "restoreScrollPosition",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the dialog should allow pinch zoom while scroll is disabled.",
    "key": "allowPinchZoom",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the dialog should trap focus.",
    "key": "trapFocus",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the dialog should restore focus to the previous active element when it closes.",
    "key": "restoreFocus",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "HTMLElement",
    "default": "-",
    "description": "The element to receive focus when the dialog opens.",
    "key": "initialFocusEl",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(event: Event) => void",
    "default": "-",
    "description": "Callback fired when focus moves into the dialog. Can be prevented by calling event.preventDefault.",
    "key": "onInitialFocus",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "HTMLElement",
    "default": "-",
    "description": "The element to receive focus when the dialog closes.",
    "key": "finalFocusEl",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(event: Event) => void",
    "default": "-",
    "description": "Callback fired when focus moves out of the dialog. Can be prevented by calling event.preventDefault.",
    "key": "onFinalFocus",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "string",
    "default": "createUniqueId()",
    "description": "The id attribute of the dialog element.",
    "key": "dialogId",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "string",
    "default": "createUniqueId()",
    "description": "The id attribute of the dialog label element.",
    "key": "labelId",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "string",
    "default": "createUniqueId()",
    "description": "The id attribute of the dialog description element.",
    "key": "descriptionId",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the dialog context. Useful if you have nested dialogs and want to create components that belong to a dialog higher up in the tree.",
    "key": "contextId",
    "corvu": true,
    "hashName": "Root"
  }
];

export const DialogTrigger = [
  {
    "componentName": "ValidComponent",
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "key": "as",
    "corvu": true,
    "hashName": "Trigger"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the dialog context to use.",
    "key": "contextId",
    "corvu": true,
    "hashName": "Trigger"
  }
];

export const DialogPortal = [
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the dialog portal should be forced to render. Useful when using third-party animation libraries.",
    "key": "forceMount",
    "corvu": true,
    "hashName": "Portal"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the dialog context to use.",
    "key": "contextId",
    "corvu": true,
    "hashName": "Portal"
  }
];

export const DialogOverlay = [
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "key": "as",
    "corvu": true,
    "hashName": "Overlay"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the dialog overlay should be forced to render. Useful when using third-party animation libraries.",
    "key": "forceMount",
    "corvu": true,
    "hashName": "Overlay"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the dialog context to use.",
    "key": "contextId",
    "corvu": true,
    "hashName": "Overlay"
  }
];

export const DialogContent = [
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "key": "as",
    "corvu": true,
    "hashName": "Content"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the dialog content should be forced to render. Useful when using third-party animation libraries.",
    "key": "forceMount",
    "corvu": true,
    "hashName": "Content"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the dialog context to use.",
    "key": "contextId",
    "corvu": true,
    "hashName": "Content"
  }
];

export const DialogClose = [
  {
    "componentName": "ValidComponent",
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "key": "as",
    "corvu": true,
    "hashName": "Close"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the dialog context to use.",
    "key": "contextId",
    "corvu": true,
    "hashName": "Close"
  }
];

export const DialogLabel = [
  {
    "componentName": "ValidComponent",
    "default": "h2",
    "description": "Component to render the dynamic component as.",
    "key": "as",
    "corvu": true,
    "hashName": "Label"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the dialog context to use.",
    "key": "contextId",
    "corvu": true,
    "hashName": "Label"
  }
];

export const DialogDescription = [
  {
    "componentName": "ValidComponent",
    "default": "p",
    "description": "Component to render the dynamic component as.",
    "key": "as",
    "corvu": true,
    "hashName": "Description"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the dialog context to use.",
    "key": "contextId",
    "corvu": true,
    "hashName": "Description"
  }
];