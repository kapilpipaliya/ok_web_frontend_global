import {
 createSignal,
 For,
 Match, onCleanup,
 onMount,
 Show,
 Switch,
 useContext
} from "solid-js";
import { klona } from "klona/json";

import {
 FieldAttribute,
 FormMetaData,
 Id,
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
import {
 getSelectionOptions,
 SelectInputField,
 setSelectionValue
} from "../input/SelectInputField";
import { newRow, TableInputField } from "../input/TableInputField";

import { TagField } from "../input/TagField";
import Tabs from "devextreme/ui/tabs";
import { A } from "@mobily/ts-belt";
import { CollectionOptionField } from "../input/CollectionOption";
import {  useNavigate } from "solid-app-router";

//'setValue(component,null)'
export function onChangeHandler(txnId: number, vertex: Vertex, changedFieldAttribute: Vertex) {
 if(!changedFieldAttribute.properties.props?.onchange) return;
 try{
  const args = JSON.parse(changedFieldAttribute.properties.props.onchange);
  
  const attribute = getSelectionOptions(changedFieldAttribute, "MetaAttribute<-MetaAttribute", "").find(vertex => vertex.properties.id === args[0]);
  if(!attribute) {
   return;
  }
   let value = args[1];

  if (value === null ) value = undefined;
  if(attribute.properties.component == "Select" || attribute.properties.component === "Tag") {
     setSelectionValue(txnId, vertex, attribute,  value)
   } else {
    mergeVertexProperties(txnId, vertex.id, { [attribute.properties.id]: value });
   }
 } catch (e) {

 }
}

interface DynamicFormProps {
 attributes: Vertex[];
 vertex: Vertex;

 setValue(attribute: Vertex, data: any): void;
}

export function DynamicForm(props: DynamicFormProps) {


 return <For
  each={props.attributes}>
  {(metaVertex) => {
   const id = props.vertex.id + metaVertex.properties.id + "Label";
   return (

    <Switch>
     <Match
      when={metaVertex.properties.component === "TextInput"}>
      <div class="dx-field">
       <div class="dx-field-label" id={id}>{toTitle(metaVertex.properties.title || metaVertex.properties.id)}</div>
       <div class="dx-field-value">
        <TextInputField
         aria-labeledby={id}
         data={props.vertex}
         meta={metaVertex}
         setValue={props.setValue}
        /></div>
      </div>
     </Match>
     <Match
      when={metaVertex.properties.component === "TextArea"}>
      <div class="dx-field">
       <div class="dx-field-label"
            id={id}>{toTitle(metaVertex.properties.title || metaVertex.properties.id)}</div>
       <div class="dx-field-value">
        <TextAreaField
         aria-labeledby={id}
         data={props.vertex}
         meta={metaVertex}
         setValue={props.setValue}

        /></div>
      </div>
     </Match>
     <Match
      when={metaVertex.properties.component === "NumberInput"}>
      <div class="dx-field">
       <div class="dx-field-label"
            id={id}>{toTitle(metaVertex.properties.title || metaVertex.properties.id)}</div>
       <div class="dx-field-value">
        <NumberInputField
         aria-labeledby={id}
         data={props.vertex}
         meta={metaVertex}
         setValue={props.setValue}
        /></div>
      </div>
     </Match>
     <Match
      when={metaVertex.properties.component === "DateInput"}>
      <div class="dx-field">
       <div class="dx-field-label"
            id={id}>{toTitle(metaVertex.properties.title || metaVertex.properties.id)}</div>
       <div class="dx-field-value">
        <DateInputField
         aria-labeledby={id}
         data={props.vertex}
         meta={metaVertex}
         setValue={props.setValue}
        /></div>
      </div>
     </Match>
     <Match
      when={metaVertex.properties.component === "DateTimeInput"}>
      <div class="dx-field">
       <div class="dx-field-label"
            id={id}>{toTitle(metaVertex.properties.title || metaVertex.properties.id)}</div>
       <div class="dx-field-value">
        <DateInputField
         aria-labeledby={id}
         // type="datetime"
         data={props.vertex}
         meta={metaVertex}
         setValue={props.setValue}
        /></div>
      </div>
     </Match>
     <Match when={metaVertex.properties.component === "JsCode"}>
      <div class="dx-field">
       <div class="dx-field-label"
            id={id}>{toTitle(metaVertex.properties.title || metaVertex.properties.id)}</div>
       <div class="dx-field-value">
        <TextAreaField
         aria-labeledby={id}
         data={props.vertex}
         meta={metaVertex}
         setValue={props.setValue}
        /></div>
      </div>
     </Match>
     <Match
      when={metaVertex.properties.component === "CheckBox"}>
      <div class="dx-field">
       <div class="dx-field-label"
            id={id}>{toTitle(metaVertex.properties.title || metaVertex.properties.id)}</div>
       <div class="dx-field-value">
        <BooleanInputField
         aria-labeledby={id}
         data={props.vertex}
         meta={metaVertex}
         setValue={props.setValue}
        /></div>
      </div>
     </Match>
     <Match
      when={metaVertex.properties.component === "Json"}>
      <div class="dx-field">
       <div class="dx-field-label" id={id}>{toTitle(metaVertex.properties.title || metaVertex.properties.id)}</div>
       <div class="dx-field-value">
        <JsonInput
         aria-labeledby={id}
         vertex={props.vertex}
         meta={metaVertex}
         setValue={props.setValue}
        />
       </div>
      </div>
     </Match>
     <Match when={metaVertex.properties.component === "Select"}>
      <div class="dx-field">
       <div class="dx-field-label" id={id}>{toTitle(metaVertex.properties.title || metaVertex.properties.id)}</div>
       <div class="dx-field-value">
        <SelectInputField
         aria-labeledby={id}
         data={props.vertex}
         meta={metaVertex}
        />
       </div>
      </div>
     </Match>
     <Match when={metaVertex.properties.component === "Tag"}>
      <div class="dx-field">
       <div class="dx-field-label" id={id}>{toTitle(metaVertex.properties.title || metaVertex.properties.id)}</div>
       <div class="dx-field-value">
        <TagField
         aria-labeledby={id}
         data={props.vertex}
         meta={metaVertex}
        />
       </div>
      </div>
     </Match>
     <Match when={metaVertex.properties.component === "Table"}>
      <h3>{toTitle(metaVertex.properties.title || metaVertex.properties.id)}</h3>
      <TableInputField
       meta={metaVertex}
       data={props.vertex}
      />
     </Match>
     <Match when={metaVertex.properties.component === "CollectionOption"}>
      <h3>{toTitle(metaVertex.properties.title || metaVertex.properties.id)}</h3>
      <CollectionOptionField
       aria-labeledby={id}
       meta={metaVertex}
       data={props.vertex}
       setValue={props.setValue}
      />
     </Match>
    </Switch>
   )
  }}
  </For>

}

export interface DynamicFormSequenceProps {
 meta?: Vertex;
 form: FormMetaData;
 id?: Id;
}

export const DynamicFormSequence = (props: DynamicFormSequenceProps) => {
 const form = klona(props.form);
 const { Ws } = useContext(WsContext);
 const navigate = useNavigate();

 // create a new vertex or use existing vertex
 let vertex: Vertex;
 if ( !props.id ) {
  if (!form["id"]) {
   return "Id not found"
  }
  const txnId = getNewTxnId();
   const newVertexObj = newVertex(getNewGraphId(), [form.id], {});
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

 // focus first input
 const [divRef, setDivRef] = createSignal<HTMLFormElement>();
 onMount(() => {
  divRef()?.querySelector("input")?.focus();
 });

 const {attributes: _, ...custom} = props.form;

 // save attributes to vertexes
 let metaVertexId: Id;
 if (props.meta) {
  metaVertexId = props.meta.id;
 } else {

  const metaMainVertex = newVertex(getNewGraphId(), ["Temp"], custom);
  const { error } = addNewVertex(getNewTxnId(), metaMainVertex);
  if (error) {
   alert(error);
   return;
  }
  metaVertexId = metaMainVertex.id;
 }

 const addMetaVertexes = (vertexId: Id, attributes: FieldAttribute[]) => {
  for (const attribute of attributes) {
   const addAttributeResult = newRow(getNewTxnId(), graph.vertexes[vertexId], "MetaAttribute");
   if (addAttributeResult.error) {
    alert(addAttributeResult.error);
   }
   // todo discard transaction

   const attr = klona(attribute);
   if (!attr.tab) attr.tab = "main";
   if (!attr.group) attr.group = "main";
   // if(attribute.component === "Table") attribute.group = attribute.id;


   mergeVertexProperties(getNewTxnId(), addAttributeResult.vertexId!, attr);

   if (attribute.component === "Table" && attribute.attributes) {
    addMetaVertexes(addAttributeResult.vertexId!, attribute.attributes);
   }
   // todo discard transaction
  }
 };
 addMetaVertexes(metaVertexId, form.attributes);

 onCleanup(() => {
  if(!props.meta) {
   // TODO: Remove all the meta
  }
 })

 const mainAttributes = getSelectionOptions(graph.vertexes[metaVertexId], "->MetaAttribute", ""); //.sort((a, b) => a.properties.pos - b.properties.pos);


 const groupByTabs = A.groupBy(mainAttributes, (item => item.properties.tab!)) as unknown as { [tab: string]: Vertex[] };

 const groupByTabsAndGroup = {} as { [tab: string]: { [group: string]: Vertex[] } };
 for (const tab in groupByTabs) {
  groupByTabsAndGroup[tab] = A.groupBy(groupByTabs[tab]!, item => item.properties.group!) as unknown as { [group: string]: Vertex[] };
 }

 const tabs = Object.keys(groupByTabs).filter(tab => tab !== "main");

 const [activeTab, setActiveTab] = createSignal(tabs[0]);


 const setValue = (attribute: Vertex, data: any) => {
  const txnId = getNewTxnId();
  mergeVertexProperties(txnId, vertex.id, { [attribute.properties.id]: data });
  onChangeHandler(txnId, vertex, attribute);
  commitTxn(txnId, Ws);
 };

 return <div ref={setDivRef} class="form">

  {/* Main Tab is display as top level fields */}
  <Show when={groupByTabsAndGroup["main"]}>
   <For each={Object.keys(groupByTabsAndGroup["main"])}>
    {group => <>
     <div class="dx-fieldset" style={{
      "max-width": groupByTabsAndGroup["main"][group].filter(attribute => attribute.properties.component === "Table").length ? "100%" : "600px"
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
     "max-width": groupByTabsAndGroup[activeTab()][group].filter(attribute => attribute.properties.component === "Table").length ? "100%" : "600px"
    }}>
     <Show when={group !== "main"}>
      <div class="dx-fieldset-header">{group}</div>
     </Show>
     <DynamicForm attributes={groupByTabsAndGroup[activeTab()][group]}
                  vertex={vertex} setValue={setValue} />
    </div>;
   }}</For>


  </Show>
  <button type="button" class="border:0 cursor:pointer" onClick={() => {
    navigate(-1)
  }}>Back</button>

 </div>;
};