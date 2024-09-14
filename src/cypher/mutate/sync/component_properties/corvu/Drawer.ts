export const Drawer = [
  {
    "componentName": "Size[]",
    "corvu": true,
    "default": "[0, 1]",
    "description": "An array of points to snap to. Can be either percentages of the total drawer height or CSS pixel values.",
    "hashName": "Root",
    "key": "snapPoints"
  },
  {
    "componentName": "[Size | null]",
    "corvu": true,
    "default": "-",
    "description": "Optionally override the default breakpoints between snap points. This list has to be the length of snapPoints.length - 1. Provide null for breakpoints you don't want to override.",
    "hashName": "Root",
    "key": "breakPoints"
  },
  {
    "componentName": "Size",
    "corvu": true,
    "default": "1",
    "description": "The point to snap to when the drawer opens.",
    "hashName": "Root",
    "key": "defaultSnapPoint"
  },
  {
    "componentName": "Size",
    "corvu": true,
    "default": "-",
    "description": "The active snap point.",
    "hashName": "Root",
    "key": "activeSnapPoint"
  },
  {
    "componentName": "(activeSnapPoint: Size) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the active snap point changes.",
    "hashName": "Root",
    "key": "onActiveSnapPointChange"
  },
  {
    "componentName": "Side",
    "corvu": true,
    "default": "'bottom'",
    "description": "The side of the viewport the drawer appears. Is used to properly calculate dragging.",
    "hashName": "Root",
    "key": "side"
  },
  {
    "componentName": "(distance: number) => number",
    "corvu": true,
    "default": "-",
    "description": "Function to create a dampened distance if the user tries to drag the drawer away from the last snap point.",
    "hashName": "Root",
    "key": "dampFunction"
  },
  {
    "componentName": "(distance: number, time: number) => number",
    "corvu": true,
    "default": "-",
    "description": "Function to calculate the velocity when the user stop dragging. This velocity modifier is used to calculate the point the drawer will snap to after release. You can disable velocity by always returning 1",
    "hashName": "Root",
    "key": "velocityFunction"
  },
  {
    "componentName": "number",
    "corvu": true,
    "default": "200",
    "description": "After how many milliseconds the cached distance used for the velocity function should reset.",
    "hashName": "Root",
    "key": "velocityCacheReset"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether the user can skip snap points if the velocity is high enough.",
    "hashName": "Root",
    "key": "allowSkippingSnapPoints"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "corvu drawers have logic to make dragging and scrolling work together. If you don't want this behavior or if you want to implement something yourself, you can disable it with this property.",
    "hashName": "Root",
    "key": "handleScrollableElements"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "false",
    "description": "Whether the drawer should watch for size changes and apply a fixed width/height for transitions.",
    "hashName": "Root",
    "key": "transitionResize"
  }
];