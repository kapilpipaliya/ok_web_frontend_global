import {
 createEffect,
 createSignal,
 For,
 getOwner,
 Match,
 on,
 onMount,
 runWithOwner,
 Show,
 Switch
} from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { useParams, useNavigate, useLocation } from "solid-app-router";
import {
 createFormArray,
 createFormControl,
 createFormGroup,
 IFormArray,
 IFormControl,
 IFormGroup
} from "solid-forms";
import { D } from "@mobily/ts-belt";
import { klona } from "klona/json";
import { equals } from "rambda";

import {
 Field,
 TextInputField,
 TextAreaField,
 BooleanInputField,
 JsonInput,
 GeneralInput,
 SelectInputField,
 TableInputField,
 getDefaultValue,
 ButtonGroup,
 removeUndefinedProperties
} from "ok_web_components";
import {
 Id,
 SelectField,
 TableField,
 FormMetaData,
 InitialValues,
 FormResult,
 ButtonGroupField,
 ServerFormAttributeType
} from "ok_web_components/src/components/input/Form";
import { fetchAttributesTableData } from "../api";
import { toTitle } from "case-switcher-js";
import { getNewGraphId, getTxnId, graph } from "../../lib/graph";
import { DEBUG } from "../../config";
import {
 addNewVertex,
 newVertex,
 replaceVertexProperties
} from "../../lib/Vertex";
import {
 addNewEdge, newEdge,
 replaceEdgeProperties,
 updateEdgeStartAndEnd
} from "../../lib/Edge";

interface DynamicFormProps {
 formMetaData: FormMetaData;
 id?: Id;
 formGroup: ReturnType<typeof createFormGroup>;
 // all forms options:
 formValues: IFormGroup;
}

export function DynamicForm(props: DynamicFormProps) {
 let formData = props.formMetaData.attributes;

 const Form = () => {
  return <><For
   each={formData}>
   {(meta) => (
    <Switch>
     <Match when={meta.type === ServerFormAttributeType.String}>
      <TextInputField
       label={toTitle(meta.label || meta.id)}
       // @ts-ignore
       control={props.formGroup.controls[meta.id]}
       type={"text"}
       {...(meta.props || {})}
      />
     </Match>
     <Match when={meta.type === ServerFormAttributeType.JsCode}>
      <TextAreaField
       label={toTitle(meta.label || meta.id)}
       // @ts-ignore
       control={props.formGroup.controls[meta.id]}
       {...(meta.props || {})}
      />
     </Match>
     <Match when={meta.type === ServerFormAttributeType.Boolean}>
      <BooleanInputField
       label={toTitle(meta.label || meta.id)}
       type="checkbox"
       // @ts-ignore
       control={props.formGroup.controls[meta.id]}
       {...(meta.props || {})}
      />
     </Match>
     <Match when={meta.type === ServerFormAttributeType.Object}>
      <Field label={toTitle(meta.label || meta.id)}>
       <JsonInput
        // @ts-ignore
        control={props.formGroup.controls[meta.id]}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
     <Match when={meta.type === ServerFormAttributeType.Dynamic}>
      <Field label={toTitle(meta.label || meta.id)}>
       <GeneralInput
        // @ts-ignore
        control={props.formGroup.controls[meta.id]}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
     <Match when={meta.type === ServerFormAttributeType.Select}>
      <Field label={toTitle(meta.label || meta.id)}>
       <SelectInputField
        // @ts-ignore
        control={props.formGroup.controls[meta.id]}
        valueKey={(meta as SelectField).valueKey}
        fetchOptions={async (inputValue: string) => (meta as SelectField).fetchOptions(props.formValues, props.formGroup, inputValue)}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
     <Match when={meta.type === ServerFormAttributeType.Table}>
      <Field label={toTitle(meta.label || meta.id)}>
       <TableInputField
        // @ts-ignore
        control={props.formGroup.controls[meta.id]}
        attributes={(meta as TableField).attributes}
        defaultValue="undefined"
        data={(meta as TableField).data}
        defaultValueFn={(meta as TableField).defaultValueFn}
        formValues={props.formValues}
        noSort={(meta as TableField).noSort}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
     <Match when={meta.type === ServerFormAttributeType.TableForm}>
      <Field label={toTitle(meta.label || meta.id)}>
       <TableInputField
        type={"form"}
        component={DynamicFormSequence}
        forms={fetchAttributesTableData((meta as TableField).form!)}
        postSubmit={(tableItemFormGroup, values) => (meta as TableField).postSubmit(props.formValues, props.formGroup, tableItemFormGroup, values)}
        // @ts-ignore
        control={props.formGroup.controls[meta.id]}
        attributes={(meta as TableField).attributes}
        defaultValue="undefined"
        data={(meta as TableField).data}
        defaultValueFn={(meta as TableField).defaultValueFn}
        formValues={props.formValues}
        noSort={(meta as TableField).noSort}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
     <Match when={meta.type === ServerFormAttributeType.ButtonGroup}>
      <Field label={toTitle(meta.label || meta.id)}>
       <ButtonGroup
        // @ts-ignore
        control={props.formGroup}
        items={(meta as ButtonGroupField).buttons}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
    </Switch>
   )}
  </For>

  </>;
 };
 return <Form />;
}

interface DynamicFormSequenceProps {
 // either entity or forms is required
 entity?: string;
 forms?: FormMetaData[];
 postSubmit?: (values: FormResult) => void;
 id?: Id;
 txnId?: number;
}

export const DynamicFormSequence = (props: DynamicFormSequenceProps) => {
 const txnId = props.txnId || getTxnId();
 const [formRef, setFormRef] = createSignal<HTMLFormElement>();
 onMount(() => {
  const form = formRef();
  form.querySelector("input").focus();
 });
 const location = useLocation();
 const navigate = useNavigate();

 const formMetaData = props.forms || fetchAttributesTableData(props.entity) as FormMetaData[];

 const formValuesConstructor = formMetaData.reduce((acc, curr) => {
  acc[curr.id] = createFormGroup({});
  return acc;
 }, {} as { [key: string]: ReturnType<typeof createFormGroup> });
 const formValues = createFormGroup(formValuesConstructor);

 const [initialValues, setInitialValues] = createStore({} as InitialValues);

 // use a signal to show form because `Object.keys(form.controls).length` is not reactive
 const [fetching, setFetching] = createSignal(true);
 // Todo when any fetching is true, dont display the forms:
 // setValuesToEach Form:
 const owner = getOwner();
 formMetaData.forEach((form) => {
  const formGroup = formValues.controls[form.id];
  const groupConstructor = form.attributes.reduce((acc, meta) => {
   runWithOwner(owner, () => {
    if (meta.type === "buttongroup") {
     console.log("buttongroup skipped");
    } else if (meta.type === "table" || meta.type === "table_forms") {
     acc[meta.id] = createFormArray([], meta.fieldOptions);
    } else {
     const iFormControl = createFormControl(getDefaultValue(meta.type), meta.fieldOptions);
     acc[meta.id] = iFormControl;
     if (meta.onchange) {
      // if problem occur use rawValue
      createEffect(on(() => iFormControl.value, (v) => meta.onchange?.(formGroup, v as Id), { defer: true }));
     }
    }
   });
   return acc;
  }, {} as { [key: string]: IFormControl | ReturnType<typeof createFormArray> });

  formGroup.setControls(groupConstructor);

  const setDefaultValueIfEmpty = (properties: { [key: string]: any }) => {
   form.attributes.forEach(meta => {
    if (meta.default) {
     if (!properties[meta.id])
      properties[meta.id] = meta.default(formValues, formGroup);
    }
   });
  };
  if (props.id) {
   const data = form.data?.(props.id);
   if (data) {
    setDefaultValueIfEmpty(data.properties);
    setInitialValues(form.id, reconcile(data));
    // set non table values
    const value = D.selectKeys(data.properties, form.attributes.filter(attr => attr.type !== "table" && attr.type !== "table_forms").map(attrMeta => attrMeta.id));
    if (D.isNotEmpty(value)) formGroup.patchValue(value);

    // table will load data themself
    const tableAttributes = form.attributes.filter(attr => attr.type === "table" || attr.type === "table_forms");
    if (tableAttributes.length) {
     tableAttributes.forEach((tableAttrMeta: TableField) => tableAttrMeta.data = data.properties[tableAttrMeta.id]);
    }
   } else if (form.save[0] === "vertex") {
    // used FormMetaData.save attribute temporary.
    const vertex = graph.vertexes[props.id];

    if (!vertex) {
     alert(`document with id: ${props.id} not exist`);
     return;
    }
    setDefaultValueIfEmpty(vertex.properties);
    setInitialValues(form.id, reconcile(vertex));
    const value = D.selectKeys(vertex.properties, form.attributes.filter(attr => attr.type !== "table" && attr.type !== "table_forms").map(attrMeta => attrMeta.id));
    if (D.isNotEmpty(value)) formGroup.patchValue(value);

    // load table data when required
   } else if (form.save[0] === "edge") {
    const edge = graph.edges[props.id];

    if (!edge) {
     alert(`Edge with id: ${props.id} not exist`);
     return;
    }
    setDefaultValueIfEmpty(edge.properties);
    setInitialValues(form.id, reconcile(data));
    const value = D.selectKeys(edge.properties, form.attributes.filter(attr => attr.type !== "table" && attr.type !== "table_forms").map(attrMeta => attrMeta.id));
    if (D.isNotEmpty(value)) formGroup.patchValue(value);

    // load table data when required
   }
   // setFetching(false);
  } else {
   setInitialValues(form.id, reconcile({
    id: undefined,
    properties: formGroup.value
   }));
  }
 });
 setFetching(false);
 console.log("initialValues: ", initialValues);

 const onSubmit = (e) => {
  e.preventDefault();
  let index = 0;
  const length = formMetaData.length;
  const results: FormResult = new Map();

  const callMethod = (): Promise<any> => {
   const form = formMetaData[index++];
   if (form) {
    const formValue = klona(formValues.controls[form.id].value);
    const value = D.selectKeys(formValue, form.attributes.filter(attr => attr.type !== "table" && attr.type !== "table_forms").map(attrMeta => attrMeta.id));
    const initialValue = initialValues[form.id];
    const id = initialValue["id"] || props.id;
    if (form.save[0] === "vertex") {
     const result_ = {};
     if (!id) {
      result_["id"] = getNewGraphId();
      addNewVertex(txnId, newVertex(result_["id"], [form.save[1]], value));
     } else {
      if (D.isNotEmpty(value) && !equals(removeUndefinedProperties(initialValue.properties, false, 10), removeUndefinedProperties(value, false, 10))) {
       replaceVertexProperties(txnId, initialValue.id, value);
       result_["id"] = initialValue.id;
      }
     }
     return Promise.resolve(result_);
    } else if (form.save[0] === "edge") {
     const start = form.save[2]?.(results, formValue);
     const end = form.save[3]?.(results, formValue);
     let result_ = {} as typeof initialValue;
     if (start && end) {
      if (!id) {
       const newId = getNewGraphId();
       addNewEdge(txnId, newEdge(newId, form.save[1], value, start, end));
       result_ = { id: newId, properties: value, start, end };
      } else {
       // currently not removing table properties because we dont have a case where we have an edge(with start and end functions) with table attribute
       if (D.isNotEmpty(value) && !equals(removeUndefinedProperties(initialValue.properties, false, 10), removeUndefinedProperties(value, false, 10))) {
        replaceEdgeProperties(txnId, initialValue.id, value);
       }
       if (initialValue.start !== start || initialValue.end !== end) {
        updateEdgeStartAndEnd(txnId, initialValue.id, start, end);
       }
       result_ = { id: initialValue.id, properties: value, start, end };
      }
     }
     form.attributes.filter(form_ => form_.type === "table" || form_.type == "table_forms").forEach(attrMeta => {
      const tableValue = formValue[attrMeta.id];
      const initValue = initialValue.properties[attrMeta.id];
      if (!equals(removeUndefinedProperties(initValue, false, 10), removeUndefinedProperties(tableValue, false, 10))) {
       const newSavedIds = (attrMeta as TableField).save(txnId, results, formValue[attrMeta.id]);
       if (!result_["properties"]) result_["properties"] = {};
       result_["properties"][attrMeta.id] = formValue[attrMeta.id].map((row, index) => {
        row.id = newSavedIds[index];
        ((formValues.controls[form.id].controls[attrMeta.id] as IFormArray).controls[index] as IFormGroup).controls["id"].setValue(row.id);
        return row;
       });
      }
     });
     return Promise.resolve(result_);
    } else {
     return Promise.resolve({});
    }
   } else {
    return Promise.resolve({});
   }
  };

  return new Promise<FormResult>((res) => {
   const checkAndCall = () => {
    if (index < length) {
     callMethod().then(result => {
      const formId = formMetaData[index - 1].id;
      setInitialValues(formId, reconcile(Object.assign({}, initialValues[formId], { properties: formValues.controls[formId].value }, result)));
      results.set(formId, initialValues[formId]);
      checkAndCall();
     });
    } else {
     res(results);
    }
   };
   checkAndCall();
  }).then((result) => {
   if (props.postSubmit) {
    props.postSubmit(result);
    console.log(initialValues);
   } else {
    navigate(location.pathname.split("/").slice(0, -1).join("/"));
   }
  });
 };

 const isValid = () => {
  return formMetaData.map(form => formValues.controls[form.id].isValid).every(v => v === true);
 };
 const isDataChanged = () => {
  const result = formMetaData.map(form => {
   console.log(1, 2, removeUndefinedProperties(initialValues[form.id].properties, false, 10), removeUndefinedProperties(formValues.controls[form.id].value, false, 10))
   return equals(removeUndefinedProperties(initialValues[form.id].properties, false, 10), removeUndefinedProperties(formValues.controls[form.id].value, false, 10))
  });
  return result.some(v => v === false);
 };

 return <Show when={!fetching()} fallback={<>Loading</>}>
  <form onSubmit={onSubmit} ref={setFormRef}>
   <For each={formMetaData}>
    {item => <DynamicForm formMetaData={item} id={props.id}
                          formGroup={formValues.controls[item.id]}
                          formValues={formValues}
    />}
   </For>
   <ui5-button design="Positive" onclick={onSubmit}
               disabled={!isValid() || !isDataChanged()}>Save
   </ui5-button>
   <pre>
    {DEBUG && <br />}
    {DEBUG && JSON.stringify(initialValues)}
    {DEBUG && <>InitialValues:<br /></>}
    {DEBUG && JSON.stringify(formValues.value)}
   </pre>
  </form>
 </Show>;
};