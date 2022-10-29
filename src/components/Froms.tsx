import { Edges, graph, Id, Vertex, Vertexes } from "../lib/graph";
import { For } from "solid-js";
import { Link, useParams } from "solid-app-router";
import {removeUndefinedProperties} from 'ok_web_components';

export const AllForms = () => {
 const allFormLayouts = graph.vertexLabelIdMap[Vertexes.FormLayout].map(formLayoutVertex => graph.vertexes[formLayoutVertex]);

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
 const formLayoutHasItems = formLayout.out_edges[Edges.FormLayoutHasItem];

 const generateNewApi = () => {
  const forms = formLayoutHasItems.map(edgeFormLayoutItemId=> {

   const edgeFormLayoutHasItem = graph.edges[edgeFormLayoutItemId];
   const vertexFormLayoutItem = graph.vertexes[edgeFormLayoutHasItem.end];

   const edgeFormLayoutItemHasCollectionId = vertexFormLayoutItem.out_edges[Edges.FormLayoutItemHasCollection][0]
   const vertexCollection = graph.vertexes[graph.edges[edgeFormLayoutItemHasCollectionId].end];
   const collectionAttributeAndPropertiesMap = vertexCollection.out_edges[Edges.CollectionHasAttribute].reduce((acc, collectionHasAttributeId)=>{
    const edgeCollectionHasAttribute = graph.edges[collectionHasAttributeId];
    const attribute = graph.vertexes[edgeCollectionHasAttribute.end]
    acc[attribute.id] = edgeCollectionHasAttribute.properties;
    return acc;
   }, {} as {[key: Id]: {[p: string]: any}})

   const formLayoutItemAttributeIds = vertexFormLayoutItem.out_edges[Edges.FormLayoutItemHasAttribute];
   const attributes  = formLayoutItemAttributeIds.map(formLayoutItemAttributeId => {
    const edgeFormLayoutItemAttribute = graph.edges[formLayoutItemAttributeId];

    const attributeId = edgeFormLayoutItemAttribute.end;
    const vertexAttribute = graph.vertexes[attributeId];
    const collectionAttribute = collectionAttributeAndPropertiesMap[attributeId];
    return Object.assign({}, removeUndefinedProperties(vertexAttribute.properties, false, 10), removeUndefinedProperties(collectionAttribute, false, 10), removeUndefinedProperties(edgeFormLayoutItemAttribute.properties, false, 10));
   })
   return {id: vertexFormLayoutItem.properties.id, title: vertexFormLayoutItem.properties.title, attributes}
  })
  return forms;
 }
 const forms = generateNewApi();
 console.log(forms);

 return <div class="flex flex:row flex:wrap">
  Hello
 </div>
}
