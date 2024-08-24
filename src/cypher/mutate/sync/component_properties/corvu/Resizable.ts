export const ResizableRoot = [
  {
    "default": "'horizontal'",
    "description": "The orientation of the resizable.",
    "property": "orientation",
    "type": "'horizontal' | 'vertical'"
  },
  {
    "default": "-",
    "description": "Panel sizes in percentage.",
    "property": "sizes",
    "type": "number[]"
  },
  {
    "default": "-",
    "description": "Callback fired when the panel sizes change.",
    "property": "onSizesChange",
    "type": "(sizes: number[]) => void"
  },
  {
    "default": "-",
    "description": "Initial panel sizes. Gets overridden by the initialSize prop on  components.",
    "property": "initialSizes",
    "type": "Size[]"
  },
  {
    "default": "0.1",
    "description": "The delta to use when resizing with arrow keys.",
    "property": "keyboardDelta",
    "type": "Size"
  },
  {
    "default": "true",
    "description": "Whether to handle the cursor style when resizing.",
    "property": "handleCursorStyle",
    "type": "boolean"
  },
  {
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  },
  {
    "default": "-",
    "description": "The id of the resizable context to use.",
    "property": "contextId",
    "type": "string"
  }
];

export const ResizablePanel = [
  {
    "default": "-",
    "description": "The initial size of the panel. If the panel is rendered on the server, this should be a percentage to avoid layout shifts.",
    "property": "initialSize",
    "type": "Size"
  },
  {
    "default": "0",
    "description": "The minimum size of the panel.",
    "property": "minSize",
    "type": "Size"
  },
  {
    "default": "1",
    "description": "The maximum size of the panel.",
    "property": "maxSize",
    "type": "Size"
  },
  {
    "default": "false",
    "description": "Whether the panel is collapsible.",
    "property": "collapsible",
    "type": "boolean"
  },
  {
    "default": "0",
    "description": "The size the panel should collapse to.",
    "property": "collapsedSize",
    "type": "Size"
  },
  {
    "default": "0.05",
    "description": "How much the user has to \"overdrag\" for the panel to collapse.",
    "property": "collapseThreshold",
    "type": "Size"
  },
  {
    "default": "-",
    "description": "Callback fired when the panel is resized.",
    "property": "onResize",
    "type": "(size: number) => void"
  },
  {
    "default": "-",
    "description": "Callback fired when the panel is collapsed.",
    "property": "onCollapse",
    "type": "(size: number) => void"
  },
  {
    "default": "-",
    "description": "Callback fired when the panel is expanded.",
    "property": "onExpand",
    "type": "(size: number) => void"
  },
  {
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  },
  {
    "default": "-",
    "description": "The id of the resizable context to use.",
    "property": "contextId",
    "type": "string"
  },
  {
    "default": "createUniqueId()",
    "description": "The id attribute of the resizable panel element.",
    "property": "panelId",
    "type": "string"
  }
];

export const ResizableHandle = [
  {
    "default": "true",
    "description": "Whether the handle is allowed to intersect with another handle at its start (Left/Top of the handle)",
    "property": "startIntersection",
    "type": "boolean"
  },
  {
    "default": "true",
    "description": "Whether the handle is allowed to intersect with another handle at its end (Right/Bottom of the handle)",
    "property": "endIntersection",
    "type": "boolean"
  },
  {
    "default": "true",
    "description": "Whether Alt key resize mode is enabled. Set to 'only' to make it the default  and only way to resize.",
    "property": "altKey",
    "type": "boolean | 'only'"
  },
  {
    "default": "-",
    "description": "Callback fired when the handle starts being dragged. Can be prevented by calling event.preventDefault.",
    "property": "onHandleDragStart",
    "type": "(event: PointerEvent) => void"
  },
  {
    "default": "-",
    "description": "Callback fired when the handle is being dragged. Can be prevented by calling event.preventDefault.",
    "property": "onHandleDrag",
    "type": "(event: CustomEvent) => void"
  },
  {
    "default": "-",
    "description": "Callback fired when the handle stops being dragged.",
    "property": "onHandleDragEnd",
    "type": "(event: PointerEvent | TouchEvent | MouseEvent) => void"
  },
  {
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  },
  {
    "default": "-",
    "description": "The id of the resizable context to use.",
    "property": "contextId",
    "type": "string"
  }
];