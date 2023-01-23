import {
 createEffect,
 createSignal,
 For,
 getOwner,
 Match,
 on, onCleanup,
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
import { D, G } from "@mobily/ts-belt";
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
 TextInputField,
 NumberInputField,
 DateInputField
} from "ok_web_components";
import {
 ButtonGroupField,
 FormMetaData,
 FormResult,
 Id,
 InitialValues,
 SelectField,
 ServerFormAttributeType,
 TableField,
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
 addNewVertex, findVertexIdsByLabel,
 newVertex,
 replaceVertexProperties
} from "../../lib/Vertex";
import {
 addNewEdge,
 newEdge, replaceEdgeEnd,
 replaceEdgeProperties, replaceEdgeStart
} from "../../lib/Edge";
import { WsContext } from "../ws_events_dispatcher";
import Button, { ClickEvent } from "devextreme/ui/button";

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
     <Match
      when={meta.component === "TextInput" || (!meta.component && meta.serverType === ServerFormAttributeType.String)}>
      <TextInputField
       label={toTitle(meta.label || meta.id)}
       // @ts-ignore
       control={props.formGroup.controls[meta.id]}
       id={props.formMetaData.id + meta.id}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "TextArea"}>
      <TextAreaField
       label={toTitle(meta.label || meta.id)}
       // @ts-ignore
       control={props.formGroup.controls[meta.id]}
       id={props.formMetaData.id + meta.id}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "NumberInput" || (!meta.component && (meta.serverType === ServerFormAttributeType.Integer || meta.serverType === ServerFormAttributeType.Float))}>
      <NumberInputField
       label={toTitle(meta.label || meta.id)}
       // @ts-ignore
       control={props.formGroup.controls[meta.id]}
       id={props.formMetaData.id + meta.id}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "DateInput" || (!meta.component && (meta.serverType === ServerFormAttributeType.Date))}>
      <DateInputField
       label={toTitle(meta.label || meta.id)}
       // @ts-ignore
       control={props.formGroup.controls[meta.id]}
       id={props.formMetaData.id + meta.id}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "DateTimeInput" || (!meta.component && (meta.serverType === ServerFormAttributeType.LocalDateTime || meta.serverType === ServerFormAttributeType.LocalTime))}>
      <DateInputField
       label={toTitle(meta.label || meta.id)}
       type="datetime"
       // @ts-ignore
       control={props.formGroup.controls[meta.id]}
       id={props.formMetaData.id + meta.id}
       {...(meta.props || {})}
      />
     </Match>
     <Match when={meta.component === "JsCode"}>
      <TextAreaField
       label={toTitle(meta.label || meta.id)}
       // @ts-ignore
       control={props.formGroup.controls[meta.id]}
       id={props.formMetaData.id + meta.id}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "Boolean" || (!meta.component && meta.serverType === ServerFormAttributeType.Boolean)}>
      <BooleanInputField
       text={toTitle(meta.label || meta.id)}
       // @ts-ignore
       control={props.formGroup.controls[meta.id]}
       id={props.formMetaData.id + meta.id}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "Json" && (!meta.component && meta.serverType === ServerFormAttributeType.Map)}>
      <Field label={toTitle(meta.label || meta.id)}>
       <JsonInput
        // @ts-ignore
        control={props.formGroup.controls[meta.id]}
        id={props.formMetaData.id + meta.id}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
     <Match when={meta.component === "Dynamic"}>
      <Field label={toTitle(meta.label || meta.id)}>
       <GeneralInput
        // @ts-ignore
        control={props.formGroup.controls[meta.id]}
        id={props.formMetaData.id + meta.id}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
     <Match when={meta.component === "Select"}>
      <Field label={toTitle(meta.label || meta.id)}>
       <SelectInputField
        // @ts-ignore
        control={props.formGroup.controls[meta.id]}
        id={props.formMetaData.id + meta.id}
        displayExpr={(meta as SelectField).displayExpr}
        fetchOptions={async (inputValue: string) => (meta as SelectField).fetchOptions(props.formValues, props.formGroup, inputValue)}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
     <Match when={meta.component === "Table"}>
      <Field label={toTitle(meta.label || meta.id)}>
       {() => {
        const newMeta = (meta as TableField).attributes.map(attr => {
         if(attr.component === "Select") updateSelectFieldMeta(attr as SelectField);
         return attr;
        })
        return <TableInputField
         // @ts-ignore
         control={props.formGroup.controls[meta.id]}
         id={props.formMetaData.id + meta.id}
         txnId={props.txnId}
         attributes={newMeta}
         defaultValue="undefined"
         data={(meta as TableField).data}
         defaultValueFn={(meta as TableField).defaultValueFn}
         formValues={props.formValues}
         noSort={(meta as TableField).noSort}
         {...(meta.props || {})}
        />
       }}
      </Field>
     </Match>
     <Match when={meta.component === "TableForm"}>
      <Field label={toTitle(meta.label || meta.id)}>
       <TableInputField
        type={"form"}
        id={props.formMetaData.id + meta.id}
        txnId={props.txnId}
        component={DynamicFormSequence}
        // TODO: fix this for all the form types:
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
     <Match when={meta.component === "ButtonGroup"}>
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

export interface DynamicFormSequenceProps {
 formMetaData: FormMetaData[];
 handleSubmit?: (txnId: number, values: FormResult) => void;
 postSubmit?: (values: FormResult) => void;
 id?: Id;
 txnId?: number;
}

function updateSelectFieldMeta(meta: SelectField) {
 if (typeof meta.collection === "number") {
  meta.fetchOptions = async (formValues, formGroup, inputValue) => {
   const vertex = graph.vertexes[meta.collection];
   // assume that vertex is of label Collection
   return vertex ? findVertexIdsByLabel(vertex.properties.id).map((id) => graph.vertexes[id]) : [];
  };
 }
 if (typeof meta.collection === "string") {
  if ((meta.collection as string).includes("[")) {
   // TODO
  } else {
   meta.fetchOptions = async (formValues, formGroup, inputValue) => {
    return findVertexIdsByLabel(meta.collection as string).map((id) => graph.vertexes[id]);
   };
  }
 }
}

export const DynamicFormSequence = (props: DynamicFormSequenceProps) => {
 const txnId = props.txnId || getNewTxnId();
 const { Ws } = useContext(WsContext);
 const [formRef, setFormRef] = createSignal<HTMLFormElement>();
 onMount(() => {
  const form = formRef();
  form.querySelector("input")?.focus();
 });
 const location = useLocation();
 const navigate = useNavigate();
 const formMetaData = klona(props.formMetaData);

 const formValuesConstructor = formMetaData.reduce((acc, currMeta) => {
  if(currMeta.component === "Table" || currMeta.component === "TableForm") {
   acc[currMeta.id] = createFormArray([], currMeta.fieldOptions);
  } else {
   acc[currMeta.id] = createFormGroup({});
  }
  return acc;
 }, {} as { [key: string]: ReturnType<typeof createFormGroup> });
 const formValues = createFormGroup(formValuesConstructor);

 const [initialValues, setInitialValues] = createStore({} as InitialValues);

 // use a signal to show form because `Object.keys(form.controls).length` is not reactive
 const [fetching, setFetching] = createSignal(true);
 let isTableForm = false;
 // Todo when any fetching is true, dont display the forms:
 // setValuesToEach Form:
 const owner = getOwner();
 formMetaData.forEach((form) => {
  const formGroup = formValues.controls[form.id];
  if(!(form.component === "Table" || form.component === "TableForm")) {
   const groupConstructor = form.attributes.reduce((acc, meta) => {
    runWithOwner(owner!, () => {
     if (meta.component === "ButtonGroup") {
      console.log("buttongroup skipped");
     } else if (meta.component === "Table" || meta.component === "TableForm") {
      if (meta.component === "TableForm") isTableForm = true;
      acc[meta.id] = createFormArray([], meta.fieldOptions);
     } else {
      if(meta.component === "Select"){
       updateSelectFieldMeta(meta as SelectField);
      }
      const iFormControl = createFormControl(getDefaultValue(meta.serverType, meta.component), meta.fieldOptions);
      iFormControl.setData("serverType", meta.serverType);
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
  }

  const setDefaultValueIfEmpty = (properties: { [key: string]: any }) => form.attributes.forEach(meta => (meta.default && !properties[meta.id]) && (properties[meta.id] = meta.default(formValues, formGroup)));
  if (props.id) {
   const data = form.data?.(props.id);
   if(form.component === "Table" || form.component === "TableForm") {
    // table will load data themself
    if (data) {
     form.data = data;
     setInitialValues(form.id, reconcile(data));
    }
   } else if (data) {
    setDefaultValueIfEmpty(data.properties);
    setInitialValues(form.id, reconcile(data));
    // set non table values
    const value = D.selectKeys(data.properties, form.attributes.filter(attr => attr.component !== "Table" && attr.component !== "TableForm").map(attrMeta => attrMeta.id));
    if (D.isNotEmpty(value)) formGroup.patchValue(value);

    // table will load data themself
    const tableAttributes = form.attributes.filter(attr => attr.component === "Table" || attr.component === "TableForm");
    if (tableAttributes.length) {
     tableAttributes.forEach((tableAttrMeta: TableField) => tableAttrMeta.data = data.properties[tableAttrMeta.id]);
    }
   } else if (form.save[0] === "vertex") {
    // used FormMetaData.save attribute temporary.
    const vertex = graph.vertexes[props.id]; // TODO: why props.id? it means we can only have one vertex

    if (!vertex) {
     alert(`document with id: ${props.id} not exist when getting form data`); // TODO: display proper error: Message Strip on top
     return;
    }
    setDefaultValueIfEmpty(vertex.properties);
    setInitialValues(form.id, reconcile(klona(vertex)));
    {
     const nonTableValue = D.selectKeys(vertex.properties, form.attributes.filter(attr => attr.component !== "Table" && attr.component !== "TableForm").map(attrMeta => attrMeta.id));
     if (D.isNotEmpty(nonTableValue)) formGroup.patchValue(nonTableValue);
    }
    // load table data when required
   } else if (form.save[0] === "edge") {
    const edge = graph.edges[props.id];  // TODO: why props.id? it means we can only have one edge when data() is not in attributes. also we can either have vertex or edge.

    if (!edge) {
     alert(`Edge with id: ${props.id} not exist`); // TODO: display proper error: Message Strip on top
     return;
    }
    setDefaultValueIfEmpty(edge.properties);
    setInitialValues(form.id, reconcile(klona(edge)));
    {
     const nonTableValue = D.selectKeys(edge.properties, form.attributes.filter(attr => attr.component !== "Table" && attr.component !== "TableForm").map(attrMeta => attrMeta.id));
     if (D.isNotEmpty(nonTableValue)) formGroup.patchValue(nonTableValue);
    }
    // load table data when required
   } else {
    console.error(`not able to set data for ${form.title}`);
   }
   // setFetching(false);
  } else {
   if(form.data) form.data = undefined
   setInitialValues(form.id, reconcile({
    id: undefined,
    properties: formGroup.value
   }));
  }
 });
 setFetching(false);

 const onSubmit = (e: ClickEvent) => {
  e.event.preventDefault();
  let index = 0;
  const length = formMetaData.length;
  const results: FormResult = new Map();

  const callMethod = (): Promise<any> => {
   const form = formMetaData[index++];
   if (form) {
    const formValue = klona(formValues.controls[form.id].value);
    const nonTableValue = D.selectKeys(formValue, form.attributes.filter(attr => attr.component !== "Table" && attr.component !== "TableForm").map(attrMeta => attrMeta.id));
    const initialValue = initialValues[form.id];
    const formDataId = initialValue["id"];
    if ((form.component === "Table" || form.component === "TableForm")) {
     if (!equals(removeUndefinedProperties(initialValue, false, 10), removeUndefinedProperties(formValue, false, 10))) {
      if(G.isFunction(form.save)){
       const newSavedIds = (form as TableField).save(txnId, results, formValue);
       formValue.forEach((row, index) => ((formValues.controls[form.id] as IFormArray).controls[index] as IFormGroup).controls["id"].setValue(newSavedIds[index]));
      }
     }
     return Promise.resolve(formValue);
    } else if (form.save[0] === "vertex") {
     const result_ = {};
     if (!formDataId) { // new
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
     let result_ = {} as Omit<typeof initialValue, "properties">;
     if (start && end) {
      if (!formDataId) { // new
       const newVertexId = getNewGraphId(); // TODO: Think how we sync with server
       addNewEdge(txnId, newEdge(newVertexId, form.save[1], nonTableValue, start, end));
       result_ = { id: newVertexId, start, end };
      } else { // edit
       if (D.isNotEmpty(nonTableValue) && !equals(removeUndefinedProperties(initialValue.properties, false, 10), removeUndefinedProperties(nonTableValue, false, 10))) {
        replaceEdgeProperties(txnId, initialValue.id, nonTableValue);
       }
       if (initialValue.start !== start) {
        replaceEdgeStart(txnId, initialValue.id, start);
       }
       if (initialValue.end !== end) {
        replaceEdgeEnd(txnId, initialValue.id, end);
       }
       result_ = { id: initialValue.id, start, end };
      }
     }
     form.attributes.filter(form_ => form_.component === "Table" || form_.component == "TableForm").forEach(attrMeta => {
      const tableValue = formValue[attrMeta.id];
      const initValue = initialValue.properties[attrMeta.id];
      if (!equals(removeUndefinedProperties(initValue, false, 10), removeUndefinedProperties(tableValue, false, 10))) {
       const newSavedIds = (attrMeta as TableField).save(txnId, results, tableValue);
       tableValue.forEach((row, index) => ((formValues.controls[form.id].controls[attrMeta.id] as IFormArray).controls[index] as IFormGroup).controls["id"].setValue(newSavedIds[index]));
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

  return new Promise<FormResult>((resolve) => {
   const checkAndCall = () => {
    if (index < length) {
     callMethod().then(result => {
      const formMeta = formMetaData[index - 1];
      const formId = formMeta.id;
      if(formMeta.component === "Table" || formMeta.component === "TableForm") {
       setInitialValues(formId, reconcile(formValues.controls[formId].value));
      } else {
       setInitialValues(formId, reconcile(Object.assign({}, initialValues[formId], { properties: formValues.controls[formId].value }, result)));
      }
      results.set(formId, klona(initialValues[formId]));
      checkAndCall();
     });
    } else {
     resolve(results);
    }
   };
   checkAndCall();
  }).then((results) => {
   if (transactions.get(txnId)) {
    transactions.get(txnId).status = ProcessStatus.Ready;
   } else {
    alert("Txn not found! This should not happen");
   }
   if (props.handleSubmit) {
    props.handleSubmit(txnId, results);
    return;
   }
   if (!props.txnId) commitTransaction(Ws);
   // TODO: If we have Internet active wait to get response else assume as saved.
   if (props.postSubmit) {
    props.postSubmit(results);
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
   // TODO!!!: Big Bug When The form dont render all the inputs it will always be changed
   // TODO!!!: Dont consider null values also. for e.g. for ServerAttributeType if Default select field has null value, Save Button is enabled.
   if(form.component === "Table" || form.component === "TableForm") {
    return equals(removeUndefinedProperties(initialValues[form.id], false, 10), removeUndefinedProperties(formValues.controls[form.id].value, false, 10));
   }
   console.log(1, 2, removeUndefinedProperties(initialValues[form.id].properties, false, 10), removeUndefinedProperties(formValues.controls[form.id].value, false, 10));
   return equals(removeUndefinedProperties(initialValues[form.id].properties, false, 10), removeUndefinedProperties(formValues.controls[form.id].value, false, 10));
  });
  return result.some(v => v === false);
 };
console.log(formMetaData)
 return <Show when={!fetching()} fallback={<>Loading</>}>
  <form
   // onSubmit={onSubmit}
   ref={setFormRef}>
   <For each={formMetaData}>
    {meta => <Switch>
     <Match when={meta.component === "Table"}>
      <Field label={toTitle(meta.title || '')}>
       {() => {
        const newMeta = meta.attributes.map(attr => {
         if(attr.component === "Select") updateSelectFieldMeta(attr as SelectField);
         return attr;
        })
        return <TableInputField
         // @ts-ignore
         control={formValues.controls[meta.id]}
         id={meta.id}
         txnId={txnId}
         attributes={newMeta}
         defaultValue="undefined"
         data={meta.data}
         defaultValueFn={meta.defaultValueFn}
         formValues={formValues}
         noSort={meta.noSort}
         {...(meta.props || {})}
        />
       }}
      </Field>
     </Match>
     <Match when={meta.component === "TableForm"}>
      <Field label={toTitle(meta.title || '')}>
       <TableInputField
        type={"form"}
        id={meta.id}
        txnId={txnId}
        component={DynamicFormSequence}
        // TODO: fix this for all the form types:
        formMetaData={fetchAttributesTableData(meta.form!)}
        postSubmit={(tableItemFormGroup, values) => (meta as TableField).postSubmit(formValues, formValues.controls[meta.id], tableItemFormGroup, values)}
        // @ts-ignore
        control={formValues.controls[meta.id]}
        attributes={meta.attributes}
        defaultValue="undefined"
        data={meta.data}
        defaultValueFn={meta.defaultValueFn}
        formValues={formValues}
        noSort={meta.noSort}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
     <Match when={true}>
      <DynamicForm formMetaData={meta} id={props.id}
                   formGroup={formValues.controls[meta.id]}
                   txnId={txnId}
                   formValues={formValues}
      />
     </Match>
     </Switch>}
   </For>
   <div ref={el => {
    const instance = new Button(el, { type: "success", onClick: onSubmit, text: "Save" });
    createEffect(() => instance.option("disabled", !isValid() || isTableForm ? false : !isDataChanged()));
    onCleanup(() => instance.dispose());
   }} />
   <pre>
    {DEBUG && <br />}
    {DEBUG && JSON.stringify(initialValues)}
    {DEBUG && <>InitialValues:<br /></>}
    {DEBUG && JSON.stringify(formValues.value)}
   </pre>
  </form>
 </Show>;
};