export const Dialog = [
  {
    "componentName": "'dialog' | 'alertdialog'",
    "default": "'dialog'",
    "description": "The role attribute of the dialog element.",
    "property": "role"
  },
  {
    "componentName": "boolean",
    "default": "-",
    "description": "Whether the dialog is open.",
    "property": "open"
  },
  {
    "componentName": "(open: boolean) => void",
    "default": "-",
    "description": "Callback fired when the open state changes.",
    "property": "onOpenChange"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the dialog is open initially.",
    "property": "initialOpen"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the dialog should be rendered as a modal.",
    "property": "modal"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the dialog should close when the user presses the Escape key.",
    "property": "closeOnEscapeKeyDown"
  },
  {
    "componentName": "(event: KeyboardEvent) => void",
    "default": "-",
    "description": "Callback fired when the user presses the Escape key. Can be prevented by calling event.preventDefault.",
    "property": "onEscapeKeyDown"
  },
  {
    "componentName": "boolean",
    "default": "true if trapFocus is true, false otherwise",
    "description": "Whether the dialog should be closed if a focus event happens outside the bounds of .",
    "property": "closeOnOutsideFocus"
  },
  {
    "componentName": "boolean",
    "default": "true if modal is true, false otherwise",
    "description": "Whether the dialog should be closed if the user interacts outside the bounds of .",
    "property": "closeOnOutsidePointer"
  },
  {
    "componentName": "'pointerdown' | 'pointerup'",
    "default": "'pointerup'",
    "description": "Whether closeOnOutsidePointer should be triggered on pointerdown or pointerup.",
    "property": "closeOnOutsidePointerStrategy"
  },
  {
    "componentName": "(event: CustomEvent) => void",
    "default": "-",
    "description": "Callback fired when a focus event happens outside the bounds of . Can only happen if trapFocus is set to false and can be prevented by calling event.preventDefault.",
    "property": "onOutsideFocus"
  },
  {
    "componentName": "(event: PointerEvent) => void",
    "default": "-",
    "description": "Callback fired when the user interacts outside the bounds of . Can be prevented by calling event.preventDefault.",
    "property": "onOutsidePointer"
  },
  {
    "componentName": "boolean",
    "default": "true if modal is true, false otherwise",
    "description": "Whether pointer events outside of  should be disabled.",
    "property": "noOutsidePointerEvents"
  },
  {
    "componentName": "boolean",
    "default": "true if modal is true, false otherwise",
    "description": "Whether scroll outside of the dialog should be prevented.",
    "property": "preventScroll"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the scrollbar of the  element should be hidden. Only applies if preventScroll is true.",
    "property": "hideScrollbar"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether padding should be added to the  element to avoid layout shift.",
    "property": "preventScrollbarShift"
  },
  {
    "componentName": "'padding' | 'margin'",
    "default": "'padding'",
    "description": "Whether padding or margin should be used to avoid layout shift.",
    "property": "preventScrollbarShiftMode"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether to restore the  scroll position with window.scrollTo to avoid possible layout shift after closing the dialog.",
    "property": "restoreScrollPosition"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the dialog should allow pinch zoom while scroll is disabled.",
    "property": "allowPinchZoom"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the dialog should trap focus.",
    "property": "trapFocus"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the dialog should restore focus to the previous active element when it closes.",
    "property": "restoreFocus"
  },
  {
    "componentName": "HTMLElement",
    "default": "-",
    "description": "The element to receive focus when the dialog opens.",
    "property": "initialFocusEl"
  },
  {
    "componentName": "(event: Event) => void",
    "default": "-",
    "description": "Callback fired when focus moves into the dialog. Can be prevented by calling event.preventDefault.",
    "property": "onInitialFocus"
  },
  {
    "componentName": "HTMLElement",
    "default": "-",
    "description": "The element to receive focus when the dialog closes.",
    "property": "finalFocusEl"
  },
  {
    "componentName": "(event: Event) => void",
    "default": "-",
    "description": "Callback fired when focus moves out of the dialog. Can be prevented by calling event.preventDefault.",
    "property": "onFinalFocus"
  },
  {
    "componentName": "string",
    "default": "createUniqueId()",
    "description": "The id attribute of the dialog element.",
    "property": "dialogId"
  },
  {
    "componentName": "string",
    "default": "createUniqueId()",
    "description": "The id attribute of the dialog label element.",
    "property": "labelId"
  },
  {
    "componentName": "string",
    "default": "createUniqueId()",
    "description": "The id attribute of the dialog description element.",
    "property": "descriptionId"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the dialog context. Useful if you have nested dialogs and want to create components that belong to a dialog higher up in the tree.",
    "property": "contextId"
  }
];

export const DialogTrigger = [
  {
    "componentName": "ValidComponent",
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "property": "as"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the dialog context to use.",
    "property": "contextId"
  }
];

export const DialogPortal = [
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the dialog portal should be forced to render. Useful when using third-party animation libraries.",
    "property": "forceMount"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the dialog context to use.",
    "property": "contextId"
  }
];

export const DialogOverlay = [
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the dialog overlay should be forced to render. Useful when using third-party animation libraries.",
    "property": "forceMount"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the dialog context to use.",
    "property": "contextId"
  }
];

export const DialogContent = [
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the dialog content should be forced to render. Useful when using third-party animation libraries.",
    "property": "forceMount"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the dialog context to use.",
    "property": "contextId"
  }
];

export const DialogClose = [
  {
    "componentName": "ValidComponent",
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "property": "as"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the dialog context to use.",
    "property": "contextId"
  }
];

export const DialogLabel = [
  {
    "componentName": "ValidComponent",
    "default": "h2",
    "description": "Component to render the dynamic component as.",
    "property": "as"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the dialog context to use.",
    "property": "contextId"
  }
];

export const DialogDescription = [
  {
    "componentName": "ValidComponent",
    "default": "p",
    "description": "Component to render the dynamic component as.",
    "property": "as"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the dialog context to use.",
    "property": "contextId"
  }
];