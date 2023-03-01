import { ComponentProps } from "./Form";
import { ModalInput } from "./ModalInput";

// TODO: make this droppable
// This will be two columns
// first column will select parent collection from the meta.
// second column will select all the collection of first column
export function CollectionOptionField(props: ComponentProps) {
 debugger
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
