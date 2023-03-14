import {
 createMemo,
 createUniqueId,
 For,
 onCleanup,
 splitProps,
 useContext
} from "solid-js";
import { Link, useNavigate } from "solid-app-router";
import { graph, revertTransaction } from "../lib/graph";
import { removeUndefinedProperties } from "../utils/functions";

import {
 DynamicFormSequence,
 DynamicFormSequenceProps
} from "./core/dynamicForm";
import { AlertMessageContext } from "../appState";
import { Alert } from "../Type";
import { WsContext, WSEvent } from "./ws_events_dispatcher";
import {
 getChildVertex,
 getChildVertexes,
 getOptionLabel,
 getParentVertex
} from "./input/SelectInputField";
import { FieldAttribute, FormMetaData, Vertex } from "./input/Form";
import { AttrsTableData } from "./api";

// TODO make default component property applied to
export const AllForms = () => {
 const allForms = () => graph.vertexLabelIdMap["Form"]?.map(formVertex => graph.vertexes[formVertex]) || [];

 return <div class="flex flex:row flex:wrap">
  <For each={allForms()}>
   {form => <Link
    href={`/${form.properties.id}/new`}>{form.properties.id}</Link>}
  </For>
 </div>;
};

const addProps = (vertexFormAttr: Vertex): { error: boolean, attr?: FieldAttribute } => {
 const vertexCollAttrResult = getChildVertex(["$0Attr"], vertexFormAttr);
 if (vertexCollAttrResult.error) return { error: true };
 const vertexCollAttr = vertexCollAttrResult.vertex!;
 const vertexAttrResult = getChildVertex(["CollAttrAttr"], vertexCollAttr);
 if (vertexAttrResult.error) return { error: true };
 const vertexAttr = vertexAttrResult.vertex!;
 const attr = Object.assign({}, removeUndefinedProperties(vertexAttr.properties, false, 10), removeUndefinedProperties(vertexCollAttr.properties, false, 10), removeUndefinedProperties(vertexFormAttr.properties, false, 10));


 // find components for all levels
 const vertexDefaultComp = getChildVertex(["AttrDataType", "DataTypeDefault"], vertexAttr);
 const attrComp = getChildVertex(["AttrComp"], vertexAttr).vertex || vertexDefaultComp.vertex;
 const collAttrComp = getChildVertex(["CollAttrComp"], vertexCollAttr).vertex || attrComp;
 const formAttrComp = getChildVertex(["$0Comp"], vertexFormAttr).vertex || collAttrComp;


 // set dataType to attr
 const dataType = getChildVertex(["AttrDataType"], vertexAttr);
 if (dataType.error) {
  console.warn("data Type not found");
  return { error: true };
 }
 attr.dataType = dataType.vertex!.properties.id;

 // set props to attr
 let formProps = (getChildVertexes(["$Prop"], [vertexFormAttr]).vertexes || []).reduce((acc, curr) => {
  const key = getOptionLabel(curr, "->$Key:properties.key");
  if (key) {
   acc[key] = curr.properties.value;
  }
  return acc;
 }, {} as { [key: string]: any });

 if (formAttrComp === collAttrComp) {
  const collProps = (getChildVertexes(["$Prop"], [vertexCollAttr]).vertexes || []).reduce((acc, curr) => {
   const key = getOptionLabel(curr, "->$0Key:properties.key");
   if (key) {
    acc[key] = curr.properties.value;
   }
   return acc;
  }, {} as { [key: string]: any });
  formProps = Object.assign({}, removeUndefinedProperties(collProps, false, 10), removeUndefinedProperties(formProps, false, 10));
 }

 if (formAttrComp === attrComp) {
  const attrProps = (getChildVertexes(["AttrProp"], [vertexAttr]).vertexes || []).reduce((acc, curr) => {
   const key = getOptionLabel(curr, "->AttrPropKey:properties.key");
   if (key) {
    acc[key] = curr.properties.value;
   }
   return acc;
  }, {} as { [key: string]: any });
  formProps = Object.assign({}, removeUndefinedProperties(attrProps, false, 10), removeUndefinedProperties(formProps, false, 10));
 }

 // merge default component props
 const comp = (formAttrComp === attrComp) ? attrComp : formAttrComp;
 if (!comp) {
  console.warn("Component not configured");
  return { error: true };
 }

 const compProps = (getChildVertexes(["CompProp"], [comp]).vertexes || []).reduce((acc, curr) => {
  if (curr.properties.key) {
   acc[curr.properties.key] = curr.properties.value;
  }
  return acc;
 }, {} as { [key: string]: any });
 formProps = Object.assign({}, removeUndefinedProperties(compProps, false, 10), formProps);


 const parentVertexResult = getParentVertex(["ChildComp"], comp);
 if (!parentVertexResult.error) {
  const parentCompProps = (getChildVertexes(["CompProp"], [parentVertexResult.vertex!]).vertexes || []).reduce((acc, curr) => {
   if (curr.properties.key) {
    acc[curr.properties.key] = curr.properties.value;
   }
   return acc;
  }, {} as { [key: string]: any });
  formProps = Object.assign({}, removeUndefinedProperties(parentCompProps, false, 10), formProps);
  attr.component = parentVertexResult.vertex!.properties.id;
 } else {
  attr.component = comp.properties.id;
 }
 attr.props = formProps;
 return { error: false, attr };
};

export const getFormApiFromForm = (formId: string): { error: string, form?: FormMetaData } => {
 const formID = () => (graph.vertexLabelIdMap["Form"] || []).find(vertexId => graph.vertexes[vertexId].properties["id"] === formId);
 const form = graph.vertexes[formId] || graph.vertexes[`${formID()}`];
 if (!form) {
  console.warn(formId, "form not found");
  return { error: "form dont found" };
 }

 const formCollResult = getParentVertex(["CollForm"], form);
 if(formCollResult.error) { return {error: "Please Configure Collection in a Form"}; }
 const formColl = formCollResult.vertex!

 const formAttrsResult = getChildVertexes(["FormAttr"], [form]);
 if(formAttrsResult.error) { return {error: "No Attributes in a Form"}; }
 const formAttrs = formAttrsResult.vertexes!.sort((a, b) => a.properties.pos - b.properties.pos)

 let attrs: FieldAttribute[] = [];

 for(const vertexFormAttr of formAttrs) {
  const addPropsResult = addProps(vertexFormAttr);
  if (addPropsResult.error) continue;
  attrs.push(addPropsResult.attr!);
 }
 // @ts-ignore
 attrs = attrs.sort((a, b) => a.pos - b.pos);

 const formChildren = (getChildVertexes(["FormChild"], [form] ).vertexes || []).sort((a, b) => a.properties.pos - b.properties.pos);

 const childAttrs = [] as FieldAttribute[];

 for(const vertexFormChild of formChildren) {
  const formChildAttrs = (getChildVertexes(["FormChildAttr"], [vertexFormChild]).vertexes || []).sort((a, b) => a.properties.pos - b.properties.pos);

  let tableAttrs: FieldAttribute[] = [];
  for(const vertexFormChildAttr of formChildAttrs) {
   const addPropsResult = addProps(vertexFormChildAttr);
   if (addPropsResult.error) continue;
   attrs.push(addPropsResult.attr!);
  }
  // @ts-ignore
  tableAttrs = tableAttrs.sort((a, b) => a.pos - b.pos);

  const formChildColl = getChildVertex(["FormChildColl", "CollChildColl"], vertexFormChild);
  if(formChildColl.error) {
   continue;
  }
  // currently we save table property on Collection only, not overwrite by form layout
  const collChildProps = (getChildVertexes(["FormChildColl", "CollChildProp"], [vertexFormChild]).vertexes || []).reduce((acc, curr) => {
   const key = getOptionLabel(curr, "->CollChildPropKey:properties.key");
   if (key) {
    acc[key] = curr.properties.value;
   }
   return acc;
  }, {} as { [key: string]: any });

  childAttrs.push({
   attributes: tableAttrs,
   component: "TableField",
   id: formChildColl.vertex!.properties.id,
   props: collChildProps
  });
 }

 return {
  error: "", form: {
   attributes: [...attrs, ...childAttrs],
   id: formColl.properties.id,
   title: form.properties.title,
   // collection used in Grid, its same like id key
   // @ts-ignore
   collection: formColl.properties.id
  }
 };
}

interface AbstractSingleFormProps extends Omit<DynamicFormSequenceProps, "form" | "id"> {
 formId: string;
 id: string | number;
}

export const AbstractSingleForm = (props: AbstractSingleFormProps) => {

 let form = AttrsTableData[props.formId];

 if (!form) {
  const formResult = getFormApiFromForm(props.formId);
  if (formResult.error) return formResult.error;
  form = formResult.form!;
 }
 console.log(form);
 const [p, customProps] = splitProps(props, ["formId", "id"]);

 const id = createMemo(() => p.id === "new" ? undefined : parseInt(p.id as string));
 return <div class="flex flex:row flex:wrap">
  <DynamicFormSequence
   form={form!} id={id()} {...customProps} />
 </div>;
};

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