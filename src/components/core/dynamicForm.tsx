import {
 createSignal,
 For,
 Match,
 onCleanup,
 onMount,
 Show,
 Switch,
 useContext
} from "solid-js";
import { useLocation, useNavigate, useParams } from "solid-app-router";

import { S } from "@mobily/ts-belt";
import { klona } from "klona/json";
import { path } from "rambda";

import {
 ButtonGroupField,
 FieldAttribute,
 FormMetaData,
 FormResult,
 Id,
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
import {
 addNewVertex,
 findVertexIdsByLabel,
 mergeVertexProperties,
 newVertex
} from "../../lib/Vertex";
import { getOutEdgeIdsOfType } from "../../lib/Edge";
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
import { SelectInputField } from "../input/SelectInputField";
import { TableInputField } from "../input/TableInputField";
import { ButtonGroup } from "../input/core/ButtonGroup";
import { TagField } from "../input/TagField";





interface DynamicFormProps {
 form: FormMetaData;
 id: Id;
 txnId: number;
 // formGroup: ReturnType<typeof createFormGroup>;
 // all forms options:
 // formValues: IFormGroup;
}

export function DynamicForm(props: DynamicFormProps) {
 const vertex = graph.vertexes[props.id];
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
       name={props.form.id + meta.id}
       label={toTitle(meta.label || meta.id)}
       value={vertex.properties[meta.id]}
       setValue={(value) => setValue(meta, value)}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "TextArea"}>
      <TextAreaField
       id={props.form.id + meta.id}
       label={toTitle(meta.label || meta.id)}
       value={vertex.properties[meta.id]}
       setValue={(value) => setValue(meta, value)}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "NumberInput" || (!meta.component && (meta.serverType === ServerFormAttributeType.Integer || meta.serverType === ServerFormAttributeType.Float))}>
      <NumberInputField
       name={props.form.id + meta.id}
       label={toTitle(meta.label || meta.id)}
       value={vertex.properties[meta.id]}
       setValue={(value) => setValue(meta, value)}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "DateInput" || (!meta.component && (meta.serverType === ServerFormAttributeType.Date))}>
      <DateInputField
       name={props.form.id + meta.id}
       label={toTitle(meta.label || meta.id)}
       value={vertex.properties[meta.id]}
       setValue={(value) => setValue(meta, value)}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "DateTimeInput" || (!meta.component && (meta.serverType === ServerFormAttributeType.LocalDateTime || meta.serverType === ServerFormAttributeType.LocalTime))}>
      <DateInputField
       name={props.form.id + meta.id}
       label={toTitle(meta.label || meta.id)}
       type="datetime"
       value={vertex.properties[meta.id]}
       setValue={(value) => setValue(meta, value)}
       {...(meta.props || {})}
      />
     </Match>
     <Match when={meta.component === "JsCode"}>
      <TextAreaField
       name={props.form.id + meta.id}
       label={toTitle(meta.label || meta.id)}
       value={vertex.properties[meta.id]}
       setValue={(value) => setValue(meta, value)}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "Boolean" || (!meta.component && meta.serverType === ServerFormAttributeType.Boolean)}>
      <BooleanInputField
       name={props.form.id + meta.id}
       text={toTitle(meta.label || meta.id)}
       value={vertex.properties[meta.id]}
       setValue={(value) => setValue(meta, value)}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "Json" && (!meta.component && meta.serverType === ServerFormAttributeType.Map)}>
      <Field label={toTitle(meta.label || meta.id)}>
       <JsonInput
        name={props.form.id + meta.id}
        value={vertex.properties[meta.id]}
        setValue={(value) => setValue(meta, value)}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
     <Match when={meta.component === "Dynamic"}>
      <Field label={toTitle(meta.label || meta.id)}>
       <GeneralInput
        id={props.form.id + meta.id}
        value={vertex.properties[meta.id]}
        setValue={(value) => setValue(meta, value)}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
     <Match when={meta.component === "Select"}>
      <Field label={toTitle(meta.label || meta.id)}>
       <SelectInputField
        txnId={props.txnId}
        vertex={vertex}
        meta={meta as SelectField}
        name={props.form.id + meta.id}
       />
      </Field>
     </Match>
     <Match when={meta.component === "Tag"}>
      <Field label={toTitle(meta.label || meta.id)}>
       <TagField
        txnId={props.txnId}
        vertex={vertex}
        meta={meta as SelectField}
        name={props.form.id + meta.id}
       />
      </Field>
     </Match>
     <Match when={meta.component === "Table"}>
      <Field label={toTitle(meta.label || meta.id)}>
       {() => {
        return <TableInputField
         // id={props.form.id + meta.id}
         txnId={props.txnId}
         meta={meta as TableField}
         vertex={vertex}
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
 id?: Id;
 txnId?: number;
 // very rare cases
 handleSubmit?: (txnId: number, values: FormResult) => void;
 postSubmit?: (values: FormResult) => void;
}

export const DynamicFormSequence = (props: DynamicFormSequenceProps) => {
 let id = props.id!;
 const txnId = props.txnId || getNewTxnId();
 const form = klona(props.form);
 const params = useParams();
 const { Ws } = useContext(WsContext);

 const location = useLocation();
 const navigate = useNavigate();

 const [divRef, setDivRef] = createSignal<HTMLFormElement>();
 onMount(() => {divRef()?.querySelector("input")?.focus();});

 if ( !props.id ) {
   // create a new vertex, but don't commit
   const newVertexObj = newVertex(getNewGraphId(), [form.label], {});
   // TODO: Do Create Transformation for the vertex
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
    navigate(`/${params.entity}`);
   }
 };

 return <div ref={setDivRef}>

   <DynamicForm form={form} id={id} txnId={txnId} />

  <Show when={!props.id}>
          <div ref={el => {
           const instance = new Button(el, { type: "success", onClick: onSubmit, text: "Save" });
           onCleanup(() => instance.dispose());
          }} />
         </Show>
  </div>
};