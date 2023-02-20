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
 DynamicFormSequence,
 DynamicFormSequenceProps
} from "./core/dynamicForm";
import { AlertMessageContext } from "../appState";
import { Alert } from "../Type";
import { WsContext, WSEvent } from "./ws_events_dispatcher";
import { getSelectionOptions } from "./input/SelectInputField";
import { FieldAttribute, FormMetaData, TableField } from "./input/Form";

export const AllForms = () => {
 const allFormLayouts = () => graph.vertexLabelIdMap["FormLayout"]?.map(formLayoutVertex => graph.vertexes[formLayoutVertex]) || [];

 return <div class="flex flex:row flex:wrap">
  <For each={allFormLayouts()}>
   {formLayout => <Link
    href={`/form/${formLayout.properties.id}`}>{formLayout.properties.id}</Link>}
  </For>
 </div>;
};
interface AbstractSingleFormProps extends Omit<DynamicFormSequenceProps, 'form'>{
 formId: string;
}
export const AbstractSingleForm = (props: AbstractSingleFormProps) => {
 const formLayoutId = () => (graph.vertexLabelIdMap["FormLayout"] || []).find(vertexId => graph.vertexes[vertexId].properties["id"] === props.formId);
 const formLayout = graph.vertexes[props.formId] || graph.vertexes[`${formLayoutId()}`];
 if (!formLayout) {
  alert("form dont found");
  return;
 }

 const formLayoutCollection = getSelectionOptions(formLayout, "->FormLayoutCollection", "")[0];

 const FormLayoutAttributes = getSelectionOptions(formLayout, "->FormLayoutAttribute", "").sort((a, b) => a.properties.pos - b.properties.pos);

 const attributes: FieldAttribute[] = FormLayoutAttributes.map(vertexFormLayoutAttribute => {
  const vertexCollectionAttribute = getSelectionOptions(vertexFormLayoutAttribute, "->FormLayoutAttributeAttribute", "")[0];
  const vertexAttribute = getSelectionOptions(vertexCollectionAttribute, "->CollectionAttributeAttribute", "")[0];
  const attribute = Object.assign({}, removeUndefinedProperties(vertexAttribute.properties, false, 10), removeUndefinedProperties(vertexCollectionAttribute.properties, false, 10), removeUndefinedProperties(vertexFormLayoutAttribute.properties, false, 10));


  const formAttributeComponent = () => getSelectionOptions(vertexFormLayoutAttribute, "->FormLayoutAttributeComponent", "")[0];
  const collectionAttributeComponent = () => getSelectionOptions(vertexCollectionAttribute, "->CollectionAttributeComponent", "")[0];
  const attributeComponent = () => getSelectionOptions(vertexAttribute, "->AttributeComponent", "")[0];

  const component = formAttributeComponent() || collectionAttributeComponent() || attributeComponent();
  attribute.component = component.properties.id;

  attribute.dataType = getSelectionOptions(vertexAttribute, "->AttributeDataType", "")[0].properties.id;
  return attribute;
 }).sort((a, b) => a.pos - b.pos);


 const FormLayoutChilds = getSelectionOptions(formLayout, "->FormLayoutChild", "").sort((a, b) => a.properties.pos - b.properties.pos);

 const tableAttributes: FieldAttribute[] = FormLayoutChilds.map(vertexFormLayoutChild => {

  const formLayoutChildAttributes = getSelectionOptions(vertexFormLayoutChild, "->FormLayoutChildAttribute", "").sort((a, b) => a.properties.pos - b.properties.pos);
  const tableAttributes: FieldAttribute[] = formLayoutChildAttributes.map(vertexFormLayoutChildAttribute => {
   const vertexCollectionAttribute = getSelectionOptions(vertexFormLayoutChildAttribute, "->FormLayoutChildAttributeAttribute", "")[0];
   const vertexAttribute = getSelectionOptions(vertexCollectionAttribute, "->CollectionAttributeAttribute", "")[0];
   const attribute = Object.assign({}, removeUndefinedProperties(vertexAttribute.properties, false, 10), removeUndefinedProperties(vertexCollectionAttribute.properties, false, 10), removeUndefinedProperties(vertexFormLayoutChildAttribute.properties, false, 10));


   const formAttributeComponent = () => getSelectionOptions(vertexFormLayoutChildAttribute, "->FormLayoutChildAttributeComponent", "")[0];
   const collectionAttributeComponent = () => getSelectionOptions(vertexCollectionAttribute, "->CollectionAttributeComponent", "")[0];
   const attributeComponent = () => getSelectionOptions(vertexAttribute, "->AttributeComponent", "")[0];

   const component = formAttributeComponent() || collectionAttributeComponent() || attributeComponent();
   attribute.component = component.properties.id;

   attribute.dataType = getSelectionOptions(vertexAttribute, "->AttributeDataType", "")[0].properties.id;
   return attribute;
  }).sort((a, b) => a.pos - b.pos);

  const label = getSelectionOptions(vertexFormLayoutChild, "->FormLayoutChildCollection->CollectionChildCollection", "")[0].properties.id;
  return {
   columns: tableAttributes,
   component: "Table",
   label,
   id: label
  } as TableField;
 })

 const [_, customProps] = splitProps(props, ["formId"]);

 const form: FormMetaData = {
  attributes: [...attributes, ...tableAttributes],
  label: formLayoutCollection.properties.id,
  title: formLayout.properties.title
 };

 console.log(form);

 return <div class="flex flex:row flex:wrap">
  <DynamicFormSequence
   form={form} {...customProps} />
 </div>;
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