import {
 createSignal,
 For,
 Match,
 onMount,
 Show,
 Switch,
 useContext
} from "solid-js";
import { klona } from "klona/json";
import { path } from "rambda";

import {
 DataType,
 FieldAttribute,
 FormMetaData,
 Id,
 SelectField,
 TableField,
 Vertex
} from "../input/Form";
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
import { JsonInput } from "../input/JsonInput";
import { SelectInputField, setSelectionValue } from "../input/SelectInputField";
import { TableInputField } from "../input/TableInputField";

import { TagField } from "../input/TagField";
import Tabs from "devextreme/ui/tabs";
import { A } from "@mobily/ts-belt";


// memorize this function
const normalizeFormMetaData = (form: FormMetaData) => {
 return form.attributes.reduce((acc, curr) => {
  acc[curr.id] = curr;
  return acc;
 }, {} as { [key: string]: FieldAttribute });
};

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
 attributes: FieldAttribute[];
 vertex: Vertex;

 setValue(attribute: FieldAttribute, data: any): void;
}

export function DynamicForm(props: DynamicFormProps) {


 return <For
  each={props.attributes}>
  {(meta) => {
   const id = props.vertex.id + meta.id + "Label";
   return (

    <Switch>
     <Match
      when={meta.component === "TextInput" || (!meta.component && meta.dataType === DataType.String)}>
      <div class="dx-field">
       <div class="dx-field-label" id={id}>{toTitle(meta.label || meta.id)}</div>
       <div class="dx-field-value">
        <TextInputField
         aria-labeledby={id}
         value={props.vertex.properties[meta.id]}
         setValue={(value) => props.setValue(meta, value)}
         
        /></div>
      </div>
     </Match>
     <Match
      when={meta.component === "TextArea"}>
      <div class="dx-field">
       <div class="dx-field-label" id={id}>{toTitle(meta.label || meta.id)}</div>
       <div class="dx-field-value"><TextAreaField
        aria-labeledby={id}
        value={props.vertex.properties[meta.id]}
        setValue={(value) => props.setValue(meta, value)}
        
       /></div>
      </div>
     </Match>
     <Match
      when={meta.component === "NumberInput" || (!meta.component && (meta.dataType === DataType.Integer || meta.dataType === DataType.Float))}>
      <div class="dx-field">
       <div class="dx-field-label" id={id}>{toTitle(meta.label || meta.id)}</div>
       <div class="dx-field-value"><NumberInputField
        aria-labeledby={id}
        label={toTitle(meta.label || meta.id)}
        value={props.vertex.properties[meta.id]}
        setValue={(value) => props.setValue(meta, value)}
        
       /></div>
      </div>
     </Match>
     <Match
      when={meta.component === "DateInput" || (!meta.component && (meta.dataType === DataType.Date))}>
      <div class="dx-field">
       <div class="dx-field-label" id={id}>{toTitle(meta.label || meta.id)}</div>
       <div class="dx-field-value"><DateInputField
        aria-labeledby={id}
        label={toTitle(meta.label || meta.id)}
        value={props.vertex.properties[meta.id]}
        setValue={(value) => props.setValue(meta, value)}
       /></div>
      </div>
     </Match>
     <Match
      when={meta.component === "DateTimeInput" || (!meta.component && (meta.dataType === DataType.LocalDateTime || meta.dataType === DataType.LocalTime))}>
      <div class="dx-field">
       <div class="dx-field-label" id={id}>{toTitle(meta.label || meta.id)}</div>
       <div class="dx-field-value"><DateInputField
        aria-labeledby={id}
        label={toTitle(meta.label || meta.id)}
        type="datetime"
        value={props.vertex.properties[meta.id]}
        setValue={(value) => props.setValue(meta, value)}
       /></div>
      </div>
     </Match>
     <Match when={meta.component === "JsCode"}>
      <div class="dx-field">
       <div class="dx-field-label" id={id}>{toTitle(meta.label || meta.id)}</div>
       <div class="dx-field-value"><TextAreaField
        aria-labeledby={id}
        label={toTitle(meta.label || meta.id)}
        value={props.vertex.properties[meta.id]}
        setValue={(value) => props.setValue(meta, value)}
        
       /></div>
      </div>
     </Match>
     <Match
      when={meta.component === "Boolean" || (!meta.component && meta.dataType === DataType.Boolean)}>
      <div class="dx-field">
       <div class="dx-field-label" id={id}>{toTitle(meta.label || meta.id)}</div>
       <div class="dx-field-value"><BooleanInputField
        aria-labeledby={id}
        text={toTitle(meta.label || meta.id)}
        value={props.vertex.properties[meta.id]}
        setValue={(value) => props.setValue(meta, value)}
        
       /></div>
      </div>
     </Match>
     <Match
      when={meta.component === "Json" && (!meta.component && meta.dataType === DataType.Map)}>
      <div class="dx-field">
       <div class="dx-field-label" id={id}>{toTitle(meta.label || meta.id)}</div>
       <div class="dx-field-value">
        <JsonInput
         aria-labeledby={id}
         value={props.vertex.properties[meta.id]}
         setValue={(value) => props.setValue(meta, value)}
         
        />
       </div>
      </div>
     </Match>
     <Match when={meta.component === "Select"}>
      <div class="dx-field">
       <div class="dx-field-label" id={id}>{toTitle(meta.label || meta.id)}</div>
       <div class="dx-field-value">
        <SelectInputField
         aria-labeledby={id}
         vertex={props.vertex}
         meta={meta as SelectField}

         form={props.attributes}

        />
       </div>
      </div>
     </Match>
     <Match when={meta.component === "Tag"}>
      <div class="dx-field">
       <div class="dx-field-label" id={id}>{toTitle(meta.label || meta.id)}</div>
       <div class="dx-field-value">
        <TagField
         aria-labeledby={id}
         vertex={props.vertex}
         meta={meta as SelectField}

         form={props.attributes}

        />
       </div>
      </div>
     </Match>
     <Match when={meta.component === "Table"}>
      <h3>{toTitle(meta.label || meta.id)}</h3>
      <TableInputField
       meta={meta as TableField}
       vertex={props.vertex}
      />

     </Match>
    </Switch>
   )
  }}
  </For>

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
  if (!graph.vertexes[props.id]) {
   alert("vertex not found");
   return;
  }
  vertex = graph.vertexes[props.id];
 }

 const [divRef, setDivRef] = createSignal<HTMLFormElement>();
 onMount(() => {
  divRef()?.querySelector("input")?.focus();
 });

 for (const attribute of form.attributes) {
  if (!attribute.tab) attribute.tab = "main";
  if (!attribute.group) attribute.group = "main";
  // if(attribute.component === "Table") attribute.group = attribute.id;
 }

 const groupByTabs = A.groupBy(form.attributes, (item => item.tab!)) as unknown as { [tab: string]: FieldAttribute[] };

 const groupByTabsAndGroup = {} as { [tab: string]: { [group: string]: FieldAttribute[] } };
 for (const tab in groupByTabs) {
  groupByTabsAndGroup[tab] = A.groupBy(groupByTabs[tab]!, item => item.group!) as unknown as { [group: string]: FieldAttribute[] };
 }

 const tabs = Object.keys(groupByTabs).filter(tab => tab !== "main");

 const [activeTab, setActiveTab] = createSignal(tabs[0]);


 const setValue = (attribute: FieldAttribute, data: any) => {
  const txnId = getNewTxnId();
  mergeVertexProperties(txnId, vertex.id, { [attribute.id]: data });
  onChangeHandler(txnId, vertex, form, attribute);
  commitTxn(txnId, Ws);
 };

 return <div ref={setDivRef} class="form">

  <Show when={groupByTabsAndGroup["main"]["main"]}>
   <For each={Object.keys(groupByTabsAndGroup["main"])}>
    {group => <>
     <div class="dx-fieldset" style={{
      "max-width": groupByTabsAndGroup["main"][group].filter(attribute => attribute.component === "Table").length ? "100%" : "600px"
     }}>
      {/*<div class="dx-fieldset-header">Simple Field Set</div>*/}
      <DynamicForm attributes={groupByTabsAndGroup["main"][group]}
                   vertex={vertex} setValue={setValue} />
     </div>
    </>}
   </For>
  </Show>

  <Show when={tabs.length}>
   <div ref={el => {
    // https://js.devexpress.com/Demos/WidgetsGallery/Demo/Tabs/Overview/jQuery/Light/
    // @ts-ignore
    const tabsInstance = new Tabs(el, {
     dataSource: tabs,
     width: 800,
     scrollByContent: true,
     showNavButtons: true,
     selectedIndex: 0,
     onItemClick(e) {
      setActiveTab(e.itemData);
     }
    });
   }
   } />

   <For each={Object.keys(groupByTabsAndGroup[activeTab()])}>{group => {
    return <div class="dx-fieldset" style={{
     "max-width": groupByTabsAndGroup[activeTab()][group].filter(attribute => attribute.component === "Table").length ? "100%" : "600px"
    }}>
     <Show when={group !== "main"}>
      <div class="dx-fieldset-header">{group}</div>
     </Show>
     <DynamicForm attributes={groupByTabsAndGroup[activeTab()][group]}
                  vertex={vertex} setValue={setValue} />
    </div>;
   }}</For>


  </Show>


 </div>;
};