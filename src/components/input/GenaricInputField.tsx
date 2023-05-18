import { createEffect, onCleanup, Show, useContext } from "solid-js";
import { G } from "@mobily/ts-belt";
import dxAutocomplete, { Properties as dxAutocompleteProperties } from "devextreme/ui/autocomplete";
import dxBullet, { Properties as dxBulletProperties } from "devextreme/viz/bullet";
import dxCalendar, { Properties as dxCalendarProperties } from "devextreme/ui/calendar";
import dxCheckBox, { Properties as dxCheckBoxProperties } from "devextreme/ui/check_box";
import dxCircularGauge, { Properties as dxCircularGaugeProperties } from "devextreme/viz/circular_gauge";
import dxColorBox, { Properties as dxColorBoxProperties } from "devextreme/ui/color_box";
import dxDateBox, { Properties as dxDateBoxProperties } from "devextreme/ui/date_box";
import dxDropDownBox, { Properties as dxDropDownBoxProperties } from "devextreme/ui/drop_down_box";
import dxFileUploader, { Properties as dxFileUploaderProperties } from "devextreme/ui/file_uploader";
import dxFilterBuilder, { Properties as dxFilterBuilderProperties } from "devextreme/ui/filter_builder";
import dxHtmlEditor, { Properties as dxHtmlEditorProperties } from "devextreme/ui/html_editor";
import dxLinearGauge, { Properties as dxLinearGaugeProperties } from "devextreme/viz/linear_gauge";
import dxNumberBox, { Properties as dxNumberBoxProperties } from "devextreme/ui/number_box";
import dxProgressBar, { Properties as dxProgressBarProperties } from "devextreme/ui/progress_bar";
import dxRadioGroup, { Properties as dxRadioGroupProperties } from "devextreme/ui/radio_group";
import dxRangeSelector, { Properties as dxRangeSelectorProperties } from "devextreme/viz/range_selector";
import dxRangeSlider, { Properties as dxRangeSliderProperties } from "devextreme/ui/range_slider";
import dxSlider, { Properties as dxSliderProperties } from "devextreme/ui/slider";
import dxSwitch, { Properties as dxSwitchProperties } from "devextreme/ui/switch";
import dxTextArea, { Properties as dxTextAreaProperties } from "devextreme/ui/text_area";
import dxTextBox, { Properties as dxTextBoxProperties } from "devextreme/ui/text_box";

import Validator, { Properties as ValidatorProperties } from "devextreme/ui/validator";
import { FormContext } from "../dynamicForm";
import dxValidationGroup from "devextreme/ui/validation_group";
import { ValidationRule } from "devextreme/common";
import { ComponentProps } from "../core/Form";
import { IdAttr } from "../../lib/graph";

export const genericComponents = [
  "Autocomplete",
  "Bullet",
  "Calendar",
  "CheckBox",
  "CircularGauge",
  "ColorBox",
  "DateBox",
  "DropDownBox",
  "FileUploader",
  "FilterBuilder",
  "HtmlEditor",
  "LinearGauge",
  "NumberBox",
  "ProgressBar",
  "RadioGroup",
  "RangeSelector",
  "RangeSlider",
  "SelectBox",
  "Slider",
  "Switch",
  // "TagBox", // giving error with undefined values
  "TextArea",
  "TextBox",
];
const displayExpr = [
  "ContextMenu",
  "DropDownBox",
  "DropDownButton",
  "List",
  "Lookup",
  "Menu",
  "RadioGroup",
  "SelectBox",
  "TagBox",
  "TreeView",
];
const valueExpr = ["Autocomplete", "DropDownBox", "Lookup", "RadioGroup", "SelectBox", "TagBox"];
const dataSource = [
  "Accordion",
  "ActionSheet",
  "Autocomplete",
  "Box",
  "Chart",
  "ContextMenu",
  "DataGrid",
  "DropDownBox",
  "DropDownButton",
  "Funnel",
  "Gallery",
  "List",
  "Lookup",
  "Menu",
  "MultiView",
  "PieChart",
  "PivotGrid",
  "PivotGridFieldChooser",
  "PolarChart",
  "RadioGroup",
  "RangeSelector",
  "ResponsiveBox",
  "Sankey",
  "Scheduler",
  "SelectBox",
  "Sparkline",
  "TabPanel",
  "Tabs",
  "TagBox",
  "TileView",
  "Toolbar",
  "TreeList",
  "TreeMap",
  "TreeView",
];
const items = [
  "Accordion",
  "ActionSheet",
  "Autocomplete",
  "Box",
  "ButtonGroup",
  "ContextMenu",
  "DropDownBox",
  "DropDownButton",
  "Form",
  "Gallery",
  "List",
  "Lookup",
  "Menu",
  "MultiView",
  "RadioGroup",
  "ResponsiveBox",
  "SelectBox",
  "TabPanel",
  "Tabs",
  "TagBox",
  "TileView",
  "Toolbar",
  "TreeView",
  "ValidationSummary",
];
// onlyItemsAndNotDataSource = ['ButtonGroup', 'Form', 'ValidationSummary']
// onlyDataSourceAndNotItems = ['Chart', 'DataGrid', 'Funnel', 'PieChart', 'PivotGrid', 'PivotGridFieldChooser', 'PolarChart', 'RangeSelector', 'Sankey', 'Scheduler', 'Sparkline', 'TreeList', 'TreeMap']

const displayExpr1 = ["DropDownBox", "RadioGroup", "SelectBox"];
const valueExpr1 = ["Autocomplete", "DropDownBox", "RadioGroup", "SelectBox"];
// RangeSelector dont have items property, so we will not support it.
const dataSource1 = ["Autocomplete", "DropDownBox", "RadioGroup", "RangeSelector", "SelectBox"];
const items1 = ["Autocomplete", "DropDownBox", "RadioGroup", "SelectBox"];

// Do not specify the items property if you specified the dataSource, and vice versa.
// its best to use dataSource but we are using items for simplicity.
const getTextColumnValue = (value: any) => {
  if (value === true) {
    return "True";
  } else if (value === false) {
    return "False";
  }
  if (!value) {
    return "";
  }

  if (Array.isArray(value)) {
    value = value.map((v) => getTextColumnValue(v)).join(", ");
  }

  return G.isObject(value) ? JSON.stringify(value) : value;
};
export function GenericInputField(props: ComponentProps & { component: string; disabled: boolean }) {
  const formContext = useContext(FormContext);
  return (
    <div aria-labeledby={props["aria-labeledby"]}>
      <Show<boolean> when={!props.disabled} fallback={getTextColumnValue(props.data.properties[props.meta.properties[IdAttr]])}>
        <div
          // @ts-ignore
          ref={(el) => {
            let properties: any = {
              // This will work as initial value and setting value second time in createEffect will not call onValueChanged function.
              value: props.data.properties[props.meta.properties[IdAttr]],
              onValueChanged: (data: any) => {
                // note: valueChanged is fired even when the value is changed programmatically,
                // that is causing problem: when transaction is reverted, it again calls onValueChanged callback.
                // used data.event check to prevent this.
                if (props.component === "FileUploader") {
                  props.setValue(props.meta, data.component._files[0].value);
                } else if (data.event || props.component === "FilterBuilder") {
                  props.setValue(props.meta, data.value);
                }
              },
              // onChange: (e: any) => {
              //   props.setValue(props.meta, e.value);
              // },
              validationGroup: formContext.validationGroup,
              disabled: props.disabled,
            };
            let comp: any;

            if (props.component === "Autocomplete") {
              comp = dxAutocomplete;
              debugger
              // autocomplete is just like text box, but it allows user to preselect some values.
              Object.assign(properties, {} as dxAutocompleteProperties);
            } else if (props.component === "Bullet") {
              comp = dxBullet;
              Object.assign(properties, {} as dxBulletProperties);
            } else if (props.component === "Calendar") {
              comp = dxCalendar;
              Object.assign(properties, {} as dxCalendarProperties);
            } else if (props.component === "CheckBox") {
              comp = dxCheckBox;
              Object.assign(properties, {
                enableThreeStateBehavior: true,
              } as dxCheckBoxProperties);
            } else if (props.component === "CircularGauge") {
              comp = dxCircularGauge;
              Object.assign(properties, {} as dxCircularGaugeProperties);
            } else if (props.component === "ColorBox") {
              comp = dxColorBox;
              Object.assign(properties, {} as dxColorBoxProperties);
            } else if (props.component === "DateBox") {
              comp = dxDateBox;
              Object.assign(properties, {} as dxDateBoxProperties);
            } else if (props.component === "DateBox") {
              comp = dxDateBox;
              Object.assign(properties, {} as dxDateBoxProperties);
            } else if (props.component === "DropDownBox") {
              // DropDownBox is very advanced we can use custom dropdown in the field. so its not supported yet.
              return "not supported yet";
              comp = dxDropDownBox;
              // Specifies the currently selected value. May be an object if dataSource contains objects and valueExpr is not set.
              Object.assign(properties, {} as dxDropDownBoxProperties);
            } else if (props.component === "FileUploader") {
              comp = dxFileUploader;
              Object.assign(properties, {
                // selectButtonText: "Select file",
                // labelText: "",
                // accept: "image/*",
                // uploadMode: "instantly",
                value: []
              } as dxFileUploaderProperties);
            } else if (props.component === "FilterBuilder") {
              comp = dxFilterBuilder;
              Object.assign(properties, {value: [],
                // allowHierarchicalFields: true,
                // onEditorPreparing: function (e) {
                //   e.editorOptions.width = 125;
                // },
                // at least one field is required, else component is giving error.
                fields: props.meta.properties.props.fields || [{
                  dataField: 'name',
                  dataType: 'string',
                }],
              } as dxFilterBuilderProperties);
            } else if (props.component === "HtmlEditor") {
              comp = dxHtmlEditor;
              Object.assign(properties, {
                toolbar: {
                  items: [
                    "bold",
                    "italic",
                    "color",
                    "background",
                    "link",
                    {
                      name: "header",
                      acceptedValues: [1, 2, 3, false],
                    },
                    "variable",
                  ],
                },
                variables: {
                  dataSource: ["FirstName", "LastName", "Company"],
                  escapeChar: ["{", "}"],
                },
              } as dxHtmlEditorProperties);
            } else if (props.component === "LinearGauge") {
              comp = dxLinearGauge;
              Object.assign(properties, {} as dxLinearGaugeProperties);
            } else if (props.component === "NumberBox") {
              comp = dxNumberBox;
              Object.assign(properties, {} as dxNumberBoxProperties);
            } else if (props.component === "ProgressBar") {
              comp = dxProgressBar;
              Object.assign(properties, {} as dxProgressBarProperties);
            } else if (props.component === "RadioGroup") {
              comp = dxRadioGroup;
              // radioBox can support any value in the array, it will return the value on onChange like object.
              Object.assign(properties, {} as dxRadioGroupProperties);
            } else if (props.component === "RangeSelector") {
              comp = dxRangeSelector;
              Object.assign(properties, {} as dxRangeSelectorProperties);
            } else if (props.component === "RangeSlider") {
              comp = dxRangeSlider;
              Object.assign(properties, {} as dxRangeSliderProperties);
              // } else if(props.component === "SelectBox" ) {
              //  comp = dxSelectBox;
              //  Object.assign(properties, {} as dxSelectBoxProperties);
            } else if (props.component === "Slider") {
              comp = dxSlider;
              Object.assign(properties, {} as dxSliderProperties);
            } else if (props.component === "Switch") {
              comp = dxSwitch;
              Object.assign(properties, {} as dxSwitchProperties);
              // } else if(props.component === "TagBox" ) {
              //  comp = dxTagBox;
              //  Object.assign(properties, {} as dxTagBoxProperties);
            } else if (props.component === "TextArea") {
              comp = dxTextArea;
              Object.assign(properties, {} as dxTextAreaProperties);
            } else if (props.component === "TextBox") {
              comp = dxTextBox;
              Object.assign(properties, {} as dxTextBoxProperties);
            } else {
              console.warn("Component not found", props.component);
              return "----";
            }
            // if (displayExpr.includes(props.component) && !props.meta.properties.props.displayExpr) {
            //  Object.assign(properties, {displayExpr: ''});
            // }
            // if (valueExpr.includes(props.component) && !props.meta.properties.props.valueExpr) {
            //  Object.assign(properties, {valueExpr: ''});
            // }
            // if (dataSource.includes(props.component) && !props.meta.properties.props.dataSource) {
            //  Object.assign(properties, {dataSource: ''});
            // }
            // if (items.includes(props.component) && !props.meta.properties.props.items) {
            //  Object.assign(properties, {items: ''});
            // }

            const instance = new comp(el, properties);

            // try {
            if (
              !["Autocomplete", "Bullet", "CircularGauge", "FilterBuilder", "LinearGauge"].includes(props.component)
            ) {
              const validatorInstance = new Validator(el, {
                validationGroup: formContext.validationGroup,
                // adapter only called when we run validate() manually
                // adapter: {
                //  getValue: function(e) {
                //   return {value: instance.option("value")};
                //  },
                //  applyValidationResults: function(e) {
                //   // $("#contacts").css({ "border": e.isValid ? "none" : "1px solid red" });
                //  },
                //  validationRequestsCallbacks: [(e)=> {
                //   return false;
                //  }]
                // }
              });
              validatorInstance.context = formContext;
              validatorInstance.zmeta = props.meta;
              // validationRules: [{
              //     type: 'required',
              //     message: 'Email is required',
              //   }
              //   , {
              //     type: 'email',
              //     message: 'Email is invalid',
              //   },
              //   {
              //     type: 'async',
              //     message: 'Email is already registered',
              //     validationCallback(params) {
              //       return sendRequest(params.value);
              //     },
              //   }
              // ],
              createEffect(() =>
                validatorInstance.option(
                  "validationRules",
                  props.meta.properties.props?.validationRules as Array<ValidationRule>,
                ),
              );
            }
            // } catch (e) {
            //  console.log('cant set validator for', props.component, e);
            // }

            createEffect(() => {
              let value = props.data.properties[props.meta.properties[IdAttr]];
              if (props.component === "FilterBuilder" || props.component === "FileUploader") {
                if (!value) value = [];
                else if(!Array.isArray(value)) {
                  value = [value];
                }
              }
              return instance.option("value", value);
            });
            createEffect(() => instance.option("disabled", props.disabled));

            createEffect(() => {
              for (const property in props.meta.properties.props as dxTextBoxProperties) {
                let value = props.meta.properties.props[property];
                if (property === "items" && typeof value === "string") {
                  value = value.split("\n");
                }
                instance.option(property, value);
              }
            });
            onCleanup(() => instance.dispose());
          }}
        />
      </Show>
    </div>
  );
}
