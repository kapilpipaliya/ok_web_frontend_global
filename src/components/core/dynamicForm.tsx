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
 Switch,
 useContext
} from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { useLocation, useNavigate } from "solid-app-router";
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
 BooleanInputField,
 ButtonGroup,
 Field,
 GeneralInput,
 getDefaultValue,
 JsonInput,
 removeUndefinedProperties,
 SelectInputField,
 TableInputField,
 TextAreaField,
 TextInputField
} from "ok_web_components";
import {
 ButtonGroupField,
 FormMetaData,
 FormResult,
 Id,
 InitialValues,
 SelectField,
 ServerFormAttributeType,
 TableField
} from "ok_web_components/src/components/input/Form";
import { fetchAttributesTableData } from "../api";
import { toTitle } from "case-switcher-js";
import {
 commitTransaction,
 getNewGraphId,
 getNewTxnId,
 graph,
 ProcessStatus,
 transactions
} from "../../lib/graph";
import { DEBUG } from "../../config";
import {
 addNewVertex,
 newVertex,
 replaceVertexProperties
} from "../../lib/Vertex";
import {
 addNewEdge,
 newEdge,
 replaceEdgeProperties,
 updateEdgeStartAndEnd
} from "../../lib/Edge";
import { WsContext } from "../ws_events_dispatcher";

interface DynamicFormProps {
 formMetaData: FormMetaData;
 id?: Id;
 txnId: number;
 formGroup: ReturnType<typeof createFormGroup>;
 // all forms options:
 formValues: IFormGroup;
}

export function DynamicForm(props: DynamicFormProps) {
 const Form = () => {
  return <><For
   each={props.formMetaData.attributes}>
   {(meta) => (
    <Switch>
     <Match when={meta.type === ServerFormAttributeType.String}>
      <TextInputField
       label={toTitle(meta.label || meta.id)}
       // @ts-ignore
       control={props.formGroup.controls[meta.id]}
       type={"text"}
       id={props.formMetaData.id + meta.id}
       {...(meta.props || {})}
      />
     </Match>
     <Match when={meta.type === ServerFormAttributeType.JsCode}>
      <TextAreaField
       label={toTitle(meta.label || meta.id)}
       // @ts-ignore
       control={props.formGroup.controls[meta.id]}
       id={props.formMetaData.id + meta.id}
       {...(meta.props || {})}
      />
     </Match>
     <Match when={meta.type === ServerFormAttributeType.Boolean}>
      <BooleanInputField
       label={toTitle(meta.label || meta.id)}
       type="checkbox"
       // @ts-ignore
       control={props.formGroup.controls[meta.id]}
       id={props.formMetaData.id + meta.id}
       {...(meta.props || {})}
      />
     </Match>
     <Match when={meta.type === ServerFormAttributeType.Object}>
      <Field label={toTitle(meta.label || meta.id)}>
       <JsonInput
        // @ts-ignore
        control={props.formGroup.controls[meta.id]}
        id={props.formMetaData.id + meta.id}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
     <Match when={meta.type === ServerFormAttributeType.Dynamic}>
      <Field label={toTitle(meta.label || meta.id)}>
       <GeneralInput
        // @ts-ignore
        control={props.formGroup.controls[meta.id]}
        id={props.formMetaData.id + meta.id}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
     <Match when={meta.type === ServerFormAttributeType.Select}>
      <Field label={toTitle(meta.label || meta.id)}>
       <SelectInputField
        // @ts-ignore
        control={props.formGroup.controls[meta.id]}
        id={props.formMetaData.id + meta.id}
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
        id={props.formMetaData.id + meta.id}
        txnId={props.txnId}
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
        id={props.formMetaData.id + meta.id}
        txnId={props.txnId}
        component={DynamicFormSequence}
        formMetaData={fetchAttributesTableData((meta as TableField).form!)}
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
        id={props.formMetaData.id + meta.id}
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
 formMetaData: FormMetaData[];
 postSubmit?: (values: FormResult) => void;
 id?: Id;
 txnId?: number;
}

export const DynamicFormSequence = (props: DynamicFormSequenceProps) => {
 const txnId = props.txnId || getNewTxnId();
 const {Ws} = useContext(WsContext);
 const [formRef, setFormRef] = createSignal<HTMLFormElement>();
 onMount(() => {
  const form = formRef();
  form.querySelector("input").focus();
 });
 const location = useLocation();
 const navigate = useNavigate();
 const formMetaData = klona(props.formMetaData)

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

  const setDefaultValueIfEmpty = (properties: { [key: string]: any }) => form.attributes.forEach(meta => (meta.default && !properties[meta.id]) && (properties[meta.id] = meta.default(formValues, formGroup)));
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
     alert(`document with id: ${props.id} not exist`); // TODO: display proper error: Message Strip on top
     return;
    }
    setDefaultValueIfEmpty(vertex.properties);
    setInitialValues(form.id, reconcile(klona(vertex)));
    {
     const nonTableValue = D.selectKeys(vertex.properties, form.attributes.filter(attr => attr.type !== "table" && attr.type !== "table_forms").map(attrMeta => attrMeta.id));
     if (D.isNotEmpty(nonTableValue)) formGroup.patchValue(nonTableValue);
    }
    // load table data when required
   } else if (form.save[0] === "edge") {
    const edge = graph.edges[props.id];

    if (!edge) {
     alert(`Edge with id: ${props.id} not exist`); // TODO: display proper error: Message Strip on top
     return;
    }
    setDefaultValueIfEmpty(edge.properties);
    setInitialValues(form.id, reconcile(klona(data)));
    {
     const nonTableValue = D.selectKeys(edge.properties, form.attributes.filter(attr => attr.type !== "table" && attr.type !== "table_forms").map(attrMeta => attrMeta.id));
     if (D.isNotEmpty(nonTableValue)) formGroup.patchValue(nonTableValue);
    }
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
    const nonTableValue = D.selectKeys(formValue, form.attributes.filter(attr => attr.type !== "table" && attr.type !== "table_forms").map(attrMeta => attrMeta.id));
    const initialValue = initialValues[form.id];
    const id = initialValue["id"] || props.id;
    if (form.save[0] === "vertex") {
     const result_ = {};
     if (!id) { // new
      result_["id"] = getNewGraphId(); // TODO: Think how we sync with server
      addNewVertex(txnId, newVertex(result_["id"], [form.save[1]], nonTableValue));
     } else { // edit
      if (D.isNotEmpty(nonTableValue) && !equals(removeUndefinedProperties(initialValue.properties, false, 10), removeUndefinedProperties(nonTableValue, false, 10))) {
       replaceVertexProperties(txnId, initialValue.id, nonTableValue);
       result_["id"] = initialValue.id;
      }
     }
     // not update table values for now, but do it when required.
     return Promise.resolve(result_);
    } else if (form.save[0] === "edge") {
     const start = form.save[2]?.(results, formValue);
     const end = form.save[3]?.(results, formValue);
     let result_ = {} as Omit<typeof initialValue, 'properties'>;
     if (start && end) {
      if (!id) { // new
       const newId = getNewGraphId(); // TODO: Think how we sync with server
       addNewEdge(txnId, newEdge(newId, form.save[1], nonTableValue, start, end));
       result_ = { id: newId, start, end };
      } else { // edit
       // currently not removing table properties because we dont have a case where we have an edge(with start and end functions) with table attribute
       if (D.isNotEmpty(nonTableValue) && !equals(removeUndefinedProperties(initialValue.properties, false, 10), removeUndefinedProperties(nonTableValue, false, 10))) {
        replaceEdgeProperties(txnId, initialValue.id, nonTableValue);
       }
       if (initialValue.start !== start || initialValue.end !== end) {
        updateEdgeStartAndEnd(txnId, initialValue.id, start, end);
       }
       result_ = { id: initialValue.id, start, end };
      }
     }
     form.attributes.filter(form_ => form_.type === "table" || form_.type == "table_forms").forEach(attrMeta => {
      const tableValue = formValue[attrMeta.id];
      const initValue = initialValue.properties[attrMeta.id];
      if (!equals(removeUndefinedProperties(initValue, false, 10), removeUndefinedProperties(tableValue, false, 10))) {
       const newSavedIds = (attrMeta as TableField).save(txnId, results, formValue[attrMeta.id]);
       formValue[attrMeta.id].forEach((row, index) => ((formValues.controls[form.id].controls[attrMeta.id] as IFormArray).controls[index] as IFormGroup).controls["id"].setValue(newSavedIds[index]));
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
      results.set(formId, klona(initialValues[formId]));
      checkAndCall();
     });
    } else {
     res(results);
    }
   };
   checkAndCall();
  }).then((results) => {
   if(transactions.get(txnId)){
    transactions.get(txnId).status = ProcessStatus.Ready;
   } else{
    alert('Txn not found! This should not happen');
   }
   commitTransaction(Ws);
   // TODO: If we have Internet active wait to get response else assume as saved.
   if (props.postSubmit) {
    props.postSubmit(results);
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
   console.log(1, 2, removeUndefinedProperties(initialValues[form.id].properties, false, 10), removeUndefinedProperties(formValues.controls[form.id].value, false, 10));
   return equals(removeUndefinedProperties(initialValues[form.id].properties, false, 10), removeUndefinedProperties(formValues.controls[form.id].value, false, 10));
  });
  return result.some(v => v === false);
 };

 return <Show when={!fetching()} fallback={<>Loading</>}>
  <form onSubmit={onSubmit} ref={setFormRef}>
   <For each={formMetaData}>
    {item => <DynamicForm formMetaData={item} id={props.id}
                          formGroup={formValues.controls[item.id]}
                          txnId={txnId}
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