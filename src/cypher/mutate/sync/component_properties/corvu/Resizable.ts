export const Resizable = [
  {
    "componentName": "'horizontal' | 'vertical'",
    "default": "'horizontal'",
    "description": "The orientation of the resizable.",
    "property": "orientation"
  },
  {
    "componentName": "number[]",
    "default": "-",
    "description": "Panel sizes in percentage.",
    "property": "sizes"
  },
  {
    "componentName": "(sizes: number[]) => void",
    "default": "-",
    "description": "Callback fired when the panel sizes change.",
    "property": "onSizesChange"
  },
  {
    "componentName": "Size[]",
    "default": "-",
    "description": "Initial panel sizes. Gets overridden by the initialSize prop on  components.",
    "property": "initialSizes"
  },
  {
    "componentName": "Size",
    "default": "0.1",
    "description": "The delta to use when resizing with arrow keys.",
    "property": "keyboardDelta"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether to handle the cursor style when resizing.",
    "property": "handleCursorStyle"
  },
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the resizable context to use.",
    "property": "contextId"
  }
];

export const ResizablePanel = [
  {
    "componentName": "Size",
    "default": "-",
    "description": "The initial size of the panel. If the panel is rendered on the server, this should be a percentage to avoid layout shifts.",
    "property": "initialSize"
  },
  {
    "componentName": "Size",
    "default": "0",
    "description": "The minimum size of the panel.",
    "property": "minSize"
  },
  {
    "componentName": "Size",
    "default": "1",
    "description": "The maximum size of the panel.",
    "property": "maxSize"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the panel is collapsible.",
    "property": "collapsible"
  },
  {
    "componentName": "Size",
    "default": "0",
    "description": "The size the panel should collapse to.",
    "property": "collapsedSize"
  },
  {
    "componentName": "Size",
    "default": "0.05",
    "description": "How much the user has to \"overdrag\" for the panel to collapse.",
    "property": "collapseThreshold"
  },
  {
    "componentName": "(size: number) => void",
    "default": "-",
    "description": "Callback fired when the panel is resized.",
    "property": "onResize"
  },
  {
    "componentName": "(size: number) => void",
    "default": "-",
    "description": "Callback fired when the panel is collapsed.",
    "property": "onCollapse"
  },
  {
    "componentName": "(size: number) => void",
    "default": "-",
    "description": "Callback fired when the panel is expanded.",
    "property": "onExpand"
  },
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the resizable context to use.",
    "property": "contextId"
  },
  {
    "componentName": "string",
    "default": "createUniqueId()",
    "description": "The id attribute of the resizable panel element.",
    "property": "panelId"
  }
];

export const ResizableHandle = [
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the handle is allowed to intersect with another handle at its start (Left/Top of the handle)",
    "property": "startIntersection"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the handle is allowed to intersect with another handle at its end (Right/Bottom of the handle)",
    "property": "endIntersection"
  },
  {
    "componentName": "boolean | 'only'",
    "default": "true",
    "description": "Whether Alt key resize mode is enabled. Set to 'only' to make it the default  and only way to resize.",
    "property": "altKey"
  },
  {
    "componentName": "(event: PointerEvent) => void",
    "default": "-",
    "description": "Callback fired when the handle starts being dragged. Can be prevented by calling event.preventDefault.",
    "property": "onHandleDragStart"
  },
  {
    "componentName": "(event: CustomEvent) => void",
    "default": "-",
    "description": "Callback fired when the handle is being dragged. Can be prevented by calling event.preventDefault.",
    "property": "onHandleDrag"
  },
  {
    "componentName": "(event: PointerEvent | TouchEvent | MouseEvent) => void",
    "default": "-",
    "description": "Callback fired when the handle stops being dragged.",
    "property": "onHandleDragEnd"
  },
  {
    "componentName": "ValidComponent",
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "property": "as"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the resizable context to use.",
    "property": "contextId"
  }
];