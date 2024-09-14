export const AlertDialog = [
  {
    "componentName": "boolean",
    "description": "The controlled open state of the dialog.",
    "hashName": "alertdialog",
    "key": "open",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "hashName": "alertdialog",
    "key": "defaultOpen",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the dialog changes.",
    "hashName": "alertdialog",
    "key": "onOpenChange",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "A unique identifier for the component. The id is used to generate id attributes for nested components. If no id prop is provided, a generated id will be used.",
    "hashName": "alertdialog",
    "key": "id",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the dialog should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the dialog content.  - elements outside the dialog content will not be visible for screen readers.",
    "hashName": "alertdialog",
    "key": "modal",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the scroll should be locked even if the alert dialog is not modal.",
    "hashName": "alertdialog",
    "key": "preventScroll",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the dialog (portal, overlay and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "alertdialog",
    "key": "forceMount",
    "kobalte": true
  }
];

export const AlertDialogContent = [
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves into the component after opening. It can be prevented by calling event.preventDefault.",
    "hashName": "alertdialogcontent",
    "key": "onOpenAutoFocus",
    "kobalte": true
  },
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves to the trigger after closing. It can be prevented by calling event.preventDefault.",
    "hashName": "alertdialogcontent",
    "key": "onCloseAutoFocus",
    "kobalte": true
  },
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "hashName": "alertdialogcontent",
    "key": "onEscapeKeyDown",
    "kobalte": true
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "alertdialogcontent",
    "key": "onPointerDownOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "alertdialogcontent",
    "key": "onFocusOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "alertdialogcontent",
    "key": "onInteractOutside",
    "kobalte": true
  }
];