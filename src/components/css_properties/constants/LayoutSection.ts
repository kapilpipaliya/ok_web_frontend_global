/* eslint-disable perfectionist/sort-objects */
import type {
  DividerField,
  FieldWithCustomProperty,
  TextFieldOptionsField,
} from "./FieldType";

import { CSSWideKeywords, extraPropertyValues } from "./CSSMetadata";
import { createButtonGroupOptions, createSelectOptions } from "./FieldType";
import { Icons } from "./Icons";
import { sizeTypes } from "./constants";

export const LayoutSection = {
  display: createSelectOptions("display", "Display", ['block', 'contents', 'flex', 'flow', 'flow-root', 'grid', 'inline', 'inline-block', 'inline-flex', 'inline-grid', 'inline-table', 'list-item', 'math', 'none', 'ruby', 'ruby-text', 'table', 'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group', 'table-row', 'table-row-group', ...CSSWideKeywords]),
  alignFlex: createSelectOptions("align-items", "Align Items", extraPropertyValues["align-items"].values),
  alignSelf: createSelectOptions("align-self", "Align Self", extraPropertyValues["align-self"].values),
  direction: createButtonGroupOptions("flex-direction", "Flex Direction", [
    { key: Icons.direction.horizontal, value: "row" },
    { key: Icons.direction.horizontalReverse, value: "row-reverse" },
    { key: Icons.direction.vertical, value: "column" },
    { key: Icons.direction.verticalReverse, value: "column-reverse" },
  ]),
  divider4: { component: "divider", title: "Flex Child" } as DividerField,
  flex: createButtonGroupOptions("flex", "Flex", [
    { key: Icons.flex.auto, tooltip: "auto", value: "0 0 auto" },
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
  } as FieldWithCustomProperty,
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
  } as TextFieldOptionsField,
};