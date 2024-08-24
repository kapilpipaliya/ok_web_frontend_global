/* eslint-disable perfectionist/sort-objects */
import { CSSWideKeywords, extraPropertyValues } from "./CSSMetadata";
import {
  createSelectOptions,
  type TextFieldOptionsField,
  type ToggleField,
} from "./FieldSchemaType";
import { Icons } from "./Icons";

export const DisplaySection = {
  display: createSelectOptions("display", "Display", [
    "block",
    "contents",
    "flex",
    "flow",
    "flow-root",
    "grid",
    "inline",
    "inline-block",
    "inline-flex",
    "inline-grid",
    "inline-table",
    "list-item",
    "math",
    "none",
    "ruby",
    "ruby-text",
    "table",
    "table-caption",
    "table-cell",
    "table-column",
    "table-column-group",
    "table-footer-group",
    "table-header-group",
    "table-row",
    "table-row-group",
    ...CSSWideKeywords,
  ]),
  visibility: {
    componentName: "toggleButton",
    label: "Visibility",
    name: "visibility",
    options: [
      { icon: true, key: Icons.visibility.yes, value: "visible" },
      { icon: true, key: Icons.visibility.no, value: "hidden" },
    ],
  } as ToggleField,
  verticalAlign: createSelectOptions("vertical-align", "Vertical align", [
    ...extraPropertyValues["vertical-align"].values,
    ...CSSWideKeywords,
  ]), // TODO: Add support for specifying custom values
  resize: createSelectOptions("resize", "Resize", [
    ...extraPropertyValues.resize.values,
    ...CSSWideKeywords,
  ]),
  /*overflow: {
    align: "end",
    componentName: "fieldWithCustomProperty",
    customProperty: [
      { label: "X", name: "overflow-x" },
      { label: "Y", name: "overflow-y" },
    ],
    gap: "5px 10px",
    "grid-template-columns": "1fr 25%",
    gridType: "repeat(2,auto)",
    isLabelOnTop: true,
    label: "Overflow",
    mainFieldType: "select",
    name: "overflow",
    options: [...extraPropertyValues["overflow"].values, ...CSSWideKeywords],
    padding: "5px",
  } as FieldWithCustomProperty,*/
  overflow: createSelectOptions("overflow", "Overflow", [
    ...extraPropertyValues.overflow.values,
    ...CSSWideKeywords,
  ]),
  overflowX: createSelectOptions("overflow-x", "Overflow X", [
    ...extraPropertyValues.overflow.values,
    ...CSSWideKeywords,
  ]),
  overflowY: createSelectOptions("overflow-y", "Overflow Y", [
    ...extraPropertyValues.overflow.values,
    ...CSSWideKeywords,
  ]),
  float: createSelectOptions("float", "Float", [
    "left",
    "right",
    "none",
    ...CSSWideKeywords,
  ]),
  clear: createSelectOptions("clear", "Clear", [
    "none",
    "left",
    "right",
    "both",
    ...CSSWideKeywords,
  ]),
  boxSizing: createSelectOptions("box-sizing", "Box Sizing", [
    "content-box",
    "border-box",
    ...CSSWideKeywords,
  ]),
  opacity: {
    componentName: "textFieldOptions",
    label: "Opacity",
    name: "opacity",
    unitOptions: ["%"],
    type: "number",
    inputProps: {
      min: 0,
      max: 100,
    },
  } as TextFieldOptionsField,
  cursor: createSelectOptions("cursor", "Cursor", [
    "auto",
    "default",
    "pointer",
    "wait",
    "text",
    "move",
    "not-allowed",
    ...CSSWideKeywords,
  ]), //Add more if required
  objectFit: createSelectOptions("object-fit", "Object Fit", [
    "fill",
    "contain",
    "cover",
    "none",
    "scale-down",
    ...CSSWideKeywords,
  ]),
  objectPosition: createSelectOptions("object-position", "Object Position", [
    "top",
    "bottom",
    "left",
    "right",
    "center",
    ...CSSWideKeywords,
  ]), // Add support for <percentage> values, <length> value, Edge offsets values
  aspectRatio: createSelectOptions("aspect-ratio", "Aspect Ratio", [
    "auto",
    "1/1",
    "16/9",
    "4/3",
    "21/9",
    ...CSSWideKeywords,
  ]),
};
