import { Icons } from "../Icons";
import { sizeTypes } from "../context";
import { createButtonGroupOptions } from "./createButtonGroupOptions";
import { createSelectOptions } from "./createSelectOptions";

export const LayoutSection = {
  alignFlex: createButtonGroupOptions("align-items", "Align", [
    { key: "material-symbols:align-start-rounded", value: "flex-start" },
    { key: "material-symbols:align-center-rounded", value: "center" },
    { key: "material-symbols:align-end-rounded", value: "flex-end" },
    { key: "material-symbols:align-items-stretch-rounded", value: "stretch" },
  ]),
  alignSelf: createButtonGroupOptions("align-self", "Align", [
    { key: Icons.flex.auto, value: "auto" },
    { key: Icons.align.start, value: "flex-start" },
    { key: Icons.align.center, value: "center" },
    { key: Icons.align.end, value: "flex-end" },
    { key: Icons.align.stretch, value: "stretch" },
  ]),
  direction: createButtonGroupOptions("flex-direction", "Direction", [
    { key: Icons.direction.horizontal, value: "row" },
    { key: Icons.direction.horizontalReverse, value: "row-reverse" },
    { key: Icons.direction.vertical, value: "column" },
    { key: Icons.direction.verticalReverse, value: "column-reverse" },
  ]),
  display: createSelectOptions("display", "Display", [
    "block",
    "inline",
    "inline block",
    "flex",
    "none",
  ]),
  divider4: { component: "divider", title: "Flex Child" },
  flex: createButtonGroupOptions("flex", "Flex", [
    { key: "mdi:close", tooltip: "auto", value: "0 0 auto" },
    { key: Icons.flex.expand, tooltip: "expand", value: "1 1 0%" },
    { key: Icons.flex.collapse, tooltip: "collapse", value: "0 1 auto" },
    { key: "customIcon", tooltip: "Custom", value: "custom" },
  ]),
  flexWrap: createSelectOptions("flex-wrap", "Flex wrap", [
    { label: "No Wrap", value: "nowrap" },
    { label: "Wrap", value: "wrap" },
    { label: "Reverse Wrap", value: "wrap-reverse" },
  ]),
  gap: {
    component: "fieldWithCustomProperty",
    customProperty: [
      { label: "Column", name: "gap-x" },
      { label: "Row", name: "gap-y" },
    ],
    gridType: "repeat(2,auto)",
    isLabelOnTop: true,
    label: "Gap",
    mainFieldType: "textFieldOptions",
    name: "gap",
    options: sizeTypes,
    type: "number",
  },
  justify: createButtonGroupOptions("justify-content", "Justify", [
    { key: Icons.justify.start, value: "start" },
    { key: Icons.justify.center, value: "center" },
    { key: Icons.justify.end, value: "end" },
    { key: Icons.justify.spaceAround, value: "space-around" },
    { key: Icons.justify.spaceBetween, value: "space-between" },
    { key: Icons.justify.spaceEvenly, value: "space-evenly" },
  ]),
  order: {
    component: "textFieldOptions",
    label: "Order",
    name: "order",
    type: "number",
  },
};
