import { ComponentProps, Vertex } from "./Form";
import { ModalInput } from "./ModalInput";
import { getParentVertex } from "./SelectInputField";
import { capitalizeFirstLetter } from "../utils";

// TODO: make this droppable
// This will be two columns
// first column will select parent collection from the meta.
// second column will select all the collection of first column
export function CollectionOptionField(props: ComponentProps) {
 const parents = [] as string[];

 const calculateParents = (vertex: Vertex) => {
  const parentVertex = getParentVertex([Object.keys(vertex.in_edges)[0]], vertex);
  if(parentVertex.error || parentVertex.vertex?.labels[0] === "Temp") {
   return;
  } else {
   console.log(vertex)
   if(parentVertex.vertex?.properties.id && vertex.properties.id) {
    parents.push(capitalizeFirstLetter(parentVertex.vertex?.properties.id) + capitalizeFirstLetter(vertex.properties.id))
   }
   calculateParents(parentVertex.vertex!);
  }
 }
 calculateParents(props.meta);
 console.log(parents)
  return (
   <div aria-labeledby={props["aria-labeledby"]}>
    <ModalInput btnContent={"Select Collection"}>
     <div class="flex">
      <div></div>
      <div>2</div>
      <div>3</div>
     </div>
    </ModalInput>
   </div>
  );
}
