import {
 createContext,
 createSignal,
 For,
 Match,
 onCleanup,
 onMount,
 Show,
 Switch,
 useContext
} from "solid-js";
import { klona } from "klona/json";

import { FieldAttribute, FormMetaData, Id, Vertex } from "../input/Form";
import { toTitle } from "case-switcher-js";
import { commitTxn, getNewGraphId, getNewTxnId, graph } from "../../lib/graph";
import {
 addNewVertex,
 mergeVertexProperties,
 newVertex
} from "../../lib/Vertex";
import { WsContext } from "../ws_events_dispatcher";

import {
 getChildVertexes,
 getOptionLabel,
 getSelectionOptions,
 SelectInputField,
 setSelectionValue
} from "../input/SelectInputField";
import { newRow, TableInputField } from "../input/TableInputField";

import { TagField } from "../input/TagField";
import Tabs from "devextreme/ui/tabs";
import { A } from "@mobily/ts-belt";
import { CollectionOptionField } from "../input/CollectionOption";
import { useNavigate } from "solid-app-router";
import { capitalizeFirstLetter } from "../utils";
import { AbstractSingleForm } from "../Froms";
import { GenericInputField } from "../input/GenaricInputField";

export const FormContext = createContext({} as {[key: string]: any})

//'setValue(component,null)'
export function onChangeHandler(txnId: number, vertex: Vertex, changedFieldAttribute: Vertex) {
 if(!changedFieldAttribute.properties.props?.onchange) return;
 try{
  const args = JSON.parse(changedFieldAttribute.properties.props.onchange);
  
  const attribute = (getSelectionOptions(changedFieldAttribute, "MetaAttr<-MetaAttr", "").vertexes || []).find(vertex => vertex.properties.id === args[0]);
  if(!attribute) {
   return;
  }
   let value = args[1];

  if (value === null) value = undefined;
  if (attribute.properties.component == "Select" || attribute.properties.component === "Tag") {
   setSelectionValue(txnId, vertex, attribute, value);
  } else {
   mergeVertexProperties(txnId, vertex.id, { [attribute.properties.id]: value });
  }
 } catch (e) {

 }
}
const FormComponent = (props: {meta: Vertex, data: Vertex, formId: string}) => {
 const { local } = useContext(FormContext);
 const { Ws } = useContext(WsContext);
 const type = props.data.labels[0] + capitalizeFirstLetter(props.meta.properties.id) + props.formId;

 const attributes = getSelectionOptions(props.meta, "->MetaAttr", "");
 const newMeta = attributes.error ? graph.vertexes[newRow(getNewTxnId(), props.meta, "MetaAttr").vertexId!] : attributes.vertexes![0];
 mergeVertexProperties(getNewTxnId(), newMeta.id,{id: type});

 const vertexes = getSelectionOptions(props.data, `->${type}`, "");
 let newVertex: any;
 if (vertexes.error) {
  const txnId = getNewTxnId();
  newVertex = graph.vertexes[newRow(txnId, props.data, `${type}`).vertexId!];
  if(!local) commitTxn(txnId, Ws);
 } else {
  newVertex = vertexes.vertexes![0];
 }

 return <AbstractSingleForm
  meta={newMeta}
  formId={props.formId}
  id={newVertex.id}
 />;
}
export const DynamicComponent = (props: { id: string, component: string, meta: Vertex, data: Vertex, setValue(attribute: Vertex, data: any): void }) => {
 const genericComponents = [
  "AutocompleteField",
  "BarGaugeField",
  "BulletField",
  "CalendarField",
  "CheckBoxField",
  "CircularGaugeField",
  "ColorBoxField",
  "DateBoxField",
  "DropDownBoxField",
  "FileUploaderField",
  "FilterBuilderField",
  "HtmlEditorField",
  "LinearGaugeField",
  "NumberBoxField",
  "ProgressBarField",
  "RadioGroupField",
  "RangeSelectorField",
  "RangeSliderField",
  "SelectBoxField",
  "SliderField",
  "SwitchField",
  // "TagBoxField", // giving error with undefined values
  "TextAreaField",
  "TextBoxField",
 ];
 return <Switch>
  <Match when={props.component === "SelectBoxJoinField"}>
   <SelectInputField
    aria-labeledby={props.id}
    data={props.data}
    meta={props.meta}
   />
  </Match>
  <Match when={props.component === "TagBoxJoinField"}>
   <TagField
    aria-labeledby={props.id}
    data={props.data}
    meta={props.meta}
   />
  </Match>
  <Match when={props.component === "TableField"}>
   <TableInputField
    meta={props.meta}
    data={props.data}
   />
  </Match>
  <Match when={props.component === "CollectionOptionField"}>
   <CollectionOptionField
    aria-labeledby={props.id}
    meta={props.meta}
    data={props.data}
    setValue={props.setValue}
   />
  </Match>
  <Match when={props.component.startsWith("Form")}>
   <td>
    <div
     class="flex">{props.meta.properties.props?.defaultValue && getOptionLabel(props.data, props.meta.properties.props.defaultValue)}
     <FormComponent meta={props.meta} data={props.data} formId={props.component.slice(4)}/>
    </div>
   </td>
  </Match>
  <Match when={genericComponents.includes(props.component)}>
   <GenericInputField
    aria-labeledby={props.id}
    data={props.data}
    meta={props.meta}
    component={props.component}
    setValue={props.setValue}
   />
  </Match>
 </Switch>;
};

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
     <Match when={metaVertex.properties.component === "TableField"}>
      <h3>{toTitle(metaVertex.properties.title || metaVertex.properties.id)}</h3>
      <DynamicComponent id={id} component={metaVertex.properties.component} meta={metaVertex} data={props.vertex} setValue={props.setValue} />
     </Match>
     <Match when={metaVertex.properties.component === "CollectionOption"}>
      <DynamicComponent id={id} component={metaVertex.properties.component} meta={metaVertex} data={props.vertex} setValue={props.setValue} />
     </Match>
     <Match when={true}>
      <div class="dx-field">
       <div class="dx-field-label" id={id}>{toTitle(metaVertex.properties.title || metaVertex.properties.id)}</div>
       <div class="dx-field-value">
        <DynamicComponent id={id} component={metaVertex.properties.component}
                          meta={metaVertex} data={props.vertex}
                          setValue={props.setValue} />
       </div>
      </div>
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
 config: {[key: string]: any}
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
  if(!form.local) commitTxn(txnId, Ws);
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
 let metaVertex: Vertex;
 if (props.meta) {
  metaVertex = props.meta;
 } else {

  const metaMainVertex = newVertex(getNewGraphId(), ["Temp"], custom);
  const { error } = addNewVertex(getNewTxnId(), metaMainVertex);
  if (error) {
   alert(error);
   return;
  }
  metaVertex = graph.vertexes[metaMainVertex.id];
 }

 props.config['vertex'] = vertex;
 props.config['meta'] = metaVertex;

 const addMetaVertexes = (vertex: Vertex, attributes: FieldAttribute[]) => {
  for (const attribute of attributes) {
   const addAttributeResult = newRow(getNewTxnId(), vertex, "MetaAttr");
   if (addAttributeResult.error) {
    alert(addAttributeResult.error);
   }
   // todo discard transaction

   const attr = klona(attribute);
   if (!attr.tab) attr.tab = "main";
   if (!attr.group) attr.group = "main";
   // if(attribute.component === "TableField") attribute.group = attribute.id;


   mergeVertexProperties(getNewTxnId(), addAttributeResult.vertexId!, attr);

   if (attribute.component === "TableField" && attribute.attributes) {
    addMetaVertexes(graph.vertexes[addAttributeResult.vertexId!], attribute.attributes);
   }
   // todo discard transaction
  }
 };
 addMetaVertexes(metaVertex, form.attributes);

 onCleanup(() => {
  if(!props.meta) {
   // TODO: Remove all the meta
  }
 })

 const mainAttributes = getChildVertexes(["MetaAttr"], [metaVertex]); //.sort((a, b) => a.properties.pos - b.properties.pos);


 const groupByTabs = A.groupBy(mainAttributes.vertexes!, (item => item.properties.tab!)) as unknown as { [tab: string]: Vertex[] };

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
  if(!form.local) commitTxn(txnId, Ws);
 };

 return <FormContext.Provider value={{local: form.local}}>
  <div ref={setDivRef} class="form">

  {/* Main Tab is display as top level fields */}
  <Show when={groupByTabsAndGroup["main"]}>
   <For each={Object.keys(groupByTabsAndGroup["main"])}>
    {group => <>
     <div class="dx-fieldset" style={{
      "max-width": groupByTabsAndGroup["main"][group].filter(attribute => attribute.properties.component === "TableField").length ? "100%" : "600px"
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
     "max-width": groupByTabsAndGroup[activeTab()][group].filter(attribute => attribute.properties.component === "TableField").length ? "100%" : "600px"
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

 </div>
 </FormContext.Provider>;
};