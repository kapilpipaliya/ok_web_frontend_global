export const ToastRegion = [
  {
    "componentName": "string",
    "description": "default: \"Notifications ({hotkey})\"  A label for the toast region to provide context for screen reader users when navigating page landmarks. Can contain a {hotkey} placeholder which will be replaced for you.",
    "property": "aria-label"
  },
  {
    "componentName": "string[]",
    "description": "default: alt + T  The keys to use as the keyboard shortcut that will move focus to the toast region. Use event.code value for each key from keycode.info. For meta keys, use ctrlKey, shiftKey, altKey and/or metaKey.",
    "property": "hotkey"
  },
  {
    "componentName": "number",
    "description": "default: 5000  The time in milliseconds that should elapse before automatically closing each toast.",
    "property": "duration"
  },
  {
    "componentName": "number",
    "description": "default: 3  The maximum amount of toasts that can be displayed at the same time.",
    "property": "limit"
  },
  {
    "componentName": "\"up\" | \"down\" | \"left\" | \"right\"",
    "description": "default: \"right\"  The direction of the pointer swipe that should close the toast.",
    "property": "swipeDirection"
  },
  {
    "componentName": "number",
    "description": "default: 50  The distance in pixels that the swipe gesture must travel before a close is triggered.",
    "property": "swipeThreshold"
  },
  {
    "componentName": "boolean",
    "description": "default: true  Whether the toasts close timeout should pause when a toast is hovered or focused.",
    "property": "pauseOnInteraction"
  },
  {
    "componentName": "boolean",
    "description": "default: true  Whether the toasts close timeout should pause when the document loses focus or the page is idle (e.g. switching to a new browser tab).",
    "property": "pauseOnPageIdle"
  },
  {
    "componentName": "boolean",
    "description": "default: true  Whether the toast region is marked as a \"top layer\", so that it:  - is not aria-hidden when opening an overlay.  - allows focus even outside a containing focus scope.  - doesn’t dismiss overlays when clicking on it, even though it is outside.",
    "property": "topLayer"
  },
  {
    "componentName": "string",
    "description": "The custom id of the region used for multiple regions.",
    "property": "regionId"
  },
  {
    "componentName": "ToastRegionIntlTranslations",
    "description": "Localization strings.",
    "property": "translations"
  }
];

export const Toast = [
  {
    "componentName": "number",
    "description": "The id of the toast provided by the toaster.",
    "property": "toastId"
  },
  {
    "componentName": "\"high\" | \"low\"",
    "description": "default: \"high\"  Control the sensitivity of the toast for accessibility purposes. For toasts that are the result of a user action, choose high. Toasts generated from background tasks should use low.",
    "property": "priority"
  },
  {
    "componentName": "number",
    "description": "The time in milliseconds that should elapse before automatically closing the toast. This will override the value supplied to Toast.Region.",
    "property": "duration"
  },
  {
    "componentName": "boolean",
    "description": "Whether the toast should ignore duration and disappear only by a user action.",
    "property": "persistent"
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the dismiss timer is paused. This occurs when the pointer is moved over the region or the region is focused.",
    "property": "onPause"
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the dismiss timer is resumed. This occurs when the pointer is moved away from the region or the region is blurred.",
    "property": "onResume"
  },
  {
    "componentName": "(event: SwipeEvent) => void",
    "description": "Event handler called when starting a swipe interaction.",
    "property": "onSwipeStart"
  },
  {
    "componentName": "(event: SwipeEvent) => void",
    "description": "Event handler called during a swipe interaction.",
    "property": "onSwipeMove"
  },
  {
    "componentName": "(event: SwipeEvent) => void",
    "description": "Event handler called when a swipe interaction is cancelled.",
    "property": "onSwipeCancel"
  },
  {
    "componentName": "(event: SwipeEvent) => void",
    "description": "Event handler called at the end of a swipe interaction.",
    "property": "onSwipeEnd"
  },
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "property": "onEscapeKeyDown"
  },
  {
    "componentName": "ToastIntlTranslations",
    "description": "Localization strings.",
    "property": "translations"
  },
  {
    "componentName": "",
    "description": "The offset position of the toast when horizontally swiping.",
    "property": "--kb-toast-swipe-move-x"
  },
  {
    "componentName": "",
    "description": "The offset position of the toast when vertically swiping.",
    "property": "--kb-toast-swipe-move-y"
  },
  {
    "componentName": "",
    "description": "The offset end position of the toast after horizontally swiping.",
    "property": "--kb-toast-swipe-end-x"
  },
  {
    "componentName": "",
    "description": "The offset end position of the toast after vertically swiping.",
    "property": "--kb-toast-swipe-end-y"
  }
];