import { createSignal } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { StyleCSSComponents } from "~/components/css-editor/StyleCSSComponents";
import {
 sizeTypes,
 timesTypes
} from "~/components/css-editor/cssEditorContext";

const { IconifyIcon } = StyleCSSComponents();
const AllSVGIcon = () => (
  <svg
    viewBox="0 0 24 24"
    role="presentation"
    style="width: 20px; height: 20px;"
  >
    <path d="M3,21V3H21V21H3M5,5V19H19V5H5Z" style="fill: currentcolor;"></path>
  </svg>
);
const CustomSVGIcon = () => (
  <svg
    viewBox="0 0 24 24"
    role="presentation"
    style="width: 20px; height: 20px;"
  >
    <path
      d="M15,21H17V19H15M19,21H21V19H19M7,21H9V19H7M11,21H13V19H11M19,17H21V15H19M19,13H21V11H19M3,3V21H5V5H21V3M19,9H21V7H19"
      style="fill: currentcolor;"
    ></path>
  </svg>
);

const Icons = {
  visibility: {
    yes: "solar:eye-broken",
    no: "ant-design:eye-invisible-outlined",
  },
  flex: {
    auto: "mi:close",
    expand: "gravity-ui:chevrons-expand-horizontal",
    collapse: "gravity-ui:chevrons-collapse-horizontal",
  },
  direction: {
    horizontal: "majesticons:arrow-right-line",
    horizontalReverse: "majesticons:arrow-left-line",
    vertical: "majesticons:arrow-down-line",
    verticalReverse: "majesticons:arrow-up-line",
  },
  justify: {
    start: "solar:align-left-outline",
    center: "solar:align-horizontal-center-outline",
    end: "solar:align-right-outline",
    spaceBetween: "material-symbols:align-space-between",
    spaceAround: "material-symbols:align-space-around-rounded",

    spaceEvenly: "material-symbols:align-justify-space-even-rounded",
  },
  align: {
    stretch: "material-symbols:align-items-stretch-rounded",
    start: "material-symbols:align-start-rounded",
    center: "material-symbols:align-center-rounded",
    end: "material-symbols:align-end-rounded",
  },
};

const GeneralSection = {
  visibility: {
    component: "toggleButton",
    label: "Visibility",
    name: "visibility",
    options: [
      { key: Icons.visibility.yes, value: "visible" },
      { key: Icons.visibility.no, value: "hidden" },
    ],
  },
};

const LayoutSection = {
  display: {
    name: "display",
    label: "Display",
    component: "select",
    options: ["block", "inline", "inline block", "flex", "none"],
  },
  direction: {
    name: "flex-direction",
    label: "Direction",
    component: "buttonGroups",
    isLabelOnTop: true,
    options: [
      { key: Icons.direction.horizontal, value: "row" },
      { key: Icons.direction.horizontalReverse, value: "row-reverse" },
      { key: Icons.direction.vertical, value: "column" },
      { key: Icons.direction.verticalReverse, value: "column-reverse" },
    ],
  },
  justify: {
    name: "justify-content",
    label: "Justify",
    component: "buttonGroups",
    isLabelOnTop: true,
    options: [
      { key: Icons.justify.start, value: "start" },
      { key: Icons.justify.center, value: "center" },
      { key: Icons.justify.end, value: "end" },
      { key: Icons.justify.spaceAround, value: "space-around" },
      { key: Icons.justify.spaceBetween, value: "space-between" },
      { key: Icons.justify.spaceEvenly, value: "space-evenly" },
    ],
  },
  alignFlex: {
    name: "align-items",
    label: "Align",
    component: "buttonGroups",
    isLabelOnTop: true,
    options: [
      {
        key: "material-symbols:align-start-rounded",
        value: "flex-start",
      },
      {
        key: "material-symbols:align-center-rounded",
        value: "center",
      },
      {
        key: "material-symbols:align-end-rounded",
        value: "flex-end",
      },
      {
        key: "material-symbols:align-items-stretch-rounded",
        value: "stretch",
      },
    ],
  },
  gap: {
    name: "gap",
    type: "number",
    isLabelOnTop: true,
    label: "Gap",
    gridType: "repeat(2,auto)",
    customProperty: [
      { label: "Column", name: "gap-x" },
      { label: "Row", name: "gap-y" },
    ],
    mainFieldType: "textFieldOptions",
    component: "fieldWithCustomProperty",
    options: sizeTypes,
  },
  flexWrap: {
    name: "flex-wrap",
    label: "Flex wrap",
    component: "select",
    options: [
      { label: "No Wrap", value: "nowrap" },
      { label: "Wrap", value: "wrap" },
      { label: "Reverse Wrap", value: "wrap-reverse" },
    ],
  },
  divider4: {
    title: "Flex Child",
    component: "divider",
  },
  flex: {
    name: "flex",
    label: "Flex",
    component: "buttonGroups",
    isLabelOnTop: true,
    options: [
      {
        key: "mi:close",
        value: "0 0 auto",
        tooltip: "auto",
      },
      { key: Icons.flex.expand, value: "1 1 0%", tooltip: "expand" },
      { key: Icons.flex.collapse, value: "0 1 auto", tooltip: "collapse" },
      { key: <CustomSVGIcon />, value: "custom", tooltip: "custom" },
    ],
  },
  alignSelf: {
    name: "align-self",
    label: "Align",
    component: "buttonGroups",
    isLabelOnTop: true,
    options: [
      { key: Icons.flex.auto, value: "auto" },
      { key: Icons.align.start, value: "flex-start" },
      { key: Icons.align.center, value: "center" },
      { key: Icons.align.end, value: "flex-end" },
      { key: Icons.align.stretch, value: "stretch" },
    ],
  },
  order: {
    name: "order",
    label: "Order",
    type: "number",
    component: "textFieldOptions",
    leftIcon: (
      <button
        style={{ border: "none", background: "transparent", cursor: "pointer" }}
      >
        <Icon icon="gg:scroll-v" style={{ color: "grey" }} />
      </button>
    ),
  },
};

const SizeSection = {
  size: {
    name: "size Grid",
    padding: "5px",
    gap: "5px 10px",
    component: "grid",
    "grid-template-columns": "repeat(2, auto)",
    children: [
      {
        name: "height",
        type: "number",
        isLabelOnTop: true,
        label: "Height",
        component: "textFieldOptions",
        options: sizeTypes,
      },
      {
        name: "width",
        type: "number",
        isLabelOnTop: true,
        label: "Width",
        component: "textFieldOptions",
        options: sizeTypes,
      },
      {
        name: "min-height",
        type: "number",
        isLabelOnTop: true,
        label: "Min height",
        component: "textFieldOptions",
        options: sizeTypes,
      },
      {
        name: "min-width",
        type: "number",
        isLabelOnTop: true,
        label: "Min width",
        component: "textFieldOptions",
        options: sizeTypes,
      },
      {
        name: "max-height",
        type: "number",
        isLabelOnTop: true,
        label: "Max height",
        component: "textFieldOptions",
        options: sizeTypes,
      },
      {
        name: "max-width",
        type: "number",
        isLabelOnTop: true,
        label: "Max width",
        component: "textFieldOptions",
        options: sizeTypes,
      },
    ],
  },
};

const SpaceSection = {
  padding: {
    name: "padding",
    type: "number",
    isLabelOnTop: true,
    label: "Padding",

    gridType: "repeat(2,auto)",
    customProperty: [
      { label: "Padding Top", name: "pt" },
      { label: "Padding Left", name: "pl" },
      { label: "Padding Right", name: "pr" },
      { label: "Padding Bottom", name: "pb" },
    ],
    mainFieldType: "textFieldOptions",
    component: "fieldWithCustomProperty",
    options: sizeTypes,
  },
  margin: {
    name: "margin",
    type: "number",
    isLabelOnTop: true,
    label: "Margin",
    gridType: "repeat(2,auto)",
    customProperty: [
      { label: "Margin Top", name: "mt" },
      { label: "Margin Left", name: "ml" },
      { label: "Margin Right", name: "mr" },
      { label: "Margin Bottom", name: "mb" },
    ],
    mainFieldType: "textFieldOptions",
    component: "fieldWithCustomProperty",
    options: sizeTypes,
  },
};

const PositionSection = {
  position: {
    name: "position",
    label: "Position",
    component: "select",
    options: ["static", "relative", "absolute", "fixed", "sticky"],
  },
};

const TypographySection = {
  fontFamily: {
    name: "font-family",
    label: "Font",
    isLabelOnTop: true,
    component: "select",
    options: [
      "Arial Black",
      "Brush Script MT",
      "Comic Sans MS",
      "Courier New",
      "Georgia",
      "Helvetica",
      "Impact",
      "Lucida Sans Unicode",
      "Tahoma",
      "Times New Roman",
      "Trebuchet MS",
      "Verdana",
    ],
  },
  colorPicker: {
    name: "color",
    label: "Color",
    isLabelOnTop: true,
    component: "colorPicker",
  },
  typography: {
    name: "size Grid",
    padding: "5px 0px 5px 0px",
    gap: "5px 10px",
    component: "grid",
    "grid-template-columns": "repeat(2, auto)",
    children: [
      {
        name: "font-size",
        type: "number",
        isLabelOnTop: true,
        label: "Size",
        component: "textFieldOptions",
        options: sizeTypes,
      },
      {
        name: "font-weight",
        label: "Weight",
        isLabelOnTop: true,
        component: "select",
        options: [
          "thin",
          "extra-light",
          "light",
          "normal",
          "medium",
          "semi-bold",
          "bold",
          "extra-bold",
          "ultra-bold",
        ],
      },
      {
        name: "line-height",
        type: "number",
        isLabelOnTop: true,
        label: "Line height",
        component: "textFieldOptions",
        options: sizeTypes,
      },
      {
        name: "letter-spacing",
        type: "number",
        isLabelOnTop: true,
        label: "Spacing",
        component: "textFieldOptions",
        options: sizeTypes,
      },
      {
        name: "text-align",
        label: "Align",
        isLabelOnTop: true,
        component: "select",
        options: ["left", "center", "right", "justify"],
      },
      {
        name: "text-decoration",
        label: "Decoration",
        isLabelOnTop: true,
        component: "select",
        options: ["none", "underline", "overline", "line through"],
      },
      {
        name: "text-transform",
        label: "Transform",
        isLabelOnTop: true,
        component: "select",
        options: ["none", "capitalize", "uppercase", "lowercase"],
      },
      {
        name: "direction",
        label: "Direction",
        isLabelOnTop: true,
        component: "select",
        options: [
          { label: "RTL", value: "rtl" },
          { label: "LTR", value: "ltr" },
        ],
      },
    ],
  },
  whiteSpace: {
    name: "white-space",
    label: "Breaking",
    isLabelOnTop: true,
    component: "select",
    options: [
      { label: "Normal", value: "normal" },
      { label: "No Wrap", value: "nowrap" },
      { label: "Pre", value: "pre" },
      { label: "Pre Wrap", value: "pre-wrap" },
      { label: "Pre Line", value: "pre-line" },
      { label: "Break Spaces", value: "break-spaces" },
    ],
  },
};

const BackgroundSection = {
  background: {
    name: "box-shadow",
    component: "dataEditor",
    openMenu: createSignal(null),
    dialogLabel: "Adjust Shadow",
    fallback: "No Shadow Effects",
    children: {
      style: {
        component: "toggleButton",
        label: false,
        name: "type",
        options: [
          { key: "Outside", value: "" },
          { key: "Inside", value: "inset" },
        ],
      },
      shadow: {
        name: "grid",
        component: "grid",
        gap: "0px 10px",
        "grid-template-columns": "repeat(2, auto)",
        children: [
          {
            name: "x-offset",
            label: "X Offset",
            isLabelOnTop: true,
            type: "number",
            isAddToClass: false,
            component: "textFieldOptions",
            options: sizeTypes,
          },
          {
            name: "y-offset",
            label: "Y Offset",
            isLabelOnTop: true,
            type: "number",
            isAddToClass: false,
            component: "textFieldOptions",
            options: sizeTypes,
          },
          {
            name: "blur",
            label: "Blur",
            isLabelOnTop: true,
            type: "number",
            isAddToClass: false,
            component: "textFieldOptions",
            options: sizeTypes,
          },
          {
            name: "spread",
            type: "number",
            label: "Spread",
            isLabelOnTop: true,
            isAddToClass: false,
            component: "textFieldOptions",
            options: sizeTypes,
          },
        ],
      },
      data: {
        name: "color",
        label: "Shadow Color",
        isLabelOnTop: true,
        component: "colorPicker",
      },
    },
    label: "Box Shadow",
  },
  backgroundColor: {
    name: "background-color",
    label: "Background Color",
    isLabelOnTop: true,
    component: "colorPicker",
  },
  clip: {
    name: "clip-path",
    label: "Clip",
    isLabelOnTop: true,
    component: "select",
    options: [
      "border-box",
      "padding-box",
      "content-box",
      "fill-box",
      "stroke-box",
      "margin-box",
    ],
  },
};

const BorderSection = {
  borderRadius: {
    name: "border-radius",
    type: "number",
    isLabelOnTop: true,
    label: "Border Radius",

    gridType: "repeat(2,auto)",
    customProperty: [
      { label: "Top Left", name: "rtl" },
      { label: "Top Right", name: "rtr" },
      { label: "Bottom Right", name: "rbl" },
      { label: "Bottom Bottom", name: "rbr" },
    ],
    mainFieldType: "textFieldOptions",
    component: "fieldWithCustomProperty",
    options: sizeTypes,
  },
  borderWidth: {
    name: "border-width",
    type: "number",
    isLabelOnTop: true,
    label: "Border Width",
    gridType: "repeat(2,auto)",
    customProperty: [
      { label: "Border Top", name: "border-top" },
      { label: "Border Left", name: "border-left" },
      { label: "Border Right", name: "border-right" },
      { label: "Border Bottom", name: "border-bottom" },
    ],
    mainFieldType: "textFieldOptions",
    component: "fieldWithCustomProperty",
    options: sizeTypes,
  },
  borderStyle: {
    name: "border-style",
    type: "number",
    isLabelOnTop: true,
    label: "Border Style",
    gridType: "repeat(2,auto)",
    customProperty: [
      { label: "Border Top", name: "border-top" },
      { label: "Border Left", name: "border-left" },
      { label: "Border Right", name: "border-right" },
      { label: "Border Bottom", name: "border-bottom" },
    ],
    mainFieldType: "select",
    component: "fieldWithCustomProperty",
    options: [
      "none",
      "solid",
      "dotted",
      "dashed",
      "double",
      "groove",
      "Ridge",
      "inset",
      "outset",
    ],
  },
  borderColor: {
    name: "border-color",
    type: "number",
    isLabelOnTop: true,
    label: "Border Color",
    gridType: "repeat(2,auto)",
    customProperty: [
      { label: "Border Top", name: "border-top" },
      { label: "Border Left", name: "border-left" },
      { label: "Border Right", name: "border-right" },
      { label: "Border Bottom", name: "border-bottom" },
    ],
    mainFieldType: "colorPicker",
    component: "fieldWithCustomProperty",
  },
};

const EffectsSection = {
  opacity: {
    name: "size Grid",
    padding: "5px 0px 5px 0px",
    gap: "5px 10px",
    component: "grid",
    "grid-template-columns": "1fr 50%",
    children: [
      {
        name: "opacity",
        type: "number",
        isLabelOnTop: true,
        label: "Opacity",
        component: "textFieldOptions",
        options: sizeTypes,
      },
      {
        name: "blend-mode",
        label: "Blend Mode",
        isLabelOnTop: true,
        component: "select",
        options: [
          "normal",
          "multiply",
          "screen",
          "overlay",
          "darken",
          "lighten",
          "color dodge",
          "color burn",
          "hard light",
          "soft light",
          "difference",
          "exclusion",
          "hue",
          "saturation",
          "color",
          "luminosity",
        ],
      },
    ],
  },
  cursors: {
    name: "cursor",
    label: "Cursor",
    isLabelOnTop: true,
    component: "select",
    options: [
      "auto",
      "pointer",
      "copy",
      "crosshair",
      "grab",
      "grabbing",
      "help",
      "move",
      "text",
    ],
  },
  divider: {
    component: "divider",
  },
  boxShadow: {
    name: "box-shadow",
    component: "dataEditor",
    openMenu: createSignal(null),
    dialogLabel: "Adjust Shadow",
    fallback: "No Shadow Effects",
    children: {
      style: {
        component: "toggleButton",
        label: false,
        name: "Style",
        options: [
          { key: "Outside", value: "" },
          { key: "Inside", value: "inset" },
        ],
      },
      shadow: {
        name: "Shadow Grid",
        component: "grid",
        "grid-template-columns": "repeat(2, auto)",
        children: [
          {
            name: "X Offset",
            label: "X Offset",
            isLabelOnTop: true,
            type: "number",
            component: "textFieldOptions",
            options: sizeTypes,
          },
          {
            name: "Y Offset",
            label: "Y Offset",
            isLabelOnTop: true,
            type: "number",
            component: "textFieldOptions",
            options: sizeTypes,
          },
          {
            name: "Blur",
            label: "Blur",
            isLabelOnTop: true,
            type: "number",
            component: "textFieldOptions",
            options: sizeTypes,
          },
          {
            name: "Spread",
            type: "number",
            label: "Spread",
            isLabelOnTop: true,
            component: "textFieldOptions",
            options: sizeTypes,
          },
        ],
      },
    },
    label: "Box Shadow",
  },
  textShadow: {
    name: "text-shadow",
    component: "dataEditor",
    openMenu: createSignal(null),
    dialogLabel: "Adjust Shadow",
    fallback: "No Shadow Effects",
    children: {
      shadow: {
        name: "Shadow Grid",
        component: "grid",
        "grid-template-columns": "repeat(2, auto)",
        children: [
          {
            name: "X Offset",
            label: "X Offset",
            isLabelOnTop: true,
            type: "number",
            component: "textFieldOptions",
            options: sizeTypes,
          },
          {
            name: "Y Offset",
            label: "Y Offset",
            isLabelOnTop: true,
            type: "number",
            component: "textFieldOptions",
            options: sizeTypes,
          },
          {
            name: "Blur",
            label: "Blur",
            isLabelOnTop: true,
            type: "number",
            component: "textFieldOptions",
            options: sizeTypes,
          },
          {
            name: "Spread",
            type: "number",
            label: "Spread",
            isLabelOnTop: true,
            component: "textFieldOptions",
            options: sizeTypes,
          },
        ],
      },
    },
    label: "Text Shadow",
  },
  filter: {
    name: "filter",
    component: "dataEditor",

    openMenu: createSignal(null),
    dialogLabel: "Adjust Filter",
    fallback: "No Filter Effects",
    children: {
      shadow: {
        name: "Shadow Grid",
        component: "grid",
        gap: "10px",
        "grid-template-columns": "1fr 45%",
        children: [
          {
            name: "type",
            label: "Type",
            isLabelOnTop: true,
            component: "select",
            options: [
              "blur",
              "brightness",
              "contrast",
              "grayscale",
              "hue rotate",
              "invert",
              "saturate",
              "sepia",
            ],
          },
          {
            name: "value",
            label: "Value",
            isLabelOnTop: true,
            type: "number",
            component: "textFieldOptions",
            options: sizeTypes,
          },
        ],
      },
    },
    label: "Filter",
  },
  backdropFilter: {
    name: "backdrop-filter",
    component: "dataEditor",

    openMenu: createSignal(null),
    dialogLabel: "Backdrop Filter",
    children: {
      shadow: {
        name: "Shadow Grid",
        component: "grid",
        gap: "10px",
        "grid-template-columns": "1fr 45%",
        children: [
          {
            name: "type",
            label: "Type",
            isLabelOnTop: true,
            component: "select",
            options: [
              "blur",
              "brightness",
              "contrast",
              "grayscale",
              "hue rotate",
              "invert",
              "saturate",
              "sepia",
            ],
          },
          {
            name: "value",
            label: "Value",
            isLabelOnTop: true,
            type: "number",
            component: "textFieldOptions",
            options: sizeTypes,
          },
        ],
      },
    },
    label: "Backdrop Filter",
  },
  transition: {
    name: "transition",
    component: "dataEditor",

    openMenu: createSignal(null),
    dialogLabel: "Adjust Transition",
    fallback: "No transition",
    children: {
      type: {
        name: "type",
        label: "Type",
        isLabelOnTop: true,
        component: "select",
        options: [
          "height",
          "width",
          "min height",
          "min width",
          "max height",
          "max width",
          "padding",
          "margin",
          "color",
          "font",
          "font size",
          "line height",
          "letter height",
          "border",
          "border radius",
          "background",
          "opacity",
          "box shadow",
          "text shadow",
          "filter",
          "backdrop filter",
          "transform",
          "all",
        ],
      },
      easing: {
        name: "easing",
        label: "Easing",
        isLabelOnTop: true,
        component: "select",
        options: ["ease", "ease-in", "ease-in-out", "ease-out", "linear"],
      },
      shadow: {
        name: "size Grid",
        padding: "5px 0px 5px 0px",
        gap: "5px 10px",
        component: "grid",
        "grid-template-columns": "1fr 45%",
        children: [
          {
            name: "duration",
            label: "Duration",
            isLabelOnTop: true,
            type: "number",
            component: "textFieldOptions",
            options: timesTypes,
          },
          {
            name: "delay",
            label: "Delay",
            isLabelOnTop: true,
            type: "number",
            component: "textFieldOptions",
            options: timesTypes,
          },
        ],
      },
    },
    label: "Transition",
  },
  transform: {
    name: "transform",
    component: "dataEditor",

    openMenu: createSignal(null),
    dialogLabel: "Adjust Transform",
    children: {
      shadow: {
        name: "Grid",
        padding: "5px 0px 5px 0px",
        gap: "5px 10px",
        component: "grid",
        "grid-template-columns": "1fr 45%",
        children: [
          {
            name: "type",
            label: "Type",
            isLabelOnTop: true,
            component: "select",
            options: [
              "move x",
              "move y",
              "move z",
              "rotate x",
              "rotate y",
              "rotate z",
              "scale",
              "scale x",
              "scale y",
              "scale z",
              "skew x",
              "skew y",
            ],
          },
          {
            name: "value",
            type: "number",
            label: "Value",
            isLabelOnTop: true,
            component: "textFieldOptions",
            options: sizeTypes,
          },
        ],
      },
    },
    label: "Transform",
  },
  divider2: {
    component: "divider",
  },
  transformOrigin: {
    name: "size Grid",
    padding: "5px",
    gap: "5px 10px",
    align: "end",
    component: "grid",
    "grid-template-columns": "1fr 25%",
    children: [
      {
        name: "transform-origin",
        type: "number",
        isLabelOnTop: true,
        label: "Transform Origin",
        component: "textFieldOptions",
        options: sizeTypes,
      },
      {
        name: "transformOriginType",
        label: false,
        component: "buttonGroups",
        options: [
          { key: <AllSVGIcon />, value: "all" },
          { key: <CustomSVGIcon />, value: "custom" },
        ],
      },
    ],
  },
  overflow: {
    name: "size Grid",
    padding: "5px",
    gap: "5px 10px",
    align: "end",
    component: "grid",
    "grid-template-columns": "1fr 25%",
    children: [
      {
        name: "overflow",
        label: "Overflow",
        isLabelOnTop: true,
        component: "select",
        options: ["visible", "hidden", "scroll", "auto"],
      },
      {
        name: "overflowType",
        label: false,
        component: "buttonGroups",
        options: [
          { key: <AllSVGIcon />, value: "all" },
          { key: <CustomSVGIcon />, value: "custom" },
        ],
      },
    ],
  },
  backface: {
    component: "toggleButton",
    label: "Backface",
    isLabelOnTop: true,
    name: "backface-visibility",
    options: [
      { key: "Visible", value: "visible" },
      { key: "Hidden", value: "hidden" },
    ],
  },
  divider4: {
    title: "Children transform",
    component: "divider",
  },
  perspective: {
    name: "size Grid",
    padding: "5px",
    gap: "5px 10px",
    align: "end",
    component: "grid",
    "grid-template-columns": "1fr 25%",
    children: [
      {
        name: "perspective",
        type: "number",
        isLabelOnTop: true,
        label: "Perspective",
        component: "textFieldOptions",
        options: sizeTypes,
      },
      {
        name: "transform-style",
        label: "Type",
        isLabelOnTop: true,
        component: "buttonGroups",
        options: [
          { key: "2D", value: "flat", tooltip: "2D" },
          { key: "3D", value: "preserve-3d", tooltip: "3D" },
        ],
      },
    ],
  },
  perspectiveOrigin: {
    name: "size Grid",
    padding: "5px",
    gap: "5px 10px",
    align: "end",
    component: "grid",
    "grid-template-columns": "1fr 25%",
    children: [
      {
        name: "perspective-origin",
        type: "number",
        isLabelOnTop: true,
        label: "Perspective origin",
        component: "textFieldOptions",
        options: sizeTypes,
      },
      {
        name: "perspectiveOriginType",
        label: false,
        component: "buttonGroups",
        options: [
          { key: <AllSVGIcon />, value: "all" },
          { key: <CustomSVGIcon />, value: "custom" },
        ],
      },
    ],
  },
};

const JSONSchema = {
  General: GeneralSection,
  Layout: LayoutSection,
  Size: SizeSection,
  Space: SpaceSection,
  Position: PositionSection,
  Typography: TypographySection,
  Background: BackgroundSection,
  Border: BorderSection,
  Effects: EffectsSection,
};

export default JSONSchema;
