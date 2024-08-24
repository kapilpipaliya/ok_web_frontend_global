export const DialogRoot = [
  {
    "default": "'dialog'",
    "description": "The role attribute of the dialog element.",
    "property": "role",
    "type": "'dialog' | 'alertdialog'"
  },
  {
    "default": "-",
    "description": "Whether the dialog is open.",
    "property": "open",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "Callback fired when the open state changes.",
    "property": "onOpenChange",
    "type": "(open: boolean) => void"
  },
  {
    "default": "false",
    "description": "Whether the dialog is open initially.",
    "property": "initialOpen",
    "type": "boolean"
  },
  {
    "default": "true",
    "description": "Whether the dialog should be rendered as a modal.",
    "property": "modal",
    "type": "boolean"
  },
  {
    "default": "true",
    "description": "Whether the dialog should close when the user presses the Escape key.",
    "property": "closeOnEscapeKeyDown",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "Callback fired when the user presses the Escape key. Can be prevented by calling event.preventDefault.",
    "property": "onEscapeKeyDown",
    "type": "(event: KeyboardEvent) => void"
  },
  {
    "default": "true if trapFocus is true, false otherwise",
    "description": "Whether the dialog should be closed if a focus event happens outside the bounds of .",
    "property": "closeOnOutsideFocus",
    "type": "boolean"
  },
  {
    "default": "true if modal is true, false otherwise",
    "description": "Whether the dialog should be closed if the user interacts outside the bounds of .",
    "property": "closeOnOutsidePointer",
    "type": "boolean"
  },
  {
    "default": "'pointerup'",
    "description": "Whether closeOnOutsidePointer should be triggered on pointerdown or pointerup.",
    "property": "closeOnOutsidePointerStrategy",
    "type": "'pointerdown' | 'pointerup'"
  },
  {
    "default": "-",
    "description": "Callback fired when a focus event happens outside the bounds of . Can only happen if trapFocus is set to false and can be prevented by calling event.preventDefault.",
    "property": "onOutsideFocus",
    "type": "(event: CustomEvent) => void"
  },
  {
    "default": "-",
    "description": "Callback fired when the user interacts outside the bounds of . Can be prevented by calling event.preventDefault.",
    "property": "onOutsidePointer",
    "type": "(event: PointerEvent) => void"
  },
  {
    "default": "true if modal is true, false otherwise",
    "description": "Whether pointer events outside of  should be disabled.",
    "property": "noOutsidePointerEvents",
    "type": "boolean"
  },
  {
    "default": "true if modal is true, false otherwise",
    "description": "Whether scroll outside of the dialog should be prevented.",
    "property": "preventScroll",
    "type": "boolean"
  },
  {
    "default": "true",
    "description": "Whether the scrollbar of the  element should be hidden. Only applies if preventScroll is true.",
    "property": "hideScrollbar",
    "type": "boolean"
  },
  {
    "default": "true",
    "description": "Whether padding should be added to the  element to avoid layout shift.",
    "property": "preventScrollbarShift",
    "type": "boolean"
  },
  {
    "default": "'padding'",
    "description": "Whether padding or margin should be used to avoid layout shift.",
    "property": "preventScrollbarShiftMode",
    "type": "'padding' | 'margin'"
  },
  {
    "default": "true",
    "description": "Whether to restore the  scroll position with window.scrollTo to avoid possible layout shift after closing the dialog.",
    "property": "restoreScrollPosition",
    "type": "boolean"
  },
  {
    "default": "true",
    "description": "Whether the dialog should allow pinch zoom while scroll is disabled.",
    "property": "allowPinchZoom",
    "type": "boolean"
  },
  {
    "default": "true",
    "description": "Whether the dialog should trap focus.",
    "property": "trapFocus",
    "type": "boolean"
  },
  {
    "default": "true",
    "description": "Whether the dialog should restore focus to the previous active element when it closes.",
    "property": "restoreFocus",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "The element to receive focus when the dialog opens.",
    "property": "initialFocusEl",
    "type": "HTMLElement"
  },
  {
    "default": "-",
    "description": "Callback fired when focus moves into the dialog. Can be prevented by calling event.preventDefault.",
    "property": "onInitialFocus",
    "type": "(event: Event) => void"
  },
  {
    "default": "-",
    "description": "The element to receive focus when the dialog closes.",
    "property": "finalFocusEl",
    "type": "HTMLElement"
  },
  {
    "default": "-",
    "description": "Callback fired when focus moves out of the dialog. Can be prevented by calling event.preventDefault.",
    "property": "onFinalFocus",
    "type": "(event: Event) => void"
  },
  {
    "default": "createUniqueId()",
    "description": "The id attribute of the dialog element.",
    "property": "dialogId",
    "type": "string"
  },
  {
    "default": "createUniqueId()",
    "description": "The id attribute of the dialog label element.",
    "property": "labelId",
    "type": "string"
  },
  {
    "default": "createUniqueId()",
    "description": "The id attribute of the dialog description element.",
    "property": "descriptionId",
    "type": "string"
  },
  {
    "default": "-",
    "description": "The id of the dialog context. Useful if you have nested dialogs and want to create components that belong to a dialog higher up in the tree.",
    "property": "contextId",
    "type": "string"
  }
];

export const DialogTrigger = [
  {
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  },
  {
    "default": "-",
    "description": "The id of the dialog context to use.",
    "property": "contextId",
    "type": "string"
  }
];

export const DialogPortal = [
  {
    "default": "false",
    "description": "Whether the dialog portal should be forced to render. Useful when using third-party animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "The id of the dialog context to use.",
    "property": "contextId",
    "type": "string"
  }
];

export const DialogOverlay = [
  {
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  },
  {
    "default": "false",
    "description": "Whether the dialog overlay should be forced to render. Useful when using third-party animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "The id of the dialog context to use.",
    "property": "contextId",
    "type": "string"
  }
];

export const DialogContent = [
  {
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  },
  {
    "default": "false",
    "description": "Whether the dialog content should be forced to render. Useful when using third-party animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "The id of the dialog context to use.",
    "property": "contextId",
    "type": "string"
  }
];

export const DialogClose = [
  {
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  },
  {
    "default": "-",
    "description": "The id of the dialog context to use.",
    "property": "contextId",
    "type": "string"
  }
];

export const DialogLabel = [
  {
    "default": "h2",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  },
  {
    "default": "-",
    "description": "The id of the dialog context to use.",
    "property": "contextId",
    "type": "string"
  }
];

export const DialogDescription = [
  {
    "default": "p",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  },
  {
    "default": "-",
    "description": "The id of the dialog context to use.",
    "property": "contextId",
    "type": "string"
  }
];