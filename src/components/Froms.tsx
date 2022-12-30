import { For } from "solid-js";
import { Link, useParams } from "solid-app-router";
import { graph } from "../lib/graph";
import {removeUndefinedProperties} from 'ok_web_components';
import { VertexLabels, EdgeLabels, Id } from 'ok_web_components/src/components/input/Form';
import { convertToJS } from "./utils";

export const AllForms = () => {
 const allFormLayouts = graph.vertexLabelIdMap[VertexLabels.FormLayout].map(formLayoutVertex => graph.vertexes[formLayoutVertex]);

 return <div class="flex flex:row flex:wrap">
  <For each={allFormLayouts}>
   {formLayout => <Link href={`/form/${formLayout.id}`}>{formLayout.properties.id}</Link>}
  </For>
 </div>
}
interface SingleFormProps {
}
export const SingleForm = (props: SingleFormProps) => {
 const params = useParams();

 const formLayout = graph.vertexes[params.id];
 const formLayoutHasItems = formLayout.out_edges[EdgeLabels.FormLayoutHasItem];

 const generateNewApi = () => {
  const forms = formLayoutHasItems.map(edgeFormLayoutItemId=> {

   const edgeFormLayoutHasItem = graph.edges[edgeFormLayoutItemId];
   const vertexFormLayoutItem = graph.vertexes[edgeFormLayoutHasItem.end];

   const edgeFormLayoutItemHasCollectionId = vertexFormLayoutItem.out_edges[EdgeLabels.FormLayoutItemHasCollection][0]
   const vertexCollection = graph.vertexes[graph.edges[edgeFormLayoutItemHasCollectionId].end];
   const collectionAttributeAndPropertiesMap = vertexCollection.out_edges[EdgeLabels.CollectionHasAttribute].reduce((acc, collectionHasAttributeId)=>{
    const edgeCollectionHasAttribute = graph.edges[collectionHasAttributeId];
    const attribute = graph.vertexes[edgeCollectionHasAttribute.end]
    acc[attribute.id] = edgeCollectionHasAttribute.properties;
    return acc;
   }, {} as {[key: Id]: {[p: string]: any}})

   const formLayoutItemAttributeIds = vertexFormLayoutItem.out_edges[EdgeLabels.FormLayoutItemHasAttribute];
   const attributes  = formLayoutItemAttributeIds.map(formLayoutItemAttributeId => {
    const edgeFormLayoutItemAttribute = graph.edges[formLayoutItemAttributeId];

    const attributeId = edgeFormLayoutItemAttribute.end;
    const vertexAttribute = graph.vertexes[attributeId];
    const collectionAttribute = collectionAttributeAndPropertiesMap[attributeId];
    // get touched, dirty, submitted, errors, validators and set to fieldOptions
    // pass other property to attributes
    // if props is string eval it else if its object use it
    const attribute = Object.assign({}, removeUndefinedProperties(vertexAttribute.properties, false, 10), removeUndefinedProperties(collectionAttribute, false, 10), removeUndefinedProperties(edgeFormLayoutItemAttribute.properties, false, 10));
    if(attribute.formType) {
     attribute.formType = graph.vertexes[attribute.formType].properties.id;
    }
    if(attribute.serverType) {
     attribute.serverType = graph.vertexes[attribute.serverType].properties.id;
    }
    return attribute;
   })
   const from = vertexFormLayoutItem.properties.from
   const to = vertexFormLayoutItem.properties.to
   const save = [vertexFormLayoutItem.properties.labelType, vertexFormLayoutItem.properties.labelName, from ? convertToJS(from) : undefined, to ? convertToJS(to) : undefined];
   return {id: vertexFormLayoutItem.properties.id, title: vertexFormLayoutItem.properties.title, attributes, save}
  })
  return forms;
 }
 const forms = generateNewApi();
 console.log(forms);

 return <div class="flex flex:row flex:wrap">
  Hello
 </div>
}
