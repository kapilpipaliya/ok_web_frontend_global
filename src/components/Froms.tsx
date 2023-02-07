import {
 createUniqueId,
 For,
 onCleanup,
 splitProps,
 useContext
} from "solid-js";
import { Link, useNavigate, useParams } from "solid-app-router";
import { graph, revertTransaction } from "../lib/graph";
import { removeUndefinedProperties } from "../utils/functions";
import {
 EdgeLabels,
 FormMetaData,
 Id,
 VertexLabels
} from "./input/Form";
import { evalImpl } from "./utils";
import {
 DynamicFormSequence,
 DynamicFormSequenceProps
} from "./core/dynamicForm";
import { AlertMessageContext } from "../appState";
import { Alert } from "../Type";
import { WsContext, WSEvent } from "./ws_events_dispatcher";
import { G } from "@mobily/ts-belt";

export const AllForms = () => {
 const allFormLayouts = () => graph.vertexLabelIdMap[VertexLabels.FormLayout]?.map(formLayoutVertex => graph.vertexes[formLayoutVertex]) || [];

 return <div class="flex flex:row flex:wrap">
  <For each={allFormLayouts()}>
   {formLayout => <Link href={`/form/${formLayout.properties.id}`}>{formLayout.properties.id}</Link>}
  </For>
 </div>
}
interface AbstractSingleFormProps extends Omit<DynamicFormSequenceProps, 'form'>{
 formId: string;
}
export const AbstractSingleForm = (props: AbstractSingleFormProps) => {
 const formLayoutId = () => (graph.vertexLabelIdMap[VertexLabels.FormLayout] || []).find(vertexId => graph.vertexes[vertexId].properties['id'] === props.formId)
 const formLayout = graph.vertexes[props.formId] || graph.vertexes[`${formLayoutId()}`];
 if(!formLayout) {
  alert('form dont found');
  return;
 }
 const formLayoutHasItems = formLayout.out_edges[EdgeLabels.FormLayoutHasItem].map(edge=>graph.edges[edge]).sort((a,b)=>a.properties.pos - b.properties.pos);

 const generateNewApi = () => {
  const forms = formLayoutHasItems.map(edgeFormLayoutHasItem=> {
   const vertexFormLayoutItem = graph.vertexes[edgeFormLayoutHasItem.end];
   if(typeof vertexFormLayoutItem.properties['labelName'] === "number") {
    vertexFormLayoutItem.properties['labelName'] = graph.vertexes[vertexFormLayoutItem.properties['labelName']].properties.id;
   }

   // assume collection is always set, and single select
   const edgeFormLayoutItemHasCollectionId = vertexFormLayoutItem.out_edges[EdgeLabels.FormLayoutItemHasCollection][0]
   const vertexCollection = graph.vertexes[graph.edges[edgeFormLayoutItemHasCollectionId].end];
   const collectionAttributeAndPropertiesMap = vertexCollection.out_edges[EdgeLabels.CollectionHasAttribute].reduce((acc, collectionHasAttributeId)=>{
    const edgeCollectionHasAttribute = graph.edges[collectionHasAttributeId];
    const attribute = graph.vertexes[edgeCollectionHasAttribute.end]
    acc[attribute.id] = edgeCollectionHasAttribute.properties;
    return acc;
   }, {} as {[key: Id]: {[p: string]: any}})

   const formLayoutItemAttributeIds = vertexFormLayoutItem.out_edges[EdgeLabels.FormLayoutItemHasAttribute] || [];
   const attributes  = formLayoutItemAttributeIds.map(formLayoutItemAttributeId => {
    const edgeFormLayoutItemAttribute = graph.edges[formLayoutItemAttributeId];

    const attributeId = edgeFormLayoutItemAttribute.end;
    const vertexAttribute = graph.vertexes[attributeId];
    const collectionAttribute = collectionAttributeAndPropertiesMap[attributeId];
    // get touched, dirty, submitted, page, validators and set to fieldOptions
    // pass other property to attributes
    // if props is string eval it else if its object use it
    const attribute = Object.assign({}, removeUndefinedProperties(vertexAttribute.properties, false, 10), removeUndefinedProperties(collectionAttribute, false, 10), removeUndefinedProperties(edgeFormLayoutItemAttribute.properties, false, 10));
    if(attribute.component) {
     attribute.component = graph.vertexes[attribute.component].properties.id;
    }
    if(attribute.serverType) {
     attribute.serverType = graph.vertexes[attribute.serverType].properties.id;
    if(attribute.props){
     attribute.props = evalImpl(attribute.props);
    }
     if(attribute.code){
      attribute.code = evalImpl(attribute.code);
     }
     if(attribute.meta) {
      const meta = evalImpl(attribute.meta);
      if(G.isObject(meta)){
       Object.assign(attribute, meta);
       delete attribute.meta;
      }
     }
    }
    return attribute;
   }).sort((a,b)=>a.pos-b.pos);
   const from = vertexFormLayoutItem.properties.from
   const to = vertexFormLayoutItem.properties.to
   const save = [vertexFormLayoutItem.properties.labelType, vertexFormLayoutItem.properties.labelName, from ? evalImpl(from) : undefined, to ? evalImpl(to) : undefined];
   const formLayoutItemProperties = { ...vertexFormLayoutItem.properties };
   if(formLayoutItemProperties.meta) {
    const meta = evalImpl(formLayoutItemProperties.meta);
    if(G.isObject(meta)){
     Object.assign(formLayoutItemProperties, meta);
     delete formLayoutItemProperties.meta;
    }
   }
   return {save, ...formLayoutItemProperties, attributes} as FormMetaData
  })
  return forms;
 }
 const forms = generateNewApi();
 console.log(forms);

 const [_, customProps] = splitProps(props, ['formId']);
 const {id, ...formLayoutProperties} = formLayout.properties;
 if(formLayoutProperties.meta) {
  const meta = evalImpl(formLayoutProperties.meta);
  if(G.isObject(meta)){
   Object.assign(formLayoutProperties, meta);
   delete formLayoutProperties.meta;
  }
 }
 return <div class="flex flex:row flex:wrap">
  <DynamicFormSequence form={forms} {...formLayoutProperties} {...customProps}/>
 </div>
}
export interface SingleFormProps {}
export const SingleForm = (props: SingleFormProps) => {
 const params = useParams();
 return <div class="flex flex:row flex:wrap">
  <AbstractSingleForm formId={params.id}/>
 </div>
}



export const Login = (props: {}) => {
 const {setAlert} = useContext(AlertMessageContext);
 const {Ws} = useContext(WsContext);
 const navigate = useNavigate();
 const event = ["post", "login", 0] as WSEvent;
 Ws.bind(event, (data)=>{
  if(data.error){
   setAlert(prev => [...prev, {id: createUniqueId(), state: Alert.Error, message: data.error}])
  } else {
   navigate('/');
  }
 })
 onCleanup(() => Ws.unbind(event))
 return <AbstractSingleForm formId={"login"} handleSubmit={(txnId, data) => {
  const formData = data.get("0");
  if(formData) {
   const email = formData.properties.email;
   const password = formData.properties.password;
   Ws.trigger([[event, {body: { email, password } }]])
   revertTransaction(txnId)
  }
 }}/>
}
export const Logout = (props: {}) => {
 const {setAlert} = useContext(AlertMessageContext);
 const {Ws} = useContext(WsContext);
 const navigate = useNavigate();
 const event = ["post", "logout", 0] as WSEvent;

 Ws.bind(event, (data)=>{
  if(data.error){
   setAlert(prev => [...prev, {id: createUniqueId(), state: Alert.Error, message: data.error}])
  } else {
   Ws.isLoggedIn(false);
   navigate('/');
  }
 })
 Ws.trigger([[event, {} ]]);
 onCleanup(() => Ws.unbind(event))
 return <>Logging out...</>
}
export const SignUp = (props: {}) => {
 const {setAlert} = useContext(AlertMessageContext);
 const {Ws} = useContext(WsContext);
 const navigate = useNavigate();
 const event = ["post", "register", 0] as WSEvent;
 Ws.bind(event, (data)=>{
  if(data.error){
   setAlert(prev => [...prev, {id: createUniqueId(), state: Alert.Error, message: data.error}])
  } else {
   navigate('/');
  }
 })
 onCleanup(() => Ws.unbind(event))
 // TODO:
 // 1. Save button text
 // 2. disable save button when submitting
 // 3. validations
 // 4. clear form on success
 // 5. make password not visible
 return <AbstractSingleForm formId={"signup"} handleSubmit={(txnId, data) => {
  const formData = data.get("0");
  if(formData) {
   const email = formData.properties.email;
   const password = formData.properties.password;
   Ws.trigger([[event, { body: { email, password } }]])
   revertTransaction(txnId)
  }
 }}/>
}