export const Drawer = [
  {
    "componentName": "Size[]",
    "default": "[0, 1]",
    "description": "An array of points to snap to. Can be either percentages of the total drawer height or CSS pixel values.",
    "key": "snapPoints",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "[Size | null]",
    "default": "-",
    "description": "Optionally override the default breakpoints between snap points. This list has to be the length of snapPoints.length - 1. Provide null for breakpoints you don't want to override.",
    "key": "breakPoints",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "Size",
    "default": "1",
    "description": "The point to snap to when the drawer opens.",
    "key": "defaultSnapPoint",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "Size",
    "default": "-",
    "description": "The active snap point.",
    "key": "activeSnapPoint",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(activeSnapPoint: Size) => void",
    "default": "-",
    "description": "Callback fired when the active snap point changes.",
    "key": "onActiveSnapPointChange",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "Side",
    "default": "'bottom'",
    "description": "The side of the viewport the drawer appears. Is used to properly calculate dragging.",
    "key": "side",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(distance: number) => number",
    "default": "-",
    "description": "Function to create a dampened distance if the user tries to drag the drawer away from the last snap point.",
    "key": "dampFunction",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(distance: number, time: number) => number",
    "default": "-",
    "description": "Function to calculate the velocity when the user stop dragging. This velocity modifier is used to calculate the point the drawer will snap to after release. You can disable velocity by always returning 1",
    "key": "velocityFunction",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "number",
    "default": "200",
    "description": "After how many milliseconds the cached distance used for the velocity function should reset.",
    "key": "velocityCacheReset",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the user can skip snap points if the velocity is high enough.",
    "key": "allowSkippingSnapPoints",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "corvu drawers have logic to make dragging and scrolling work together. If you don't want this behavior or if you want to implement something yourself, you can disable it with this property.",
    "key": "handleScrollableElements",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the drawer should watch for size changes and apply a fixed width/height for transitions.",
    "key": "transitionResize",
    "corvu": true,
    "hashName": "Root"
  }
];