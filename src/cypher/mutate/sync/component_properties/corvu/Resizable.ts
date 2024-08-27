export const Resizable = [
  {
    "componentName": "'horizontal' | 'vertical'",
    "default": "'horizontal'",
    "description": "The orientation of the resizable.",
    "name": "orientation",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "number[]",
    "default": "-",
    "description": "Panel sizes in percentage.",
    "name": "sizes",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(sizes: number[]) => void",
    "default": "-",
    "description": "Callback fired when the panel sizes change.",
    "name": "onSizesChange",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "Size[]",
    "default": "-",
    "description": "Initial panel sizes. Gets overridden by the initialSize prop on  components.",
    "name": "initialSizes",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "Size",
    "default": "0.1",
    "description": "The delta to use when resizing with arrow keys.",
    "name": "keyboardDelta",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether to handle the cursor style when resizing.",
    "name": "handleCursorStyle",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "name": "as",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the resizable context to use.",
    "name": "contextId",
    "corvu": true,
    "hashName": "Root"
  }
];

export const ResizablePanel = [
  {
    "componentName": "Size",
    "default": "-",
    "description": "The initial size of the panel. If the panel is rendered on the server, this should be a percentage to avoid layout shifts.",
    "name": "initialSize",
    "corvu": true,
    "hashName": "Panel"
  },
  {
    "componentName": "Size",
    "default": "0",
    "description": "The minimum size of the panel.",
    "name": "minSize",
    "corvu": true,
    "hashName": "Panel"
  },
  {
    "componentName": "Size",
    "default": "1",
    "description": "The maximum size of the panel.",
    "name": "maxSize",
    "corvu": true,
    "hashName": "Panel"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the panel is collapsible.",
    "name": "collapsible",
    "corvu": true,
    "hashName": "Panel"
  },
  {
    "componentName": "Size",
    "default": "0",
    "description": "The size the panel should collapse to.",
    "name": "collapsedSize",
    "corvu": true,
    "hashName": "Panel"
  },
  {
    "componentName": "Size",
    "default": "0.05",
    "description": "How much the user has to \"overdrag\" for the panel to collapse.",
    "name": "collapseThreshold",
    "corvu": true,
    "hashName": "Panel"
  },
  {
    "componentName": "(size: number) => void",
    "default": "-",
    "description": "Callback fired when the panel is resized.",
    "name": "onResize",
    "corvu": true,
    "hashName": "Panel"
  },
  {
    "componentName": "(size: number) => void",
    "default": "-",
    "description": "Callback fired when the panel is collapsed.",
    "name": "onCollapse",
    "corvu": true,
    "hashName": "Panel"
  },
  {
    "componentName": "(size: number) => void",
    "default": "-",
    "description": "Callback fired when the panel is expanded.",
    "name": "onExpand",
    "corvu": true,
    "hashName": "Panel"
  },
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "name": "as",
    "corvu": true,
    "hashName": "Panel"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the resizable context to use.",
    "name": "contextId",
    "corvu": true,
    "hashName": "Panel"
  },
  {
    "componentName": "string",
    "default": "createUniqueId()",
    "description": "The id attribute of the resizable panel element.",
    "name": "panelId",
    "corvu": true,
    "hashName": "Panel"
  }
];

export const ResizableHandle = [
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the handle is allowed to intersect with another handle at its start (Left/Top of the handle)",
    "name": "startIntersection",
    "corvu": true,
    "hashName": "Handle"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the handle is allowed to intersect with another handle at its end (Right/Bottom of the handle)",
    "name": "endIntersection",
    "corvu": true,
    "hashName": "Handle"
  },
  {
    "componentName": "boolean | 'only'",
    "default": "true",
    "description": "Whether Alt key resize mode is enabled. Set to 'only' to make it the default  and only way to resize.",
    "name": "altKey",
    "corvu": true,
    "hashName": "Handle"
  },
  {
    "componentName": "(event: PointerEvent) => void",
    "default": "-",
    "description": "Callback fired when the handle starts being dragged. Can be prevented by calling event.preventDefault.",
    "name": "onHandleDragStart",
    "corvu": true,
    "hashName": "Handle"
  },
  {
    "componentName": "(event: CustomEvent) => void",
    "default": "-",
    "description": "Callback fired when the handle is being dragged. Can be prevented by calling event.preventDefault.",
    "name": "onHandleDrag",
    "corvu": true,
    "hashName": "Handle"
  },
  {
    "componentName": "(event: PointerEvent | TouchEvent | MouseEvent) => void",
    "default": "-",
    "description": "Callback fired when the handle stops being dragged.",
    "name": "onHandleDragEnd",
    "corvu": true,
    "hashName": "Handle"
  },
  {
    "componentName": "ValidComponent",
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "name": "as",
    "corvu": true,
    "hashName": "Handle"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the resizable context to use.",
    "name": "contextId",
    "corvu": true,
    "hashName": "Handle"
  }
];