import {
  createEffect,
  getOwner,
  onCleanup,
  runWithOwner,
  Show,
  useContext,
} from "solid-js";
// Comment This Lines in web build
import dxAutocomplete, {
  Properties as dxAutocompleteProperties,
} from "devextreme/ui/autocomplete";
import dxBullet, {
  Properties as dxBulletProperties,
} from "devextreme/viz/bullet";
import dxCalendar, {
  Properties as dxCalendarProperties,
} from "devextreme/ui/calendar";
import dxCheckBox, {
  Properties as dxCheckBoxProperties,
} from "devextreme/ui/check_box";
import dxCircularGauge, {
  Properties as dxCircularGaugeProperties,
} from "devextreme/viz/circular_gauge";
import dxColorBox, {
  Properties as dxColorBoxProperties,
} from "devextreme/ui/color_box";
import dxDateBox, {
  Properties as dxDateBoxProperties,
} from "devextreme/ui/date_box";
// import dxDropDownBox, {Properties as dxDropDownBoxProperties} from "devextreme/ui/drop_down_box";
import dxFileUploader, {
  Properties as dxFileUploaderProperties,
} from "devextreme/ui/file_uploader";
import dxFilterBuilder, {
  Properties as dxFilterBuilderProperties,
} from "devextreme/ui/filter_builder";
import dxHtmlEditor, {
  Properties as dxHtmlEditorProperties,
} from "devextreme/ui/html_editor";
import dxLinearGauge, {
  Properties as dxLinearGaugeProperties,
} from "devextreme/viz/linear_gauge";
import dxNumberBox, {
  Properties as dxNumberBoxProperties,
} from "devextreme/ui/number_box";
import dxProgressBar, {
  Properties as dxProgressBarProperties,
} from "devextreme/ui/progress_bar";
import dxRadioGroup, {
  Properties as dxRadioGroupProperties,
} from "devextreme/ui/radio_group";
import dxRangeSelector, {
  Properties as dxRangeSelectorProperties,
} from "devextreme/viz/range_selector";
import dxRangeSlider, {
  Properties as dxRangeSliderProperties,
} from "devextreme/ui/range_slider";
import dxSlider, {
  Properties as dxSliderProperties,
} from "devextreme/ui/slider";
import dxSwitch, {
  Properties as dxSwitchProperties,
} from "devextreme/ui/switch";
import dxTextArea, {
  Properties as dxTextAreaProperties,
} from "devextreme/ui/text_area";
import dxTextBox, {
  Properties as dxTextBoxProperties,
} from "devextreme/ui/text_box";

import Validator from "devextreme/ui/validator";
import { ValidationRule } from "devextreme/common";

import { ComponentProps } from "../../types/Component";
import { IdAttr } from "../../lib/graph";
import { FormContext, isUpdatingInput } from "../../lib/Record";
import { getValueFromVertexOrKey } from "../../utils/utils";
import { mergeVertexProperties } from "../../lib/Vertex";
import { getTextColumnValue } from "./GenaricField";

export function GenericInputField(
  props: ComponentProps & {
    component: string;
    disabled: boolean;
    txnId: number;
  }
) {
  const formContext = useContext(FormContext);
  const outerOwner = getOwner();
  return (
    <div
      aria-labeledby={props["aria-labeledby"]}
      classList={{
        "width:100%": props.component === "TextArea",
      }}
    >
      <Show
        when={!props.disabled}
        fallback={getTextColumnValue(props.data?.P[props.meta.P[IdAttr]])}
      >
        <div
          // @ts-ignore
          ref={(el) => {
            runWithOwner(outerOwner, () => {
              let attributes: any = {
                // This will work as initial value and setting value second time in createEffect will not call onValueChanged function.
                value: props.data?.P[props.meta.P[IdAttr]],
                onValueChanged: (data: any) => {
                  runWithOwner(outerOwner, () => {
                    if (!props.data || !props.setValue) return;
                    // note: valueChanged is fired even when the value is changed programmatically,
                    // that is causing problem: when transaction is reverted, it again calls onValueChanged callback.
                    // used data.event check to prevent this.
                    if (props.component === "FileUploader") {
                      // data.event is always undefined
                      const file = data.component._files[0]?.value;
                      if (!file) return;
                      props.setValue(props.meta, props.data, file);
                      let formData = new FormData();
                      formData.append("", file, file.name);
                      const setResult = (media: {}[]) => {
                        runWithOwner(outerOwner, () => {
                          // props.setValue!(props.meta, props.data!, media[0]);
                          for (const m of media) {
                            if (m) {
                              mergeVertexProperties(
                                props.txnId,
                                props.data.id,
                                { ...m.P, id: m.id }
                              );
                            }
                          }
                        });
                      };

                      // TODO: Delete Temp file vertex after form is saved.
                      fetch("http://49.12.190.36:1401/api/upload", {
                        method: "POST",
                        body: formData,
                        headers: { temp: "true" },
                        // redirect: "follow",
                        // mode: "no-cors",
                      })
                        .then((response) => response.json())
                        .then((result) => {
                          if (result.media) {
                            setResult(result.media);
                          }
                        })
                        .catch((error) => console.log("error", error));
                    } else if (
                      data.event ||
                      props.component === "FilterBuilder"
                    ) {
                      props.setValue(props.meta, props.data, data.value);
                    }
                  });
                },
                // onChange: (e: any) => {
                //   props.setValue(props.meta, props.data, e.value);
                // },
                validationGroup: formContext.validationGroup,
                disabled: props.disabled,
              };
              let comp: any;

              if (props.component === "Autocomplete") {
                comp = dxAutocomplete;
                // autocomplete is just like text box, but it allows user to preselect some values.
                Object.assign(attributes, {} as dxAutocompleteProperties);
              } else if (props.component === "Bullet") {
                comp = dxBullet;
                Object.assign(attributes, {
                  // target: 30,
                } as dxBulletProperties);
              } else if (props.component === "Calendar") {
                comp = dxCalendar;
                Object.assign(attributes, {} as dxCalendarProperties);
              } else if (props.component === "CheckBox") {
                comp = dxCheckBox;
                Object.assign(attributes, {
                  enableThreeStateBehavior: true,
                } as dxCheckBoxProperties);
              } else if (props.component === "CircularGauge") {
                comp = dxCircularGauge;
                Object.assign(attributes, {} as dxCircularGaugeProperties);
              } else if (props.component === "ColorBox") {
                comp = dxColorBox;
                Object.assign(attributes, {} as dxColorBoxProperties);
              } else if (props.component === "DateBox") {
                comp = dxDateBox;
                Object.assign(attributes, {} as dxDateBoxProperties);
              } else if (props.component === "DateBox") {
                comp = dxDateBox;
                Object.assign(attributes, {} as dxDateBoxProperties);
              } else if (props.component === "DropDownBox") {
                // DropDownBox is very advanced we can use custom dropdown in the field. so its not supported yet.
                return "not supported yet";
                comp = dxDropDownBox;
                // Specifies the currently selected value. May be an object if dataSource contains objects and valueExpr is not set.
                Object.assign(attributes, {} as dxDropDownBoxProperties);
              } else if (props.component === "FileUploader") {
                comp = dxFileUploader;
                Object.assign(attributes, {
                  // selectButtonText: "Select file",
                  // labelText: "",
                  // accept: "image/*",
                  // uploadMode: "instantly",
                  uploadMode: "useForm",
                  value: [],
                } as dxFileUploaderProperties);
              } else if (props.component === "FilterBuilder") {
                comp = dxFilterBuilder;
                const fields = getValueFromVertexOrKey(
                  props.meta.P.props,
                  "fields"
                ) || [
                  {
                    dataField: "name",
                    dataType: "string",
                  },
                ];
                Object.assign(attributes, {
                  value: [],
                  // allowHierarchicalFields: true,
                  // onEditorPreparing: function (e) {
                  //   e.editorOptions.width = 125;
                  // },
                  // at least one field is required, else component is giving error.
                  fields,
                } as dxFilterBuilderProperties);
              } else if (props.component === "HtmlEditor") {
                comp = dxHtmlEditor;
                Object.assign(attributes, {
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
                Object.assign(attributes, {} as dxLinearGaugeProperties);
              } else if (props.component === "NumberBox") {
                comp = dxNumberBox;
                Object.assign(attributes, {} as dxNumberBoxProperties);
              } else if (props.component === "ProgressBar") {
                comp = dxProgressBar;
                Object.assign(attributes, {
                  min: 0,
                  max: 100,
                  width: "90%",
                  statusFormat(ratio) {
                    return `Loading: ${ratio * 100}%`;
                  },
                  onComplete(e) {
                    if (!props.data || !props.setValue) return;
                    props.setValue(props.meta, props.data, "completed");
                  },
                } as dxProgressBarProperties);
              } else if (props.component === "RadioGroup") {
                comp = dxRadioGroup;
                // radioBox can support any value in the array, it will return the value on onChange like object.
                Object.assign(attributes, {} as dxRadioGroupProperties);
              } else if (props.component === "RangeSelector") {
                comp = dxRangeSelector;
                Object.assign(attributes, {
                  // scale: {
                  //   startValue: 0,
                  //   endValue: 100,
                  //   tickInterval: 10,
                  //   minorTickInterval: 2,
                  //   minorTick: {
                  //     visible: true,
                  //   },
                  //   label: {
                  //     format: {
                  //       type: "decimal",
                  //     },
                  //   },
                  // },
                  // sliderMarker: {
                  //   format: {
                  //     type: "decimal",
                  //   },
                  // },
                  // value: [20, 80],
                } as dxRangeSelectorProperties);
              } else if (props.component === "RangeSlider") {
                comp = dxRangeSlider;
                Object.assign(attributes, {
                  // min: 0,
                  // max: 100,
                  // start: 20,
                  // end: 80,
                  // label: {
                  //   visible: true,
                  //   format(value: number) {
                  //     return `${value}%`;
                  //   },
                  // },
                } as dxRangeSliderProperties);
                // } else if(props.component === "SelectBox" ) {
                //  comp = dxSelectBox;
                //  Object.assign(attributes, {} as dxSelectBoxProperties);
              } else if (props.component === "Slider") {
                comp = dxSlider;
                Object.assign(attributes, {
                  // min: 0,
                  // max: 100,
                } as dxSliderProperties);
              } else if (props.component === "Switch") {
                comp = dxSwitch;
                Object.assign(attributes, {} as dxSwitchProperties);
                // } else if(props.component === "TagBox" ) {
                //  comp = dxTagBox;
                //  Object.assign(attributes, {} as dxTagBoxProperties);
              } else if (props.component === "TextArea") {
                comp = dxTextArea;
                Object.assign(attributes, {
                  autoResizeEnabled: true,
                } as dxTextAreaProperties);
              } else if (props.component === "TextBox") {
                comp = dxTextBox;
                Object.assign(attributes, {} as dxTextBoxProperties);
              } else {
                console.warn("Component not found", props.component);
                return "----";
              }
              // if (displayExpr.includes(props.component) && !props.meta.P.props?.displayExpr?.P.value) {
              //  Object.assign(attributes, {displayExpr: ''});
              // }
              // if (valueExpr.includes(props.component) && !props.meta.P.props?.valueExpr?.P.value) {
              //  Object.assign(attributes, {valueExpr: ''});
              // }
              // if (dataSource.includes(props.component) && !props.meta.P.props?.dataSource?.P.value) {
              //  Object.assign(attributes, {dataSource: ''});
              // }
              // if (items.includes(props.component) && !props.meta.P.props?.items?.P.value) {
              //  Object.assign(attributes, {items: ''});
              // }

              const instance = new comp(el, attributes);

              // try {
              if (
                ![
                  "Autocomplete",
                  "Bullet",
                  "CircularGauge",
                  "FilterBuilder",
                  "LinearGauge",
                ].includes(props.component)
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
                    getValueFromVertexOrKey(
                      props.meta.P.props || {},
                      "validationRules"
                    ) as Array<ValidationRule>
                  )
                );
              }
              // } catch (e) {
              //  console.log('cant set validator for', props.component, e);
              // }

              // set value:
              createEffect(() => {
                if (isUpdatingInput) return;
                if (!props.data) return;
                let value = props.data.P[props.meta.P[IdAttr]];
                if (
                  props.component === "FilterBuilder" ||
                  props.component === "FileUploader"
                ) {
                  if (!value) {
                    value = [];
                  } else if (Object.keys(value).length === 0) {
                    value = [];
                  } else if (!Array.isArray(value)) {
                    value = [value];
                  }
                }
                instance.option("value", value);
                if (props.component === "TextArea") {
                  instance.option("hint", value);
                }
              });
              createEffect(() => instance.option("disabled", props.disabled));

              createEffect(() => {
                for (const property in props.meta.P.props) {
                  // as dxTextBoxProperties
                  let value = getValueFromVertexOrKey(
                    props.meta.P.props,
                    property
                  );
                  if (property === "items" && typeof value === "string") {
                    value = value.split("\n");
                  }
                  instance.option(property, value);
                }
              });
              onCleanup(() => instance.dispose());
            });
          }}
        />
      </Show>
    </div>
  );
}

// Note:
// what if some properties are removed from meta.
// We should remember previous keys and remove when some keys are changed.
