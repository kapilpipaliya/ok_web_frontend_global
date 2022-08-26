import {
 createEffect,
 createSignal,
 For,
 getOwner,
 Match,
 runWithOwner,
 Show,
 Switch
} from "solid-js";
import { useParams, useNavigate, useLocation } from "solid-app-router";
import {
 bindOwner,
 createFormControl,
 createFormGroup,
 IFormControl
} from "solid-forms";
import {
 Field,
 TextInputField,
 BooleanInputField,
 JsonInput,
 GeneralInput,
 SelectInputField
} from "ok_web_components";
import {SelectInputFieldProps} from 'ok_web_components/src/components/input/select_input_field'
import {
 addNode,
 fetchAttributesTableData, fetchCollectionData,
 fetchDocument,
 FieldAttribute,
 FormMetaData, SelectField,
 updateNode
} from "../api";
import { klona } from "klona/json";
import { graph, Id } from "../../lib/graph";
import { createAsyncOptions } from "@thisbeyond/solid-select";

const getDefaultValue = (meta: FieldAttribute) => {
 switch (meta.type) {
  case "string":
   return "";
  case "boolean":
   return false;
  case "object":
   return {};
  default:
   return "";
 }
};

const getHtmlInputType = (meta: FieldAttribute) => {
 switch (meta.type) {
  case "string":
   return "text";
  case "integer":
   return "number";
  case "decimal":
   return "number";
  case "object":
   return "jsoneditor";
  default:
   return meta.type;
 }
};
export interface SelectInputProps extends SelectInputFieldProps {
  collection: string;
}
const SelectInput = (props: SelectInputProps)=>{
 const fetchOptions = async (inputValue: string): Promise<any[]> => {
  return fetchCollectionData(props.collection).map((id) => graph.vertexes[id]);
 };

  return <SelectInputField fetchOptions={fetchOptions} control={props.control}/>
}

interface DynamicFormProps {
 formMetaData: FormMetaData;
 id?: Id;
 formGroup: ReturnType<typeof createFormGroup>
}

export function DynamicForm(props: DynamicFormProps) {
 let formData = props.formMetaData.attributes;

 // use a signal to show form because `Object.keys(form.controls).length` is not reactive
 const [fetching, setFetching] = createSignal(true);

 const owner = getOwner();
 {
  const groupConstructor = formData.reduce((acc, meta) => {
   runWithOwner(owner, () => {
    acc[meta.key] = createFormControl(getDefaultValue(meta));
   });
   return acc;
  }, {} as { [key: string]: IFormControl });

  props.formGroup.setControls(groupConstructor);

  if (props.id !== "new") {
   // used FormMetaData.save attribute temporary.
   if (props.formMetaData.save[0] === "vertex") {
    const vertex = fetchDocument(props.formMetaData.save[1], props.id);

    if (!vertex) {
     alert(`document with id: ${props.id} not exist`);
     return;
    }
    props.formGroup.patchValue(vertex.properties);
    if (props.formGroup.controls["_id"])
     props.formGroup.controls["_id"].markDisabled(true);
    if (props.formGroup.controls["_key"])
     props.formGroup.controls["_key"].markDisabled(true);
   }
   setFetching(false);
  } else {
   setFetching(false);
  }
 }

 const Form = () => {
  return <><Show when={!fetching()} fallback={<>Loading</>}><For
   each={formData}>
   {(meta) => (
    <Switch>
     <Match when={meta.type === "string"}>
      <TextInputField
       label={meta.key}
       // @ts-ignore
       control={props.formGroup.controls[meta.key]}
       type={getHtmlInputType(meta)}
      />
     </Match>
     <Match when={meta.type === "boolean"}>
      <BooleanInputField
       label={meta.key}
       type="checkbox"
       // @ts-ignore
       control={props.formGroup.controls[meta.key]}
      />
     </Match>
     <Match when={meta.type === "json"}>
      <Field label={meta.key}>
       <JsonInput
        // @ts-ignore
        control={props.formGroup.controls[meta.key]}
        type={getHtmlInputType(meta)} />
      </Field>
     </Match>
     <Match when={meta.type === "dynamic"}>
      <Field label={meta.key}>
       <GeneralInput
        // @ts-ignore
        control={props.formGroup.controls[meta.key]}
        type={getHtmlInputType(meta)}
       />
      </Field>
     </Match>
     <Match when={meta.type === "select"}>
      <Field label={meta.key}>
       <SelectInput
        // @ts-ignore
        control={props.formGroup.controls[meta.key]}
        collection={(meta as SelectField).collection}
       />
      </Field>
     </Match>
    </Switch>
   )}
  </For>
  </Show>
  </>;
 };
 return <Form />;
}

// interface DynamicFormSequenceProps {
//   forms: FormMetaData[]
// }
export const DynamicFormSequence = (props) => {
 const [formRef, setFormRef] = createSignal<HTMLFormElement>();
 /* @mount */
 {
  const form = formRef();
  form.querySelector("input").focus();
 }

 const params = useParams();
 const navigate = useNavigate();
 const location = useLocation();

 const formMetaData = fetchAttributesTableData(params.entity) as FormMetaData[];

 const formValuesConstructor = formMetaData.reduce((acc, curr) => {
  acc[curr.id] = createFormGroup({});
  return acc;
 }, {} as { [key: string]: ReturnType<typeof createFormGroup> });
 const formValues = createFormGroup(formValuesConstructor);

 const onSubmit = (e) => {
  e.preventDefault();
  let index = 0;
  const length = formMetaData.length;
  const results = [];
  const callMethod = (): Promise<any> => {
   const form = formMetaData[index++];
   if (form) {
    if (form.save[0] === "vertex") {
     if (params.id == "new") {
      return Promise.resolve(
       addNode(form.save[1], klona(formValues.controls[form.id].value)));
     } else {
      return Promise.resolve(
       updateNode(form.save[1], params.id, klona(formValues.controls[form.id].value)));
     }
    } else {
     return Promise.resolve({});
    }
   } else {
    return Promise.resolve({});
   }
  };

  return new Promise<any[]>((res) => {
   const checkAndCall = () => {
    if (index < length) {
     callMethod().then(result => {
      results.push(result);
      checkAndCall();
     });
    } else {
     res(results);
    }
   };
   checkAndCall();
  }).then((result) => {
   console.log(result);
   navigate(location.pathname.split("/").slice(0, -1).join("/"));
  });
 };
 return <form onSubmit={onSubmit} ref={setFormRef}>
  <For each={formMetaData}>
   {item => <DynamicForm formMetaData={item} id={params.id}
                         formGroup={formValues.controls[item.id]} />}
  </For>
  <button type="submit" class="hidden">submit</button>
  <ui5-button onclick={onSubmit}>Save</ui5-button>
  {JSON.stringify(formValues.value)}
 </form>;
};