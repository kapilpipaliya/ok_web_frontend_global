import { createEffect, useContext } from "solid-js";
import {G} from '@mobily/ts-belt';
import dxAutocomplete, {
 Properties as dxAutocompleteProperties
} from "devextreme/ui/toolbar";
import dxBullet, {
 Properties as dxBulletProperties
} from "devextreme/viz/bullet";
import dxCalendar, {
 Properties as dxCalendarProperties
} from "devextreme/ui/calendar";
import dxCheckBox, {
 Properties as dxCheckBoxProperties
} from "devextreme/ui/check_box";
import dxCircularGauge, {
 Properties as dxCircularGaugeProperties
} from "devextreme/viz/circular_gauge";
import dxColorBox, {
 Properties as dxColorBoxProperties
} from "devextreme/ui/color_box";
import dxDateBox, {
 Properties as dxDateBoxProperties
} from "devextreme/ui/date_box";
import dxDropDownBox, {
 Properties as dxDropDownBoxProperties
} from "devextreme/ui/drop_down_box";
import dxFileUploader, {
 Properties as dxFileUploaderProperties
} from "devextreme/ui/file_uploader";
import dxFilterBuilder, {
 Properties as dxFilterBuilderProperties
} from "devextreme/ui/filter_builder";
import dxHtmlEditor, {
 Properties as dxHtmlEditorProperties
} from "devextreme/ui/html_editor";
import dxLinearGauge, {
 Properties as dxLinearGaugeProperties
} from "devextreme/viz/linear_gauge";
import dxNumberBox, {
 Properties as dxNumberBoxProperties
} from "devextreme/ui/number_box";
import dxProgressBar, {
 Properties as dxProgressBarProperties
} from "devextreme/ui/progress_bar";
import dxRadioGroup, {
 Properties as dxRadioGroupProperties
} from "devextreme/ui/radio_group";
import dxRangeSelector, {
 Properties as dxRangeSelectorProperties
} from "devextreme/viz/range_selector";
import dxRangeSlider, {
 Properties as dxRangeSliderProperties
} from "devextreme/ui/range_slider";
import dxSlider, {
 Properties as dxSliderProperties
} from "devextreme/ui/slider";
import dxSwitch, {
 Properties as dxSwitchProperties
} from "devextreme/ui/switch";
import dxTextArea, {
 Properties as dxTextAreaProperties
} from "devextreme/ui/text_area";
import dxTextBox, {
 Properties as dxTextBoxProperties
} from "devextreme/ui/text_box";

import Validator, {
 Properties as ValidatorProperties
} from "devextreme/ui/validator";
import { FormContext } from "../dynamicForm";
import dxValidationGroup from "devextreme/ui/validation_group";
import { ValidationRule } from "devextreme/common";
import { ComponentProps } from "../core/Form";

export const genericComponents = [
  "AutocompleteField",
  "BulletField",
  "CalendarField",
  "CheckBoxField",
  "CircularGaugeField",
  "ColorBoxField",
  "DateBoxField",
  "DropDownBoxField",
  "FileUploaderField",
  "FilterBuilderField",
  "HtmlEditorField",
  "LinearGaugeField",
  "NumberBoxField",
  "ProgressBarField",
  "RadioGroupField",
  "RangeSelectorField",
  "RangeSliderField",
  "SelectBoxField",
  "SliderField",
  "SwitchField",
  // "TagBoxField", // giving error with undefined values
  "TextAreaField",
  "TextBoxField",
];
const getTextColumnValue = (value: any) => {
 if (value === true) {
  return 'True';
 } else if (value === false) {
  return 'False';
 }
 if (!value) {
  return '';
 }

 if (Array.isArray(value)) {
  value = value.map(v => getTextColumnValue(v)).join(", ");
 }

 return (G.isObject(value) ? JSON.stringify(value) : value)
};
export function GenericInputField(props: ComponentProps & { component: string, disabled: boolean }) {
 const formContext = useContext(FormContext);
  return (
    <div aria-labeledby={props["aria-labeledby"]}>
     <Show
      when={!props.disabled}
      fallback={getTextColumnValue(props.data.properties[props.meta.properties.id])}
     >
      <div
       // @ts-ignore
       ref={(el) => {
        let properties: any = {
         // This will work as initial value and setting value second time in createEffect will not call onValueChanged function.
         value: props.data.properties[props.meta.properties.id],
         onValueChanged: (e: any) => {
          props.setValue(props.meta, e.value);
         },
         validationGroup: formContext.validationGroup,
         disabled: props.disabled
        };
        let comp: any;

        if (props.component === "AutocompleteField") {
         comp = dxAutocomplete;
         Object.assign(properties, {} as dxAutocompleteProperties);
        } else if (props.component === "BulletField") {
         comp = dxBullet;
         Object.assign(properties, {} as dxBulletProperties);
        } else if (props.component === "CalendarField") {
         comp = dxCalendar;
         Object.assign(properties, {} as dxCalendarProperties);
        } else if (props.component === "CheckBoxField") {
         comp = dxCheckBox;
         Object.assign(properties, {
          enableThreeStateBehavior: true,
         } as dxCheckBoxProperties);
        } else if (props.component === "CircularGaugeField") {
         comp = dxCircularGauge;
         Object.assign(properties, {} as dxCircularGaugeProperties);
        } else if (props.component === "ColorBoxField") {
         comp = dxColorBox;
         Object.assign(properties, {} as dxColorBoxProperties);
        } else if (props.component === "DateBoxField") {
         comp = dxDateBox;
         Object.assign(properties, {} as dxDateBoxProperties);
        } else if (props.component === "DateBoxField") {
         comp = dxDateBox;
         Object.assign(properties, {} as dxDateBoxProperties);
        } else if (props.component === "DropDownBoxField") {
         comp = dxDropDownBox;
         // Specifies the currently selected value. May be an object if dataSource contains objects and valueExpr is not set.
         Object.assign(properties, {} as dxDropDownBoxProperties);
        } else if (props.component === "FileUploaderField") {
         comp = dxFileUploader;
         Object.assign(properties, {} as dxFileUploaderProperties);
        } else if (props.component === "FilterBuilderField") {
         comp = dxFilterBuilder;
         Object.assign(properties, {} as dxFilterBuilderProperties);
        } else if (props.component === "HtmlEditorField") {
         comp = dxHtmlEditor;
         Object.assign(properties, {} as dxHtmlEditorProperties);
        } else if (props.component === "LinearGaugeField") {
         comp = dxLinearGauge;
         Object.assign(properties, {} as dxLinearGaugeProperties);
        } else if (props.component === "NumberBoxField") {
         comp = dxNumberBox;
         Object.assign(properties, {} as dxNumberBoxProperties);
        } else if (props.component === "ProgressBarField") {
         comp = dxProgressBar;
         Object.assign(properties, {} as dxProgressBarProperties);
        } else if (props.component === "RadioGroupField") {
         comp = dxRadioGroup;
         Object.assign(properties, {} as dxRadioGroupProperties);
        } else if (props.component === "RangeSelectorField") {
         comp = dxRangeSelector;
         Object.assign(properties, {} as dxRangeSelectorProperties);
        } else if (props.component === "RangeSliderField") {
         comp = dxRangeSlider;
         Object.assign(properties, {} as dxRangeSliderProperties);
         // } else if(props.component === "SelectBoxField" ) {
         //  comp = dxSelectBox;
         //  Object.assign(properties, {} as dxSelectBoxProperties);
        } else if (props.component === "SliderField") {
         comp = dxSlider;
         Object.assign(properties, {} as dxSliderProperties);
        } else if (props.component === "SwitchField") {
         comp = dxSwitch;
         Object.assign(properties, {} as dxSwitchProperties);
         // } else if(props.component === "TagBoxField" ) {
         //  comp = dxTagBox;
         //  Object.assign(properties, {} as dxTagBoxProperties);
        } else if (props.component === "TextAreaField") {
         comp = dxTextArea;
         Object.assign(properties, {} as dxTextAreaProperties);
        } else if (props.component === "TextBoxField") {
         comp = dxTextBox;
         Object.assign(properties, {} as dxTextBoxProperties);
        } else {
         console.warn("Component not found", props.component);
         return "----";
        }

        const instance = new comp(el, properties);
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
        validatorInstance.meta = props.meta;

        createEffect(() => instance.option("value", props.data.properties[props.meta.properties.id]));
        createEffect(() => instance.option("disabled", props.disabled));

        createEffect(() => {
         for (const property in props.meta.properties.props as dxTextBoxProperties) {
          instance.option(property, props.meta.properties.props[property]);
         }
        });
        createEffect(() => validatorInstance.option("validationRules", props.meta.properties.props?.validationRules as Array<ValidationRule>));
       }}
      />
     </Show>
    </div>
  );
}
