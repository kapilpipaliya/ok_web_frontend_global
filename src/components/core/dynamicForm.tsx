import {
 createEffect,
 createSignal,
 For,
 getOwner,
 Match, on,
 runWithOwner,
 Show,
 Switch
} from "solid-js";
import { useParams, useNavigate, useLocation } from "solid-app-router";
import {
 bindOwner, createFormArray,
 createFormControl,
 createFormGroup,
 IFormControl, IFormGroup
} from "solid-forms";
import { A, D } from "@mobily/ts-belt";
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
 fetchAttributesTableData, fetchCollectionData,
 fetchDocument, fetchEdge, updateEdgeWithStartAndEnd,
 updateNode
} from "../api";
import { toTitle } from "case-switcher-js";
import { klona } from "klona/json";
import { addNewEdge, graph, Id } from "../../lib/graph";
import {
 SelectField,
 TableField,
 FieldAttribute,
 FormMetaData,
 FormToIdMap,
 ButtonGroupField
} from "ok_web_components/src/components/input/Form";
import {equals} from 'rambda';

interface DynamicFormProps {
 formMetaData: FormMetaData;
 id?: Id;
 formGroup: ReturnType<typeof createFormGroup>
 // all forms options:
 formToIdMap: FormToIdMap;
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
        fetchOptions={async (inputValue: string) => (meta as SelectField).fetchOptions(props.formToIdMap, props.formValues, props.formGroup, inputValue)}
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
        formToIdMap={props.formToIdMap}
        formValues={props.formValues}
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

// interface DynamicFormSequenceProps {
//   forms: FormMetaData[]
// }
export const DynamicFormSequence = (props) => {
 const [formRef, setFormRef] = createSignal<HTMLFormElement>();
 /* @mount */
 {
  const form = formRef();
  form.querySelector("input").focus();
 }

 const params = useParams();
 const navigate = useNavigate();
 const location = useLocation();

 const formMetaData = fetchAttributesTableData(params.entity) as FormMetaData[];

 const formValuesConstructor = formMetaData.reduce((acc, curr) => {
  acc[curr.id] = createFormGroup({});
  return acc;
 }, {} as { [key: string]: ReturnType<typeof createFormGroup> });
 const formValues = createFormGroup(formValuesConstructor);

 const formToIdMap: FormToIdMap = new Map();
 formMetaData.forEach(form => {
  if (form.idFn) {
   formToIdMap.set(form.id, {id: form.idFn(formToIdMap)});
  } else {
   formToIdMap.set(form.id, {id: params.id});
  }
 });

 const initialValues = {} as {[key: string]: {start?: Id, end?: Id, properties: {[key: string]: any}}}

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
    } else if (meta.type === "table") {
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
      value[meta.key] = meta.default(formToIdMap, formValues, formGroup )
    }
   })
  }
  if (params.id && params.id !== "new") {
   if (form.data) {
    const data = form.data(formToIdMap);
    const value = D.selectKeys(data, form.attributes.filter(attr => attr.type !== "table").map(attr => attr.key));
    setDefaultValue(value);
    const results = formToIdMap;
    initialValues[form.id] = {properties: value, start: form.save[2]?.(results, value), end: form.save[3]?.(results, value)};
    if (D.isNotEmpty(value)) formGroup.patchValue(value);
    if (formGroup.controls["_id"])
     formGroup.controls["_id"].markDisabled(true);

    const tableAttributes = form.attributes.filter(attr => attr.type === "table");
    if (tableAttributes.length) {
     tableAttributes.forEach((attr: TableField) => attr.data = data[attr.key]);
    }
   } else if (form.save[0] === "vertex") {
    // used FormMetaData.save attribute temporary.
    const vertex = fetchDocument(form.save[1], params.id);

    if (!vertex) {
     alert(`document with id: ${params.id} not exist`);
     return;
    }
    const value = D.selectKeys(vertex.properties, form.attributes.filter(attr => attr.type !== "table").map(attr => attr.key));
    setDefaultValue(value);
   
    initialValues[form.id] = {properties: value};
    if (D.isNotEmpty(value)) formGroup.patchValue(value);
    if (formGroup.controls["_id"])
     formGroup.controls["_id"].markDisabled(true);
   } else if (form.save[0] === "edge") {
    const edge = fetchEdge(form.save[1], params.id);

    if (!edge) {
     alert(`Edge with id: ${params.id} not exist`);
     return;
    }
    const value = D.selectKeys(edge.properties, form.attributes.filter(attr => attr.type !== "table").map(attr => attr.key));
    setDefaultValue(value);

    initialValues[form.id] = {start: edge.start, end: edge.end, properties: value};
    if (D.isNotEmpty(value)) formGroup.patchValue(edge);

   }
   // setFetching(false);
  }
 });
 setFetching(false);
  console.log(initialValues)

 const onSubmit = (e) => {
  e.preventDefault();
  let index = 0;
  const length = formMetaData.length;
  const results: FormToIdMap = new Map();

  const callMethod = (): Promise<any> => {
   const form = formMetaData[index++];
   if (form) {
    const formValue = klona(formValues.controls[form.id].value);
    const value = D.selectKeys(formValue, form.attributes.filter(attr => attr.type !== "table").map(attr=>attr.key));
    if (form.save[0] === "vertex") {
     const result_ = {};
     if (params.id == "new") {
      result_["id"] = addNode(form.save[1], value);
     } else {
      const initialValue = initialValues[form.id];
      if(D.isNotEmpty(value) && !equals(initialValue.properties, value)) {
       result_["id"] = updateNode(form.save[1], formToIdMap.get(form.id).id, value);
      } else {
       result_["id"] = formToIdMap.get(form.id).id;
      }
     }
     return Promise.resolve(result_);
    } else if (form.save[0] === "edge") {
     const start = form.save[2]?.(results, formValue);
     const end = form.save[3]?.(results, formValue);
     const result_ = {};
     if (start && end) {
      if (params.id == "new") {
       result_["id"] = addEdge(form.save[1], value, start, end);
      } else {
       const initialValue = initialValues[form.id];
       if((D.isNotEmpty(value) && !equals(initialValue.properties, value)) || initialValue.start !== start || initialValue.end !== end) {
        result_["id"] = updateEdgeWithStartAndEnd(form.save[1], formToIdMap.get(form.id).id, value, start, end);
       } else {
        result_["id"] = formToIdMap.get(form.id)
       }
      }
     }
     form.attributes.filter(form_ => form_.type === "table").forEach(attr => {
      result_[attr.key] = (attr as TableField).save(results, formValue[attr.key]);
     });
     return Promise.resolve(result_);
    } else {
     return Promise.resolve({});
    }
   } else {
    return Promise.resolve({});
   }
  };

  return new Promise<{ [key: string]: any }>((res) => {
   const checkAndCall = () => {
    if (index < length) {
     callMethod().then(result => {
      results.set(formMetaData[index - 1].id, result);
      checkAndCall();
     });
    } else {
     res(results);
    }
   };
   checkAndCall();
  }).then((result) => {
   navigate(location.pathname.split("/").slice(0, -1).join("/"));
  });
 };

 return <Show when={!fetching()} fallback={<>Loading</>}>
  <form onSubmit={onSubmit} ref={setFormRef}>
   <For each={formMetaData}>
    {item => <DynamicForm formMetaData={item} id={params.id}
                          formGroup={formValues.controls[item.id]}
                          formToIdMap={formToIdMap}
                          formValues={formValues}
    />}
   </For>
   <button type="submit" class="hidden">submit</button>
   <ui5-button onclick={onSubmit}>Save</ui5-button>
   {JSON.stringify(formValues.value)}
  </form>
 </Show>;
};