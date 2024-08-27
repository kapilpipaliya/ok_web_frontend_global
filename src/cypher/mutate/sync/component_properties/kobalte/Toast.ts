export const ToastRegion = [
  {
    "componentName": "string",
    "description": "default: \"Notifications ({hotkey})\"  A label for the toast region to provide context for screen reader users when navigating page landmarks. Can contain a {hotkey} placeholder which will be replaced for you.",
    "name": "aria-label",
    "hashName": "toastregion",
    "kobalte": true
  },
  {
    "componentName": "string[]",
    "description": "default: alt + T  The keys to use as the keyboard shortcut that will move focus to the toast region. Use event.code value for each key from keycode.info. For meta keys, use ctrlKey, shiftKey, altKey and/or metaKey.",
    "name": "hotkey",
    "hashName": "toastregion",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "default: 5000  The time in milliseconds that should elapse before automatically closing each toast.",
    "name": "duration",
    "hashName": "toastregion",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "default: 3  The maximum amount of toasts that can be displayed at the same time.",
    "name": "limit",
    "hashName": "toastregion",
    "kobalte": true
  },
  {
    "componentName": "\"up\" | \"down\" | \"left\" | \"right\"",
    "description": "default: \"right\"  The direction of the pointer swipe that should close the toast.",
    "name": "swipeDirection",
    "hashName": "toastregion",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "default: 50  The distance in pixels that the swipe gesture must travel before a close is triggered.",
    "name": "swipeThreshold",
    "hashName": "toastregion",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "default: true  Whether the toasts close timeout should pause when a toast is hovered or focused.",
    "name": "pauseOnInteraction",
    "hashName": "toastregion",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "default: true  Whether the toasts close timeout should pause when the document loses focus or the page is idle (e.g. switching to a new browser tab).",
    "name": "pauseOnPageIdle",
    "hashName": "toastregion",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "default: true  Whether the toast region is marked as a \"top layer\", so that it:  - is not aria-hidden when opening an overlay.  - allows focus even outside a containing focus scope.  - doesn’t dismiss overlays when clicking on it, even though it is outside.",
    "name": "topLayer",
    "hashName": "toastregion",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The custom id of the region used for multiple regions.",
    "name": "regionId",
    "hashName": "toastregion",
    "kobalte": true
  },
  {
    "componentName": "ToastRegionIntlTranslations",
    "description": "Localization strings.",
    "name": "translations",
    "hashName": "toastregion",
    "kobalte": true
  }
];

export const Toast = [
  {
    "componentName": "number",
    "description": "The id of the toast provided by the toaster.",
    "name": "toastId",
    "hashName": "toast-1",
    "kobalte": true
  },
  {
    "componentName": "\"high\" | \"low\"",
    "description": "default: \"high\"  Control the sensitivity of the toast for accessibility purposes. For toasts that are the result of a user action, choose high. Toasts generated from background tasks should use low.",
    "name": "priority",
    "hashName": "toast-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The time in milliseconds that should elapse before automatically closing the toast. This will override the value supplied to Toast.Region.",
    "name": "duration",
    "hashName": "toast-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the toast should ignore duration and disappear only by a user action.",
    "name": "persistent",
    "hashName": "toast-1",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the dismiss timer is paused. This occurs when the pointer is moved over the region or the region is focused.",
    "name": "onPause",
    "hashName": "toast-1",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the dismiss timer is resumed. This occurs when the pointer is moved away from the region or the region is blurred.",
    "name": "onResume",
    "hashName": "toast-1",
    "kobalte": true
  },
  {
    "componentName": "(event: SwipeEvent) => void",
    "description": "Event handler called when starting a swipe interaction.",
    "name": "onSwipeStart",
    "hashName": "toast-1",
    "kobalte": true
  },
  {
    "componentName": "(event: SwipeEvent) => void",
    "description": "Event handler called during a swipe interaction.",
    "name": "onSwipeMove",
    "hashName": "toast-1",
    "kobalte": true
  },
  {
    "componentName": "(event: SwipeEvent) => void",
    "description": "Event handler called when a swipe interaction is cancelled.",
    "name": "onSwipeCancel",
    "hashName": "toast-1",
    "kobalte": true
  },
  {
    "componentName": "(event: SwipeEvent) => void",
    "description": "Event handler called at the end of a swipe interaction.",
    "name": "onSwipeEnd",
    "hashName": "toast-1",
    "kobalte": true
  },
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "name": "onEscapeKeyDown",
    "hashName": "toast-1",
    "kobalte": true
  },
  {
    "componentName": "ToastIntlTranslations",
    "description": "Localization strings.",
    "name": "translations",
    "hashName": "toast-1",
    "kobalte": true
  },
  {
    "componentName": "",
    "description": "The offset position of the toast when horizontally swiping.",
    "name": "--kb-toast-swipe-move-x",
    "hashName": "toast-1",
    "kobalte": true
  },
  {
    "componentName": "",
    "description": "The offset position of the toast when vertically swiping.",
    "name": "--kb-toast-swipe-move-y",
    "hashName": "toast-1",
    "kobalte": true
  },
  {
    "componentName": "",
    "description": "The offset end position of the toast after horizontally swiping.",
    "name": "--kb-toast-swipe-end-x",
    "hashName": "toast-1",
    "kobalte": true
  },
  {
    "componentName": "",
    "description": "The offset end position of the toast after vertically swiping.",
    "name": "--kb-toast-swipe-end-y",
    "hashName": "toast-1",
    "kobalte": true
  }
];