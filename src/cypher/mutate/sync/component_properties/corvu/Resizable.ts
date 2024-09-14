export const Resizable = [
  {
    "componentName": "'horizontal' | 'vertical'",
    "corvu": true,
    "default": "'horizontal'",
    "description": "The orientation of the resizable.",
    "hashName": "Root",
    "key": "orientation"
  },
  {
    "componentName": "number[]",
    "corvu": true,
    "default": "-",
    "description": "Panel sizes in percentage.",
    "hashName": "Root",
    "key": "sizes"
  },
  {
    "componentName": "(sizes: number[]) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the panel sizes change.",
    "hashName": "Root",
    "key": "onSizesChange"
  },
  {
    "componentName": "Size[]",
    "corvu": true,
    "default": "-",
    "description": "Initial panel sizes. Gets overridden by the initialSize prop on  components.",
    "hashName": "Root",
    "key": "initialSizes"
  },
  {
    "componentName": "Size",
    "corvu": true,
    "default": "0.1",
    "description": "The delta to use when resizing with arrow keys.",
    "hashName": "Root",
    "key": "keyboardDelta"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether to handle the cursor style when resizing.",
    "hashName": "Root",
    "key": "handleCursorStyle"
  },
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "hashName": "Root",
    "key": "as"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the resizable context to use.",
    "hashName": "Root",
    "key": "contextId"
  }
];

export const ResizablePanel = [
  {
    "componentName": "Size",
    "corvu": true,
    "default": "-",
    "description": "The initial size of the panel. If the panel is rendered on the server, this should be a percentage to avoid layout shifts.",
    "hashName": "Panel",
    "key": "initialSize"
  },
  {
    "componentName": "Size",
    "corvu": true,
    "default": "0",
    "description": "The minimum size of the panel.",
    "hashName": "Panel",
    "key": "minSize"
  },
  {
    "componentName": "Size",
    "corvu": true,
    "default": "1",
    "description": "The maximum size of the panel.",
    "hashName": "Panel",
    "key": "maxSize"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "false",
    "description": "Whether the panel is collapsible.",
    "hashName": "Panel",
    "key": "collapsible"
  },
  {
    "componentName": "Size",
    "corvu": true,
    "default": "0",
    "description": "The size the panel should collapse to.",
    "hashName": "Panel",
    "key": "collapsedSize"
  },
  {
    "componentName": "Size",
    "corvu": true,
    "default": "0.05",
    "description": "How much the user has to \"overdrag\" for the panel to collapse.",
    "hashName": "Panel",
    "key": "collapseThreshold"
  },
  {
    "componentName": "(size: number) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the panel is resized.",
    "hashName": "Panel",
    "key": "onResize"
  },
  {
    "componentName": "(size: number) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the panel is collapsed.",
    "hashName": "Panel",
    "key": "onCollapse"
  },
  {
    "componentName": "(size: number) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the panel is expanded.",
    "hashName": "Panel",
    "key": "onExpand"
  },
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "hashName": "Panel",
    "key": "as"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the resizable context to use.",
    "hashName": "Panel",
    "key": "contextId"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "createUniqueId()",
    "description": "The id attribute of the resizable panel element.",
    "hashName": "Panel",
    "key": "panelId"
  }
];

export const ResizableHandle = [
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether the handle is allowed to intersect with another handle at its start (Left/Top of the handle)",
    "hashName": "Handle",
    "key": "startIntersection"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether the handle is allowed to intersect with another handle at its end (Right/Bottom of the handle)",
    "hashName": "Handle",
    "key": "endIntersection"
  },
  {
    "componentName": "boolean | 'only'",
    "corvu": true,
    "default": "true",
    "description": "Whether Alt key resize mode is enabled. Set to 'only' to make it the default  and only way to resize.",
    "hashName": "Handle",
    "key": "altKey"
  },
  {
    "componentName": "(event: PointerEvent) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the handle starts being dragged. Can be prevented by calling event.preventDefault.",
    "hashName": "Handle",
    "key": "onHandleDragStart"
  },
  {
    "componentName": "(event: CustomEvent) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the handle is being dragged. Can be prevented by calling event.preventDefault.",
    "hashName": "Handle",
    "key": "onHandleDrag"
  },
  {
    "componentName": "(event: PointerEvent | TouchEvent | MouseEvent) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the handle stops being dragged.",
    "hashName": "Handle",
    "key": "onHandleDragEnd"
  },
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "hashName": "Handle",
    "key": "as"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the resizable context to use.",
    "hashName": "Handle",
    "key": "contextId"
  }
];