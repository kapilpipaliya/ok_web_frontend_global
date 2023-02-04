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

import { D, G , S} from "@mobily/ts-belt";
import { klona } from "klona/json";
import { equals } from "rambda";

import {
 ButtonGroupField, FieldAttribute,
 FormMetaData,
 FormResult,
 Id,
 InitialValues,
 SelectField,
 ServerFormAttributeType,
 TableField, Vertex
} from "../input/Form";
import { AttributesTableData } from "../api";
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
import {path} from 'rambda';
import {
 addNewVertex, findVertexIdsByLabel, mergeVertexProperties,
 newVertex,
 replaceVertexProperties
} from "../../lib/Vertex";
import {
 addNewEdge, getOutEdgeIdsOfType,
 newEdge, replaceEdgeEnd,
 replaceEdgeProperties, replaceEdgeStart
} from "../../lib/Edge";
import { WsContext } from "../ws_events_dispatcher";
import Button, { ClickEvent } from "devextreme/ui/button";
import { TextInputField } from "../input/TextInputField";
import { TextAreaField } from "../input/TextAreaField";
import { NumberInputField } from "../input/NumberInputField";
import { DateInputField } from "../input/DateInputField";
import { BooleanInputField } from "../input/BooleanInputField";
import { Field } from "../input/core/Field";
import { JsonInput } from "../input/JsonInput";
import { GeneralInput } from "../input/GeneralInput";
import { SelectInputField } from "../input/SelectInputField2";
import { TableInputField } from "../input/TableInputField";
import { ButtonGroup } from "../input/core/ButtonGroup";
import { getDefaultValue } from "../../utils/form";

interface DynamicFormProps {
 form: FormMetaData;
 id: Id;
 txnId: number;
 // formGroup: ReturnType<typeof createFormGroup>;
 // all forms options:
 // formValues: IFormGroup;
}

export function DynamicForm(props: DynamicFormProps) {
 const setValue = (attribute: FieldAttribute, data: any) => {
  mergeVertexProperties(props.txnId,props.id, {[attribute.id]: data})
 }
 const Form = () => {
  return <><For
   each={props.form.attributes}>
   {(meta) => (
    <Switch>
     <Match
      when={meta.component === "TextInput" || (!meta.component && meta.serverType === ServerFormAttributeType.String)}>
      <TextInputField
       label={toTitle(meta.label || meta.id)}
       setValue={(value) => setValue(meta, value)}
       name={props.form.id + meta.id}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "TextArea"}>
      <TextAreaField
       label={toTitle(meta.label || meta.id)}
       
       
       id={props.form.id + meta.id}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "NumberInput" || (!meta.component && (meta.serverType === ServerFormAttributeType.Integer || meta.serverType === ServerFormAttributeType.Float))}>
      <NumberInputField
       label={toTitle(meta.label || meta.id)}
       
       
       id={props.form.id + meta.id}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "DateInput" || (!meta.component && (meta.serverType === ServerFormAttributeType.Date))}>
      <DateInputField
       label={toTitle(meta.label || meta.id)}
       
       
       id={props.form.id + meta.id}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "DateTimeInput" || (!meta.component && (meta.serverType === ServerFormAttributeType.LocalDateTime || meta.serverType === ServerFormAttributeType.LocalTime))}>
      <DateInputField
       label={toTitle(meta.label || meta.id)}
       type="datetime"
       
       
       id={props.form.id + meta.id}
       {...(meta.props || {})}
      />
     </Match>
     <Match when={meta.component === "JsCode"}>
      <TextAreaField
       label={toTitle(meta.label || meta.id)}
       
       
       id={props.form.id + meta.id}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "Boolean" || (!meta.component && meta.serverType === ServerFormAttributeType.Boolean)}>
      <BooleanInputField
       text={toTitle(meta.label || meta.id)}
       
       
       id={props.form.id + meta.id}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "Json" && (!meta.component && meta.serverType === ServerFormAttributeType.Map)}>
      <Field label={toTitle(meta.label || meta.id)}>
       <JsonInput
        
        
        id={props.form.id + meta.id}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
     <Match when={meta.component === "Dynamic"}>
      <Field label={toTitle(meta.label || meta.id)}>
       <GeneralInput
        
        
        id={props.form.id + meta.id}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
     <Match when={meta.component === "Select"}>
      <Field label={toTitle(meta.label || meta.id)}>
       <SelectInputField
        
        
        id={props.form.id + meta.id}
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
         
         
         id={props.form.id + meta.id}
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
        id={props.form.id + meta.id}
        txnId={props.txnId}
        component={DynamicFormSequence}
        // TODO: fix this for all the form types:
        form={AttributesTableData[(meta as TableField).form!]}
        postSubmit={(tableItemFormGroup, values) => (meta as TableField).postSubmit(props.formValues, props.formGroup, tableItemFormGroup, values)}
        
        
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
        
        control={props.formGroup}
        id={props.form.id + meta.id}
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
 form: FormMetaData;
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
  if ((meta.collection as string).startsWith("[")) {
   meta.fetchOptions = async () => {
    try {
      return JSON.parse(meta.collection as string);
     } catch (e) {
     console.warn(e)
     return [];
     }
    }

  } else if ((meta.collection as string).includes("[")) {
   const from = /\(([\w\.]+:)?(\w+)(:[\w\.]+)?\)->/
   const edge = /\[(\w+)\]/
   const fromResult = meta.collection.match(from);
   const edgeName = meta.collection.match(edge)?.[1];

   if(fromResult && edgeName) {
    let selector = S.removeAll(fromResult[1] || '', ":");
    const attribute = fromResult[2];
    const projection = S.removeAll(fromResult[3] || '', ":");

    meta.fetchOptions = async (formValues, formGroup, inputValue) => {
     let fromVertexId: number;
     try{
      let control:IFormGroup;
      control = selector ? formValues.controls[selector] as IFormGroup : formGroup;
      fromVertexId = control.controls[attribute].value;
     } catch (e) {
      console.warn('error', e);
      return [];
     }

     if (!fromVertexId) return [];
     const fromVertex = graph.vertexes[fromVertexId];
     if(!fromVertex) return [];
     const projectedId: number|undefined = projection ? path(projection, fromVertex) : fromVertexId;
     if(!projectedId) return [];
     return getOutEdgeIdsOfType(projectedId, edgeName).map(id => graph.vertexes[graph.edges[id].end]);
    };
   }
  } else {
   meta.fetchOptions = async (formValues, formGroup, inputValue) => {
    return findVertexIdsByLabel(meta.collection as string).map((id) => graph.vertexes[id]);
   };
  }
 }
}

export const DynamicFormSequence = (props: DynamicFormSequenceProps) => {
 let id = props.id!;
 const txnId = props.txnId || getNewTxnId();
 const { Ws } = useContext(WsContext);
 const [formRef, setFormRef] = createSignal<HTMLFormElement>();
 onMount(() => {
  const form_ = formRef();
  form_?.querySelector("input")?.focus();
 });
 const location = useLocation();
 const navigate = useNavigate();
 const form = klona(props.form);
 const actionType = props.id ? "edit" : "create";

 if ( !props.id ) {
   // create a new vertex, but don't commit
   const newVertexObj = newVertex(getNewGraphId(), [form.label], {});
   // set default values if empty
  // TODO: make default working based on string, its not a function.
  // const formValues = 1;
  // form.attributes.forEach(meta => (meta.default && !newVertexObj.properties[meta.id]) && (newVertexObj.properties[meta.id] = meta.default(formValues)));

  const {error} = addNewVertex(txnId, newVertexObj);
  if (error) {
   alert(error);
   return;
  }
  id = newVertexObj.id;
 }

 const onSubmit = (e: ClickEvent) => {
  e.event?.preventDefault();
  
  // on save only commit if its creation
  if ( !props.id) {
   if (transactions.has(txnId)) {
    transactions.get(txnId)!.status = ProcessStatus.Ready;
    commitTransaction(Ws);
   }
  }

   if (props.postSubmit) {
    // @ts-ignore
    props.postSubmit(id);
   } else {
    navigate(location.pathname.split("/").slice(0, -1).join("/"));
   }

 };

 return <form
        // onSubmit={onSubmit}
        ref={setFormRef}>
       <DynamicForm form={form} id={id} txnId={txnId} />
         <Show when={actionType === "create"}>
          <div ref={el => {
           const instance = new Button(el, { type: "success", onClick: onSubmit, text: "Save" });
           onCleanup(() => instance.dispose());
          }} />
         </Show>
  </form>
};