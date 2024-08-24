export const Dialog = [
  {
    "description": "The controlled open state of the dialog.",
    "property": "open",
    "type": "boolean"
  },
  {
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "property": "defaultOpen",
    "type": "boolean"
  },
  {
    "description": "Event handler called when the open state of the dialog changes.",
    "property": "onOpenChange",
    "type": "(open: boolean) => void"
  },
  {
    "description": "A unique identifier for the component. The id is used to generate id attributes for nested components. If no id prop is provided, a generated id will be used.",
    "property": "id",
    "type": "string"
  },
  {
    "description": "Whether the dialog should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the dialog content.  - elements outside the dialog content will not be visible for screen readers.",
    "property": "modal",
    "type": "boolean"
  },
  {
    "description": "Whether the scroll should be locked even if the dialog is not modal.",
    "property": "preventScroll",
    "type": "boolean"
  },
  {
    "description": "Used to force mounting the dialog (portal, overlay and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  },
  {
    "description": "Localization strings.",
    "property": "translations",
    "type": "DialogIntlTranslations"
  }
];

export const DialogContent = [
  {
    "description": "Event handler called when focus moves into the component after opening. It can be prevented by calling event.preventDefault.",
    "property": "onOpenAutoFocus",
    "type": "(event: Event) => void"
  },
  {
    "description": "Event handler called when focus moves to the trigger after closing. It can be prevented by calling event.preventDefault.",
    "property": "onCloseAutoFocus",
    "type": "(event: Event) => void"
  },
  {
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "property": "onEscapeKeyDown",
    "type": "(event: KeyboardEvent) => void"
  },
  {
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "property": "onPointerDownOutside",
    "type": "(event: PointerDownOutsideEvent) => void"
  },
  {
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "property": "onFocusOutside",
    "type": "(event: FocusOutsideEvent) => void"
  },
  {
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "property": "onInteractOutside",
    "type": "(event: InteractOutsideEvent) => void"
  }
];