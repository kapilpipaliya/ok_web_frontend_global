import {
  Match,
  Show,
  Switch,
} from "solid-js";

import { IdAttr } from "../../lib/graph";
import { getTextColumnValue } from "./Components/Utils";
import { ComponentProps } from "../ComponentType";
import {
  Button,
  Progress,
  TextField,
} from "../solid-blocks/blocks";
import {RadioGroup, Checkbox, NumberInput, Avatar} from '@ark-ui/solid'
import { PageItemRender } from "./GenaricField";
import { ColorBox } from "../solid-blocks/blocks/colorbox";
import { FileUploader } from "../solid-blocks/blocks/fileuploader";
import { setSelectedId } from "../pageStore";


export function GenericInputField(
  props: ComponentProps & {
    component: string;
    disabled: boolean;
    txnId: number;
  }
) {
  // const formContext = useContext(FormContext);
  // const outerOwner = getOwner();
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
        <Switch>
          <Match when={props.component === "Form"}>
            <PageItemRender metaVertex={props.meta} />
          </Match>
          <Match when={props.component === "FormSubmit"}>
            <Button
              onClick={() => setSelectedId(props.meta.id)}
              {...props.meta.P.props}
            >
              {props.data?.P[props.meta.P[IdAttr]] ??
                props.meta.P.props.children}
            </Button>
          </Match>
          <Match when={props.component === "FormCancel"}>
            <Button
              onClick={() => setSelectedId(props.meta.id)}
              {...props.meta.P.props}
            >
              {props.data?.P[props.meta.P[IdAttr]] ??
                props.meta.P.props.children}
            </Button>
          </Match>
          <Match when={props.component === "TableColumn"}>
            <PageItemRender metaVertex={props.meta} />
          </Match>
          <Match when={props.component === "CheckBox"}>

            <Checkbox.Root {...props.meta?.P.props} onCheckedChange={(e) => {
              props.setValue?.(props.meta, props.data, e.checked)
            }}>
              <Checkbox.Control />
              <Checkbox.Label >{props.meta?.P.props?.text}</Checkbox.Label>
            </Checkbox.Root>

          </Match>
          <Match when={props.component === "ColorBox"}>
            <ColorBox
              {...props.meta?.P.props}
              colorPick={props.meta?.P.props?.pickColor ?? true}
            />
          </Match>
          <Match when={props.component === "DropDownBox"}>Dropdown</Match>
          <Match when={props.component === "FileUploader"}>
            <FileUploader
              {...props.meta?.P.props}
              image={props.meta?.P.props.image}
            />
          </Match>
          <Match when={props.component === "HtmlEditor"}>
            {props.data?.P[props.meta.P[IdAttr]]}
          </Match>
          <Match when={props.component === "NumberBox"}>
            <TextField
              placeholder={props.meta?.P.props.label ?? ""}
              onChange={(e: any) => {
                props.setValue?.(props.meta, props.data, e.target.value);
              }}
              {...props.meta?.P.props}
              isNumber
              value={props.data?.P[props.meta.P[IdAttr]]}
            />
          </Match>
          <Match when={props.component === "Radio"}>
            <RadioGroup.Item
              {...props.meta?.P.props}
            >
              <RadioGroup.ItemText>{props.meta?.P.props?.label ?? "radio"}</RadioGroup.ItemText>
              <RadioGroup.ItemControl />
            </RadioGroup.Item>
          </Match>
          <Match when={props.component === "ProgressBar"}>
            <Progress
              style={{ ...props.meta?.P.props }}
              {...props.meta?.P.props}
            />
          </Match>
          <Match when={props.component === "RadioGroup"}>
            <RadioGroup.Root
              value={props.data?.P[props.meta.P[IdAttr]] ?? ""}
              onValueChange={(details) => {
                props.setValue?.(
                  props.meta,
                  props.data as any,
                  details.value
                );
            }}>
              <PageItemRender metaVertex={props.meta} />
            </RadioGroup.Root>
          </Match>
          <Match when={props.component === "Switch"}>
            <Checkbox
              {...props.meta?.P.props}
              switch
              onchange={(e: any) => {
                props.setValue?.(props.meta, props.data, e.target.checked);
              }}
              align="left"
              children={props.meta?.P.props?.label ?? "switch"}
            />
          </Match>
          <Match when={props.component === "TextArea"}>
            <TextField
              class="global-style"
              onChange={(e: any) => {
                props.setValue?.(props.meta, props.data, e.target.value);
              }}
              placeholder={props.meta?.P.props?.label}
              {...props.meta?.P.props}
              multiline
              value={props.data?.P[props.meta.P[IdAttr]]}
            />
          </Match>
          <Match when={props.component === "TextBox"}>
            <TextField
                label={''}
              class="global-style"
              placeholder={props.meta?.P.props?.label}
              onChange={(e: any) => {
                props.setValue?.(props.meta, props.data, e.target.value);
              }}
              value={props.data?.P[props.meta.P[IdAttr]]}
            />
          </Match>
        </Switch>
        {/*<div
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
                      formData.append(
                          "",
                          file,
                          file.name
                      );
                      const setResult = (media: {}[]) => {
                        runWithOwner(outerOwner, () => {
                          // props.setValue!(props.meta, props.data!, media[0]);
                          for (const m of media) {
                            if (m) {
                              mergeVertexProperties(props.txnId, props.data.id, {...m.P, id: m.id});
                            }
                          }
                        })
                      }

                      // TODO: Delete Temp file vertex after form is saved.
                      fetch("http://49.12.190.36:1401/api/upload", {
                        method: "POST",
                        body: formData,
                        headers: {temp: "true"},
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
                    } else if (data.event || props.component === "FilterBuilder") {
                      props.setValue(props.meta, props.data, data.value);
                    }
                  })
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
                  value: []
                } as dxFileUploaderProperties);
              } else if (props.component === "FilterBuilder") {
                comp = dxFilterBuilder;
                const fields = getValueFromVertexOrKey(props.meta.P.props, "fields") || [{
                  dataField: 'name',
                  dataType: 'string',
                }];
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
                  autoResizeEnabled: true
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
                  getValueFromVertexOrKey(props.meta.P.props || {}, "validationRules") as Array<ValidationRule>,
                 ),
                );
              }
              // } catch (e) {
              //  console.log('cant set validator for', props.component, e);
              // }

              // set value:
              createEffect(() => {
                if (!props.data) return;
                let value = props.data.P[props.meta.P[IdAttr]];
                if (props.component === "FilterBuilder" || props.component === "FileUploader") {
                  if (!value) {
                    value = [];
                  } else if (Object.keys(value).length === 0) {
                    value = [];
                  }

                  else if (!Array.isArray(value)) {
                    value = [value];
                  }
                }
                instance.option("value", value);
                if (props.component === "TextArea") {
                  instance.option("hint", value)
                }
              });
              createEffect(() => instance.option("disabled", props.disabled));

              createEffect(() => {
                for (const property in props.meta.P.props) {// as dxTextBoxProperties
                  let value = getValueFromVertexOrKey(props.meta.P.props, property);
                  if (property === "items" && typeof value === "string") {
                    value = value.split("\n");
                  }
                  instance.option(property, value);
                }
              });
              onCleanup(() => instance.dispose());
            })
          }}
        />*/}
      </Show>
    </div>
  );
}

// Note:
// what if some properties are removed from meta.
// We should remember previous keys and remove when some keys are changed.
