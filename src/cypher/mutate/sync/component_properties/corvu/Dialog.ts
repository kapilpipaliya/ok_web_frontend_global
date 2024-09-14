export const Dialog = [
  {
    "componentName": "'dialog' | 'alertdialog'",
    "corvu": true,
    "default": "'dialog'",
    "description": "The role attribute of the dialog element.",
    "hashName": "Root",
    "key": "role"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "-",
    "description": "Whether the dialog is open.",
    "hashName": "Root",
    "key": "open"
  },
  {
    "componentName": "(open: boolean) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the open state changes.",
    "hashName": "Root",
    "key": "onOpenChange"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "false",
    "description": "Whether the dialog is open initially.",
    "hashName": "Root",
    "key": "initialOpen"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether the dialog should be rendered as a modal.",
    "hashName": "Root",
    "key": "modal"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether the dialog should close when the user presses the Escape key.",
    "hashName": "Root",
    "key": "closeOnEscapeKeyDown"
  },
  {
    "componentName": "(event: KeyboardEvent) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the user presses the Escape key. Can be prevented by calling event.preventDefault.",
    "hashName": "Root",
    "key": "onEscapeKeyDown"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true if trapFocus is true, false otherwise",
    "description": "Whether the dialog should be closed if a focus event happens outside the bounds of .",
    "hashName": "Root",
    "key": "closeOnOutsideFocus"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true if modal is true, false otherwise",
    "description": "Whether the dialog should be closed if the user interacts outside the bounds of .",
    "hashName": "Root",
    "key": "closeOnOutsidePointer"
  },
  {
    "componentName": "'pointerdown' | 'pointerup'",
    "corvu": true,
    "default": "'pointerup'",
    "description": "Whether closeOnOutsidePointer should be triggered on pointerdown or pointerup.",
    "hashName": "Root",
    "key": "closeOnOutsidePointerStrategy"
  },
  {
    "componentName": "(event: CustomEvent) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when a focus event happens outside the bounds of . Can only happen if trapFocus is set to false and can be prevented by calling event.preventDefault.",
    "hashName": "Root",
    "key": "onOutsideFocus"
  },
  {
    "componentName": "(event: PointerEvent) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the user interacts outside the bounds of . Can be prevented by calling event.preventDefault.",
    "hashName": "Root",
    "key": "onOutsidePointer"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true if modal is true, false otherwise",
    "description": "Whether pointer events outside of  should be disabled.",
    "hashName": "Root",
    "key": "noOutsidePointerEvents"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true if modal is true, false otherwise",
    "description": "Whether scroll outside of the dialog should be prevented.",
    "hashName": "Root",
    "key": "preventScroll"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether the scrollbar of the  element should be hidden. Only applies if preventScroll is true.",
    "hashName": "Root",
    "key": "hideScrollbar"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether padding should be added to the  element to avoid layout shift.",
    "hashName": "Root",
    "key": "preventScrollbarShift"
  },
  {
    "componentName": "'padding' | 'margin'",
    "corvu": true,
    "default": "'padding'",
    "description": "Whether padding or margin should be used to avoid layout shift.",
    "hashName": "Root",
    "key": "preventScrollbarShiftMode"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether to restore the  scroll position with window.scrollTo to avoid possible layout shift after closing the dialog.",
    "hashName": "Root",
    "key": "restoreScrollPosition"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether the dialog should allow pinch zoom while scroll is disabled.",
    "hashName": "Root",
    "key": "allowPinchZoom"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether the dialog should trap focus.",
    "hashName": "Root",
    "key": "trapFocus"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether the dialog should restore focus to the previous active element when it closes.",
    "hashName": "Root",
    "key": "restoreFocus"
  },
  {
    "componentName": "HTMLElement",
    "corvu": true,
    "default": "-",
    "description": "The element to receive focus when the dialog opens.",
    "hashName": "Root",
    "key": "initialFocusEl"
  },
  {
    "componentName": "(event: Event) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when focus moves into the dialog. Can be prevented by calling event.preventDefault.",
    "hashName": "Root",
    "key": "onInitialFocus"
  },
  {
    "componentName": "HTMLElement",
    "corvu": true,
    "default": "-",
    "description": "The element to receive focus when the dialog closes.",
    "hashName": "Root",
    "key": "finalFocusEl"
  },
  {
    "componentName": "(event: Event) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when focus moves out of the dialog. Can be prevented by calling event.preventDefault.",
    "hashName": "Root",
    "key": "onFinalFocus"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "createUniqueId()",
    "description": "The id attribute of the dialog element.",
    "hashName": "Root",
    "key": "dialogId"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "createUniqueId()",
    "description": "The id attribute of the dialog label element.",
    "hashName": "Root",
    "key": "labelId"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "createUniqueId()",
    "description": "The id attribute of the dialog description element.",
    "hashName": "Root",
    "key": "descriptionId"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the dialog context. Useful if you have nested dialogs and want to create components that belong to a dialog higher up in the tree.",
    "hashName": "Root",
    "key": "contextId"
  }
];

export const DialogTrigger = [
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "hashName": "Trigger",
    "key": "as"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the dialog context to use.",
    "hashName": "Trigger",
    "key": "contextId"
  }
];

export const DialogPortal = [
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "false",
    "description": "Whether the dialog portal should be forced to render. Useful when using third-party animation libraries.",
    "hashName": "Portal",
    "key": "forceMount"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the dialog context to use.",
    "hashName": "Portal",
    "key": "contextId"
  }
];

export const DialogOverlay = [
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "hashName": "Overlay",
    "key": "as"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "false",
    "description": "Whether the dialog overlay should be forced to render. Useful when using third-party animation libraries.",
    "hashName": "Overlay",
    "key": "forceMount"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the dialog context to use.",
    "hashName": "Overlay",
    "key": "contextId"
  }
];

export const DialogContent = [
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "hashName": "Content",
    "key": "as"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "false",
    "description": "Whether the dialog content should be forced to render. Useful when using third-party animation libraries.",
    "hashName": "Content",
    "key": "forceMount"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the dialog context to use.",
    "hashName": "Content",
    "key": "contextId"
  }
];

export const DialogClose = [
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "hashName": "Close",
    "key": "as"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the dialog context to use.",
    "hashName": "Close",
    "key": "contextId"
  }
];

export const DialogLabel = [
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "h2",
    "description": "Component to render the dynamic component as.",
    "hashName": "Label",
    "key": "as"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the dialog context to use.",
    "hashName": "Label",
    "key": "contextId"
  }
];

export const DialogDescription = [
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "p",
    "description": "Component to render the dynamic component as.",
    "hashName": "Description",
    "key": "as"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the dialog context to use.",
    "hashName": "Description",
    "key": "contextId"
  }
];