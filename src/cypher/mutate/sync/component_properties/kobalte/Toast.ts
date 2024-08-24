export const ToastRegion = [
  {
    "description": "default: \"Notifications ({hotkey})\"  A label for the toast region to provide context for screen reader users when navigating page landmarks. Can contain a {hotkey} placeholder which will be replaced for you.",
    "property": "aria-label",
    "type": "string"
  },
  {
    "description": "default: alt + T  The keys to use as the keyboard shortcut that will move focus to the toast region. Use event.code value for each key from keycode.info. For meta keys, use ctrlKey, shiftKey, altKey and/or metaKey.",
    "property": "hotkey",
    "type": "string[]"
  },
  {
    "description": "default: 5000  The time in milliseconds that should elapse before automatically closing each toast.",
    "property": "duration",
    "type": "number"
  },
  {
    "description": "default: 3  The maximum amount of toasts that can be displayed at the same time.",
    "property": "limit",
    "type": "number"
  },
  {
    "description": "default: \"right\"  The direction of the pointer swipe that should close the toast.",
    "property": "swipeDirection",
    "type": "\"up\" | \"down\" | \"left\" | \"right\""
  },
  {
    "description": "default: 50  The distance in pixels that the swipe gesture must travel before a close is triggered.",
    "property": "swipeThreshold",
    "type": "number"
  },
  {
    "description": "default: true  Whether the toasts close timeout should pause when a toast is hovered or focused.",
    "property": "pauseOnInteraction",
    "type": "boolean"
  },
  {
    "description": "default: true  Whether the toasts close timeout should pause when the document loses focus or the page is idle (e.g. switching to a new browser tab).",
    "property": "pauseOnPageIdle",
    "type": "boolean"
  },
  {
    "description": "default: true  Whether the toast region is marked as a \"top layer\", so that it:  - is not aria-hidden when opening an overlay.  - allows focus even outside a containing focus scope.  - doesn’t dismiss overlays when clicking on it, even though it is outside.",
    "property": "topLayer",
    "type": "boolean"
  },
  {
    "description": "The custom id of the region used for multiple regions.",
    "property": "regionId",
    "type": "string"
  },
  {
    "description": "Localization strings.",
    "property": "translations",
    "type": "ToastRegionIntlTranslations"
  }
];

export const Toast = [
  {
    "description": "The id of the toast provided by the toaster.",
    "property": "toastId",
    "type": "number"
  },
  {
    "description": "default: \"high\"  Control the sensitivity of the toast for accessibility purposes. For toasts that are the result of a user action, choose high. Toasts generated from background tasks should use low.",
    "property": "priority",
    "type": "\"high\" | \"low\""
  },
  {
    "description": "The time in milliseconds that should elapse before automatically closing the toast. This will override the value supplied to Toast.Region.",
    "property": "duration",
    "type": "number"
  },
  {
    "description": "Whether the toast should ignore duration and disappear only by a user action.",
    "property": "persistent",
    "type": "boolean"
  },
  {
    "description": "Event handler called when the dismiss timer is paused. This occurs when the pointer is moved over the region or the region is focused.",
    "property": "onPause",
    "type": "() => void"
  },
  {
    "description": "Event handler called when the dismiss timer is resumed. This occurs when the pointer is moved away from the region or the region is blurred.",
    "property": "onResume",
    "type": "() => void"
  },
  {
    "description": "Event handler called when starting a swipe interaction.",
    "property": "onSwipeStart",
    "type": "(event: SwipeEvent) => void"
  },
  {
    "description": "Event handler called during a swipe interaction.",
    "property": "onSwipeMove",
    "type": "(event: SwipeEvent) => void"
  },
  {
    "description": "Event handler called when a swipe interaction is cancelled.",
    "property": "onSwipeCancel",
    "type": "(event: SwipeEvent) => void"
  },
  {
    "description": "Event handler called at the end of a swipe interaction.",
    "property": "onSwipeEnd",
    "type": "(event: SwipeEvent) => void"
  },
  {
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "property": "onEscapeKeyDown",
    "type": "(event: KeyboardEvent) => void"
  },
  {
    "description": "Localization strings.",
    "property": "translations",
    "type": "ToastIntlTranslations"
  },
  {
    "description": "The offset position of the toast when horizontally swiping.",
    "property": "--kb-toast-swipe-move-x",
    "type": ""
  },
  {
    "description": "The offset position of the toast when vertically swiping.",
    "property": "--kb-toast-swipe-move-y",
    "type": ""
  },
  {
    "description": "The offset end position of the toast after horizontally swiping.",
    "property": "--kb-toast-swipe-end-x",
    "type": ""
  },
  {
    "description": "The offset end position of the toast after vertically swiping.",
    "property": "--kb-toast-swipe-end-y",
    "type": ""
  }
];