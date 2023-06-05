import { AbstractSingleForm } from "./Form";
import { useParams } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { PageContext, Record } from "../lib/Record";
import { PageItemRender } from "./input/GenaricField";

export const FormDesigner = () => {
  const params = useParams();
  return (
    <div>
      hello
      <AbstractSingleForm formId={"Coll"} id={params.id} config={{}} />
    </div>
  );
};

export const PageDesigner = () => {
 const params = useParams();
 const config = {} as { record: Record };
 const [count, setCount] = createSignal(1);
 const rerender = () => {
  setCount(prev=>prev+1);
 }
 const Preview = () => {
  return <PageItemRender metaVertex={config.record.vertex}/>
 }
 return (
  <div class="flex">
   <div class="border:1|solid|blue-60 p:10 m:5">
    <AbstractSingleForm
     formId={"Page2"}
     id={params.id}
     config={config}
     // TODO: add dry option
    />
   </div>

   <div class="border:1|solid|blue-60 p:10 m:5 min-w:300">

   <button type={"button"} onClick={rerender}>Run</button>
    <PageContext.Provider value={{ events: {  } }}>
     <Show when={count() && config.record.vertex && count()} keyed>
      <Preview/>
     </Show>
    </PageContext.Provider>
   </div>

  </div>
 );
};
