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
 getOptionLabel,
 getParentVertex,
 getSelectionOptions
} from "./input/SelectInputField";
import { FieldAttribute, FormMetaData } from "./input/Form";
import { AttributesTableData } from "./api";

export const AllForms = () => {
 const allFormLayouts = () => graph.vertexLabelIdMap["FormLayout"]?.map(formLayoutVertex => graph.vertexes[formLayoutVertex]) || [];

 return <div class="flex flex:row flex:wrap">
  <For each={allFormLayouts()}>
   {formLayout => <Link
    href={`/${formLayout.properties.id}/new`}>{formLayout.properties.id}</Link>}
  </For>
 </div>;
};

export const getFormApiFromFormLayout = (formId: string): { error: string, form?: FormMetaData} => {
 const formLayoutId = () => (graph.vertexLabelIdMap["FormLayout"] || []).find(vertexId => graph.vertexes[vertexId].properties["id"] === formId);
 const formLayout = graph.vertexes[formId] || graph.vertexes[`${formLayoutId()}`];
 if (!formLayout) {
  console.warn(formId, "form not found");
  return { error: "form dont found"};
 }

 const formLayoutCollectionResult = getParentVertex(['CollectionFormLayout'], formLayout);
 if(formLayoutCollectionResult.error) { return {error: "Please Configure Collection"}; }
 const formLayoutCollection = formLayoutCollectionResult.vertex!

 const FormLayoutAttributes = getSelectionOptions(formLayout, "->FormLayoutAttribute", "").sort((a, b) => a.properties.pos - b.properties.pos);

 let attributes: FieldAttribute[] = [];

 for(const vertexFormLayoutAttribute of FormLayoutAttributes) {
  const vertexCollectionAttribute = getSelectionOptions(vertexFormLayoutAttribute, "->FormLayoutAttributeAttribute", "")[0];
  if(!vertexCollectionAttribute) continue;
  const vertexAttribute = getSelectionOptions(vertexCollectionAttribute, "->CollectionAttributeAttribute", "")[0];
  if(!vertexAttribute) continue;
  const attribute = Object.assign({}, removeUndefinedProperties(vertexAttribute.properties, false, 10), removeUndefinedProperties(vertexCollectionAttribute.properties, false, 10), removeUndefinedProperties(vertexFormLayoutAttribute.properties, false, 10));

  const attributeComponent = getSelectionOptions(vertexAttribute, "->AttributeComponent", "")[0];
  const collectionAttributeComponent = getSelectionOptions(vertexCollectionAttribute, "->CollectionAttributeComponent", "")[0] || attributeComponent;
  const formAttributeComponent = getSelectionOptions(vertexFormLayoutAttribute, "->FormLayoutAttributeComponent", "")[0] || collectionAttributeComponent;

  if (formAttributeComponent === undefined) {
   const vertexDefaultAttribute = getSelectionOptions(vertexAttribute, "->AttributeDefault", "")[0];
   if (!vertexDefaultAttribute) continue;
   attribute.component = vertexDefaultAttribute.properties.id;
  } else {
   attribute.component = formAttributeComponent.properties.id;
  }

  attribute.dataType = getSelectionOptions(vertexAttribute, "->AttributeDataType", "")[0].properties.id;

  let props = {} as { [key: string]: any };

  const formLayoutProps = getSelectionOptions(vertexFormLayoutAttribute, "->FormLayoutAttributeProperty", "").reduce((acc, curr) => {
   const key = getOptionLabel(curr, "->FormLayoutAttributePropertyKey:properties.key");
   if (key) {
    acc[key] = curr.properties.value;
   }
   return acc;
  }, {} as { [key: string]: any });

  if (formAttributeComponent === collectionAttributeComponent) {
   const collectionProps = getSelectionOptions(vertexFormLayoutAttribute, "->FormLayoutAttributeAttribute->CollectionAttributeProperty", "").reduce((acc, curr) => {
    const key = getOptionLabel(curr, "->CollectionAttributePropertyKey:properties.key");
    if (key) {
     acc[key] = curr.properties.value;
    }
    return acc;
   }, {} as { [key: string]: any });
   props = Object.assign({}, removeUndefinedProperties(collectionProps, false, 10), removeUndefinedProperties(formLayoutProps, false, 10));
  }

  const comp = (formAttributeComponent === attributeComponent) ? attributeComponent : formAttributeComponent;

  const componentProps = getSelectionOptions(comp, "->ComponentProperty", "").reduce((acc, curr) => {
   if (curr.properties.key) {
    acc[curr.properties.key] = curr.properties.value;
   }
   return acc;
  }, {} as { [key: string]: any });
  props = Object.assign({}, removeUndefinedProperties(componentProps, false, 10),props );

  attribute.props = props;

  attributes.push(attribute);
 }
 // @ts-ignore
 attributes = attributes.sort((a, b) => a.pos - b.pos);

 const FormLayoutChilds = getSelectionOptions(formLayout, "->FormLayoutChild", "").sort((a, b) => a.properties.pos - b.properties.pos);

 const childAttributes = [] as FieldAttribute[];

 for(const vertexFormLayoutChild of FormLayoutChilds) {
  const formLayoutChildAttributes = getSelectionOptions(vertexFormLayoutChild, "->FormLayoutChildAttribute", "").sort((a, b) => a.properties.pos - b.properties.pos);

  let tableAttributes: FieldAttribute[] = [];
  for(const vertexFormLayoutChildAttribute of formLayoutChildAttributes) {
   const vertexCollectionAttribute = getSelectionOptions(vertexFormLayoutChildAttribute, "->FormLayoutChildAttributeAttribute", "")[0];
   if(!vertexCollectionAttribute) continue;
   const vertexAttribute = getSelectionOptions(vertexCollectionAttribute, "->CollectionAttributeAttribute", "")[0];

   const attribute = Object.assign({}, removeUndefinedProperties(vertexAttribute.properties, false, 10), removeUndefinedProperties(vertexCollectionAttribute.properties, false, 10), removeUndefinedProperties(vertexFormLayoutChildAttribute.properties, false, 10));


   const attributeComponent = getSelectionOptions(vertexAttribute, "->AttributeComponent", "")[0];
   const collectionAttributeComponent = getSelectionOptions(vertexCollectionAttribute, "->CollectionAttributeComponent", "")[0] || attributeComponent;
   const formAttributeComponent = getSelectionOptions(vertexFormLayoutChildAttribute, "->FormLayoutChildAttributeComponent", "")[0] || collectionAttributeComponent;

   const component = formAttributeComponent || collectionAttributeComponent || attributeComponent;
   attribute.component = component.properties.id;

   attribute.dataType = getSelectionOptions(vertexAttribute, "->AttributeDataType", "")[0].properties.id;

   let props = {} as { [key: string]: any };

   const formLayoutProps = getSelectionOptions(vertexFormLayoutChildAttribute, "->FormLayoutChildAttributeProperty", "").reduce((acc, curr) => {
    const key = getOptionLabel(curr, "->FormLayoutChildAttributePropertyKey:properties.key");
    if (key) {
     acc[key] = curr.properties.value;
    }
    return acc;
   }, {} as { [key: string]: any });

   if (formAttributeComponent === collectionAttributeComponent) {
    const collectionProps = getSelectionOptions(vertexFormLayoutChildAttribute, "->FormLayoutChildAttributeAttribute->CollectionAttributeProperty", "").reduce((acc, curr) => {
     const key = getOptionLabel(curr, "->CollectionAttributePropertyKey:properties.key");
     if (key) {
      acc[key] = curr.properties.value;
     }
     return acc;
    }, {} as { [key: string]: any });
    props = Object.assign({}, removeUndefinedProperties(collectionProps, false, 10), removeUndefinedProperties(formLayoutProps, false, 10));
   }

   const comp = (formAttributeComponent === attributeComponent) ? attributeComponent : formAttributeComponent;

   const componentProps = getSelectionOptions(comp, "->ComponentProperty", "").reduce((acc, curr) => {
    if (curr.properties.key) {
     acc[curr.properties.key] = curr.properties.value;
    }
    return acc;
   }, {} as { [key: string]: any });
   props = Object.assign({}, removeUndefinedProperties(componentProps, false, 10),props );

   attribute.props = props;

   tableAttributes.push(attribute);
  }
  // @ts-ignore
  tableAttributes = tableAttributes.sort((a, b) => a.pos - b.pos);

  const formLayoutChildCollection = getSelectionOptions(vertexFormLayoutChild, "->FormLayoutChildCollection->CollectionChildCollection", "")[0];
  if(!formLayoutChildCollection) {
   continue;
  }
  childAttributes.push({
   attributes: tableAttributes,
   component: "Table",
   id: formLayoutChildCollection.properties.id
  });
 }

 return {
  error: "", form: {
   attributes: [...attributes, ...childAttributes],
   id: formLayoutCollection.properties.id,
   title: formLayout.properties.title,
   // collection used in Grid, its same like id key
   // @ts-ignore
   collection: formLayoutCollection.properties.id
  }
 };
}

interface AbstractSingleFormProps extends Omit<DynamicFormSequenceProps, "form" | "id"> {
 formId: string;
 id: string | number;
}

export const AbstractSingleForm = (props: AbstractSingleFormProps) => {

 let form = AttributesTableData[props.formId];

 if (!form) {
  const formResult = getFormApiFromFormLayout(props.formId);
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