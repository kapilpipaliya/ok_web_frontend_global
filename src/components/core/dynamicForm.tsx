import {
 createEffect,
 createSignal,
 For,
 getOwner,
 Match, on, onMount,
 runWithOwner,
 Show,
 Switch
} from "solid-js";
import { useParams, useNavigate, useLocation } from "solid-app-router";
import {
 createFormArray,
 createFormControl,
 createFormGroup, IFormArray,
 IFormControl, IFormGroup
} from "solid-forms";
import { D } from "@mobily/ts-belt";
import {
 Field,
 TextInputField,
 BooleanInputField,
 JsonInput,
 GeneralInput,
 SelectInputField,
 TableInputField,
 getDefaultValue,
 ButtonGroup
} from "ok_web_components";
import {
 addEdge,
 addNode,
 fetchAttributesTableData,
 fetchDocument, fetchEdge, updateEdgeWithStartAndEnd,
 updateNode
} from "../api";
import { toTitle } from "case-switcher-js";
import { klona } from "klona/json";
import { Id } from "../../lib/graph";
import {removeUndefinedProperties} from 'ok_web_components';
import {
 SelectField,
 TableField,
 FormMetaData,
 InitialValues,
 FormResult,
 ButtonGroupField
} from "ok_web_components/src/components/input/Form";
import {equals} from 'rambda';
import { DEBUG } from "../../config";
import { createStore, reconcile } from "solid-js/store";

interface DynamicFormProps {
 formMetaData: FormMetaData;
 id?: Id;
 formGroup: ReturnType<typeof createFormGroup>
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
     <Match when={meta.type === "string"}>
      <TextInputField
       label={toTitle(meta.label || meta.key)}
       // @ts-ignore
       control={props.formGroup.controls[meta.key]}
       type={"text"}
      />
     </Match>
     <Match when={meta.type === "boolean"}>
      <BooleanInputField
       label={toTitle(meta.label || meta.key)}
       type="checkbox"
       // @ts-ignore
       control={props.formGroup.controls[meta.key]}
      />
     </Match>
     <Match when={meta.type === "object"}>
      <Field label={toTitle(meta.label || meta.key)}>
       <JsonInput
        // @ts-ignore
        control={props.formGroup.controls[meta.key]} />
      </Field>
     </Match>
     <Match when={meta.type === "dynamic"}>
      <Field label={toTitle(meta.label || meta.key)}>
       <GeneralInput
        // @ts-ignore
        control={props.formGroup.controls[meta.key]}
       />
      </Field>
     </Match>
     <Match when={meta.type === "select"}>
      <Field label={toTitle(meta.label || meta.key)}>
       <SelectInputField
        // @ts-ignore
        control={props.formGroup.controls[meta.key]}
        valueKey={(meta as SelectField).valueKey}
        fetchOptions={async (inputValue: string) => (meta as SelectField).fetchOptions(props.formValues, props.formGroup, inputValue)}
       />
      </Field>
     </Match>
     <Match when={meta.type === "table"}>
      <Field label={toTitle(meta.label || meta.key)}>
       <TableInputField
        // @ts-ignore
        control={props.formGroup.controls[meta.key]}
        attributes={(meta as TableField).attributes}
        defaultValue="undefined"
        data={(meta as TableField).data}
        defaultValueFn={(meta as TableField).defaultValueFn}
        formValues={props.formValues}
        noSort={(meta as TableField).noSort}
       />
      </Field>
     </Match>
     <Match when={meta.type === "table_forms"}>
      <Field label={toTitle(meta.label || meta.key)}>
       <TableInputField
        type={"form"}
        component={DynamicFormSequence}
        forms={fetchAttributesTableData((meta as TableField).form!)}
        postSubmit={(tableItemFormGroup, values)=>(meta as TableField).postSubmit(props.formValues, props.formGroup,tableItemFormGroup, values)}
        // @ts-ignore
        control={props.formGroup.controls[meta.key]}
        attributes={(meta as TableField).attributes}
        defaultValue="undefined"
        data={(meta as TableField).data}
        defaultValueFn={(meta as TableField).defaultValueFn}
        formValues={props.formValues}
        noSort={(meta as TableField).noSort}
       />
      </Field>
     </Match>
     <Match when={meta.type === "buttongroup"}>
      <Field label={toTitle(meta.label || meta.key)}>
       <ButtonGroup
        // @ts-ignore
        control={props.formGroup}
        items={(meta as ButtonGroupField).buttons}
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
  forms?: FormMetaData[]
  entity?: string; // currently not used
  postSubmit?: (values: FormResult)=>void
  id?: Id;
}
export const DynamicFormSequence = (props: DynamicFormSequenceProps) => {
 const [formRef, setFormRef] = createSignal<HTMLFormElement>();
 onMount(()=>{
  const form = formRef();
  form.querySelector("input").focus();
 })

 const params = useParams();
 const navigate = useNavigate();
 const location = useLocation();
 const entity = () => props.entity || params.entity;
 const mainId = () => {
  if (props.id === undefined && params.id === "new") {
   return undefined;
  } else if(props.id == "new") {
   return undefined;
  } else {
   return props.id === undefined ? params.id : props.id;
  }
 }

 const formMetaData = props.forms || fetchAttributesTableData(entity()) as FormMetaData[];

 const formValuesConstructor = formMetaData.reduce((acc, curr) => {
  acc[curr.id] = createFormGroup({});
  return acc;
 }, {} as { [key: string]: ReturnType<typeof createFormGroup> });
 const formValues = createFormGroup(formValuesConstructor);

 const [initialValues, setInitialValues] = createStore({} as InitialValues)

 // use a signal to show form because `Object.keys(form.controls).length` is not reactive
 const [fetching, setFetching] = createSignal(true);
 // Todo when any fetching is true, dont display the forms:
 // setValuesToEach Form:
 const owner = getOwner();
 formMetaData.forEach((form) => {
  const formGroup = formValues.controls[form.id];
  const groupConstructor = form.attributes.reduce((acc, meta) => {
   runWithOwner(owner, () => {
    if(meta.type === "buttongroup"){
     console.log('buttongroup skipped')
    } else if (meta.type === "table" || meta.type === "table_forms") {
     acc[meta.key] = createFormArray([], meta.options);
    } else {
     const iFormControl = createFormControl(getDefaultValue(meta.type), meta.options);
     acc[meta.key] = iFormControl;
     if(meta.onchange){
      createEffect(on(() => iFormControl.value, (v) => meta.onchange?.(formGroup, v as Id), { defer: true }));
     }
    }
   });
   return acc;
  }, {} as { [key: string]: IFormControl | ReturnType<typeof createFormArray> });

  formGroup.setControls(groupConstructor);

  const setDefaultValue = (value: {[key: string]: any}) => {
   form.attributes.forEach(meta=>{
    if (meta.default){
     if(!value[meta.key])
      value[meta.key] = meta.default(formValues, formGroup )
    }
   })
  }
  if (mainId()) {
   const data = form.data?.(mainId());
   if (data) {
    setDefaultValue(data.properties);
    setInitialValues(form.id, reconcile(data));
    const value = D.selectKeys(data.properties, form.attributes.filter(attr => attr.type !== "table" && attr.type !== "table_forms").map(attr => attr.key));
    if (D.isNotEmpty(value)) formGroup.patchValue(value);

    // table will load data themself
    const tableAttributes = form.attributes.filter(attr => attr.type === "table" || attr.type === "table_forms");
    if (tableAttributes.length) {
     tableAttributes.forEach((tableAttr: TableField) => tableAttr.data = data.properties[tableAttr.key]);
    }
   } else if (form.save[0] === "vertex") {
    // used FormMetaData.save attribute temporary.
    const vertex = fetchDocument(form.save[1], mainId());

    if (!vertex) {
     alert(`document with id: ${mainId()} not exist`);
     return;
    }
    setDefaultValue(vertex.properties);
    setInitialValues(form.id, reconcile(vertex));
    const value = D.selectKeys(vertex.properties, form.attributes.filter(attr => attr.type !== "table"  && attr.type !== "table_forms").map(attr => attr.key));
    if (D.isNotEmpty(value)) formGroup.patchValue(value);

    // load table data when required
   } else if (form.save[0] === "edge") {
    const edge = fetchEdge(form.save[1], mainId());

    if (!edge) {
     alert(`Edge with id: ${mainId()} not exist`);
     return;
    }
    setDefaultValue(edge.properties);
    setInitialValues(form.id, reconcile(data));
    const value = D.selectKeys(edge.properties, form.attributes.filter(attr => attr.type !== "table" && attr.type !== "table_forms").map(attr => attr.key));
    if (D.isNotEmpty(value)) formGroup.patchValue(value);

    // load table data when required
   }
   // setFetching(false);
  } else {
   setInitialValues(form.id, reconcile({id: undefined, properties: formGroup.value}));
  }
 });
 setFetching(false);
 console.log('initialValues: ', initialValues);

 const onSubmit = (e) => {
  e.preventDefault();
  let index = 0;
  const length = formMetaData.length;
  const results: FormResult = new Map();

  const callMethod = (): Promise<any> => {
   const form = formMetaData[index++];
   if (form) {
    const formValue = klona(formValues.controls[form.id].value);
    const value = D.selectKeys(formValue, form.attributes.filter(attr => attr.type !== "table" && attr.type !== "table_forms").map(attr=>attr.key));
    const initialValue = initialValues[form.id];
    const id = initialValue['id'] || mainId();
    if (form.save[0] === "vertex") {
     const result_ = {};
     if (!id) {
      result_["id"] = addNode(form.save[1], value);
     } else {
      if(D.isNotEmpty(value) && !equals(removeUndefinedProperties(initialValue.properties, false, 10), removeUndefinedProperties(value, false, 10))) {
       result_["id"] = updateNode(form.save[1], initialValue.id, value);
      }
     }
     return Promise.resolve(result_);
    } else if (form.save[0] === "edge") {
     const start = form.save[2]?.(results, formValue);
     const end = form.save[3]?.(results, formValue);
     let result_ = {} as typeof initialValue;
     if (start && end) {
      if (!id) {
       const newId = addEdge(form.save[1], value, start, end);
       result_ = {id: newId, properties: value, start, end};
      } else {
       // currently not removing table properties because we dont have a case where we have an edge(with start and end functions) with table attribute
       if((D.isNotEmpty(value) && !equals(removeUndefinedProperties(initialValue.properties, false, 10), removeUndefinedProperties(value, false, 10))) || initialValue.start !== start || initialValue.end !== end) {
        const newId = updateEdgeWithStartAndEnd(form.save[1], initialValue.id, value, start, end);
        result_ = {id: newId, properties: value, start, end};
       }
      }
     }
     form.attributes.filter(form_ => form_.type === "table" || form_.type == "table_forms").forEach(attr => {
      const tableValue = formValue[attr.key];
      const initValue = initialValue.properties[attr.key];
      if(!equals(removeUndefinedProperties(initValue, false, 10), removeUndefinedProperties(tableValue, false, 10))) {
       const newSavedIds = (attr as TableField).save(results, formValue[attr.key]);
       if(!result_['properties']) result_['properties'] = {};
       result_['properties'][attr.key] = formValue[attr.key].map((row, index)=>{
        row.id = newSavedIds[index];
        ((formValues.controls[form.id].controls[attr.key] as IFormArray).controls[index] as IFormGroup).controls["id"].setValue(row.id);
        return row;
       })
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
      setInitialValues(formId, reconcile(Object.assign({}, initialValues[formId], {properties: formValues.controls[formId].value}, result)));
      results.set(formId, initialValues[formId]);
      checkAndCall();
     });
    } else {
     res(results);
    }
   };
   checkAndCall();
  }).then((result) => {
   if(props.postSubmit) {
    props.postSubmit(result);
    console.log(initialValues);
   } else {
    navigate(location.pathname.split("/").slice(0, -1).join("/"));
   }
  });
 };

 const isValid = () => {
  return formMetaData.map(form=> formValues.controls[form.id].isValid).every(v=>v === true)
 }
 const isDataChanged = () => {
  const result = formMetaData.map(form => equals(removeUndefinedProperties(initialValues[form.id].properties, false, 10), removeUndefinedProperties(formValues.controls[form.id].value, false, 10)));
  return result.some(v=>v === false)
 }

 return <Show when={!fetching()} fallback={<>Loading</>}>
  <form onSubmit={onSubmit} ref={setFormRef}>
   <For each={formMetaData}>
    {item => <DynamicForm formMetaData={item} id={mainId()}
                          formGroup={formValues.controls[item.id]}
                          formValues={formValues}
    />}
   </For>
   <ui5-button design="Positive" onclick={onSubmit} disabled={!isValid() || !isDataChanged()}>Save</ui5-button>
   <pre>
    {DEBUG && <br/>}
    {DEBUG && JSON.stringify(initialValues)}
    {DEBUG && <>InitialValues:<br/></>}
    {DEBUG && JSON.stringify(formValues.value)}
   </pre>
  </form>
 </Show>;
};