import { AbstractSingleForm } from "./Form";
import { useParams } from "@solidjs/router";

export const FormDesigner = () => {
 const params = useParams();
 return <div>hello<AbstractSingleForm formId={'Coll'} id={params.id} config={{}} /></div>
}