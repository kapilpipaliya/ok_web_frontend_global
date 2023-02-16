import {
 createSignal,
 For,
 Match,
 onMount,
 Switch,
 useContext
} from "solid-js";
import { klona } from "klona/json";
import { path } from "rambda";

import {
 ButtonGroupField,
 DataType,
 FieldAttribute,
 FormMetaData,
 Id,
 SelectField,
 TableField,
 Vertex
} from "../input/Form";
import { AttributesTableData } from "../api";
import { toTitle } from "case-switcher-js";
import { commitTxn, getNewGraphId, getNewTxnId, graph } from "../../lib/graph";
import {
 addNewVertex,
 mergeVertexProperties,
 newVertex
} from "../../lib/Vertex";
import { WsContext } from "../ws_events_dispatcher";
import { TextInputField } from "../input/TextInputField";
import { TextAreaField } from "../input/TextAreaField";
import { NumberInputField } from "../input/NumberInputField";
import { DateInputField } from "../input/DateInputField";
import { BooleanInputField } from "../input/BooleanInputField";
import { Field } from "../input/core/Field";
import { JsonInput } from "../input/JsonInput";
import { GeneralInput } from "../input/GeneralInput";
import {
 SelectInputField,
 setSelectionValue
} from "../input/SelectInputField";
import { TableInputField } from "../input/TableInputField";
import { ButtonGroup } from "../input/core/ButtonGroup";
import { TagField } from "../input/TagField";

// memorize this function
const normalizeFormMetaData = (form: FormMetaData) => {
 return form.attributes.reduce((acc,curr) => {
  acc[curr.id] = curr;
  return acc;
 }, {} as {[key: string]: FieldAttribute})
}

//'setValue(component,null)'
export function onChangeHandler(txnId: number, vertex: Vertex, form: FormMetaData, changedFieldAttribute: FieldAttribute) {
 if(!changedFieldAttribute.onchange) return;
 try{
  const args = JSON.parse(changedFieldAttribute.onchange);
   const attribute = path(args[0], normalizeFormMetaData(form));
   let value = args[1];

  if (value === null ) value = undefined;
  if(attribute.component == "Select" || attribute.component === "Tag") {
     setSelectionValue(txnId, vertex, attribute,  value)
   } else {
    mergeVertexProperties(txnId, vertex.id, { [attribute.id]: value });
   }
 } catch (e) {

 }
}

interface DynamicFormProps {
 form: FormMetaData;
 vertex: Vertex;
}

export function DynamicForm(props: DynamicFormProps) {
 const { Ws } = useContext(WsContext);
 const setValue = (attribute: FieldAttribute, data: any) => {
  const txnId = getNewTxnId();
  mergeVertexProperties(txnId,props.vertex.id, {[attribute.id]: data})
  onChangeHandler(txnId, props.vertex, props.form, attribute);
  commitTxn(txnId, Ws);
 }

  return <><For
   each={props.form.attributes}>
   {(meta) => (
    <Switch>
     <Match
      when={meta.component === "TextInput" || (!meta.component && meta.serverType === DataType.String)}>
      <TextInputField
       name={props.form.id + meta.id}
       label={toTitle(meta.label || meta.id)}
       value={props.vertex.properties[meta.id]}
       setValue={(value) => setValue(meta, value)}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "TextArea"}>
      <TextAreaField
       id={props.form.id + meta.id}
       label={toTitle(meta.label || meta.id)}
       value={props.vertex.properties[meta.id]}
       setValue={(value) => setValue(meta, value)}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "NumberInput" || (!meta.component && (meta.serverType === DataType.Integer || meta.serverType === DataType.Float))}>
      <NumberInputField
       name={props.form.id + meta.id}
       label={toTitle(meta.label || meta.id)}
       value={props.vertex.properties[meta.id]}
       setValue={(value) => setValue(meta, value)}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "DateInput" || (!meta.component && (meta.serverType === DataType.Date))}>
      <DateInputField
       name={props.form.id + meta.id}
       label={toTitle(meta.label || meta.id)}
       value={props.vertex.properties[meta.id]}
       setValue={(value) => setValue(meta, value)}
      />
     </Match>
     <Match
      when={meta.component === "DateTimeInput" || (!meta.component && (meta.serverType === DataType.LocalDateTime || meta.serverType === DataType.LocalTime))}>
      <DateInputField
       name={props.form.id + meta.id}
       label={toTitle(meta.label || meta.id)}
       type="datetime"
       value={props.vertex.properties[meta.id]}
       setValue={(value) => setValue(meta, value)}
      />
     </Match>
     <Match when={meta.component === "JsCode"}>
      <TextAreaField
       name={props.form.id + meta.id}
       label={toTitle(meta.label || meta.id)}
       value={props.vertex.properties[meta.id]}
       setValue={(value) => setValue(meta, value)}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "Boolean" || (!meta.component && meta.serverType === DataType.Boolean)}>
      <BooleanInputField
       name={props.form.id + meta.id}
       text={toTitle(meta.label || meta.id)}
       value={props.vertex.properties[meta.id]}
       setValue={(value) => setValue(meta, value)}
       {...(meta.props || {})}
      />
     </Match>
     <Match
      when={meta.component === "Json" && (!meta.component && meta.serverType === DataType.Map)}>
      <Field label={toTitle(meta.label || meta.id)}>
       <JsonInput
        name={props.form.id + meta.id}
        value={props.vertex.properties[meta.id]}
        setValue={(value) => setValue(meta, value)}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
     <Match when={meta.component === "Dynamic"}>
      <Field label={toTitle(meta.label || meta.id)}>
       <GeneralInput
        id={props.form.id + meta.id}
        value={props.vertex.properties[meta.id]}
        setValue={(value) => setValue(meta, value)}
        {...(meta.props || {})}
       />
      </Field>
     </Match>
     <Match when={meta.component === "Select"}>
      <Field label={toTitle(meta.label || meta.id)}>
       <SelectInputField

        vertex={props.vertex}
        meta={meta as SelectField}
        name={props.form.id + meta.id}
        form={props.form}
        
       />
      </Field>
     </Match>
     <Match when={meta.component === "Tag"}>
      <Field label={toTitle(meta.label || meta.id)}>
       <TagField
        
        vertex={props.vertex}
        meta={meta as SelectField}
        name={props.form.id + meta.id}
        form={props.form}
        
       />
      </Field>
     </Match>
     <Match when={meta.component === "Table"}>
      <Field label={toTitle(meta.label || meta.id)}>
       {() => {
        return <TableInputField
         // id={props.form.id + meta.id}
         
         meta={meta as TableField}
         vertex={props.vertex}
         
        />
       }}
      </Field>
     </Match>
     <Match when={meta.component === "TableForm"}>
      <Field label={toTitle(meta.label || meta.id)}>
       <TableInputField
        type={"form"}
        id={props.form.id + meta.id}
        
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

}

export interface DynamicFormSequenceProps {
 form: FormMetaData;
 id?: Id;
}

export const DynamicFormSequence = (props: DynamicFormSequenceProps) => {
 const form = klona(props.form);
 const { Ws } = useContext(WsContext);

 let vertex: Vertex;
 if ( !props.id ) {
  if (!form["label"]) {
   return "Label not found"
  }
  const txnId = getNewTxnId();
   const newVertexObj = newVertex(getNewGraphId(), [form.label], {});
   // TODO: Do Create Transformation for the vertex
  const {error} = addNewVertex(txnId, newVertexObj);
  if (error) {
   alert(error);
   return;
  }
  commitTxn(txnId, Ws);
  vertex = graph.vertexes[newVertexObj.id];
 } else {
  if(!graph.vertexes[props.id]) {
   alert('vertex not found');
   return;
  }
  vertex = graph.vertexes[props.id];
 }

 const [divRef, setDivRef] = createSignal<HTMLFormElement>();
 onMount(() => {divRef()?.querySelector("input")?.focus();});

 return <div ref={setDivRef}>

   <DynamicForm form={form} vertex={vertex}/>
  
  </div>
};