import { AbstractSingleForm } from "./Form";
import { Vertex } from "../lib/graph";
import { useParams } from "@solidjs/router";

export const Page = () => {
 const params = useParams();
 const config = {} as { vertex: Vertex };
 const configData = {} as { vertex: Vertex };

 return <div class="flex">
  <div class="border:1|solid|blue-60 p:10 m:5">
   <AbstractSingleForm
   formId={"Page"}
   id={params.id}
   config={config}
   // TODO: add dry option
  /></div>
  <div class="border:1|solid|blue-60 p:10 m:5">
   <AbstractSingleForm
   formId={"_PageData"}
   id="new"
   config={configData}
   // TODO: add dry option
  /></div>
  <div class="border:1|solid|blue-60 p:10 m:5">Preview</div>
 </div>

}
