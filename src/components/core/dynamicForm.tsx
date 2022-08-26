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
 bindOwner, createFormArray,
 createFormControl,
 createFormGroup,
 IFormControl
} from "solid-forms";
import { G, D } from "@mobily/ts-belt";
import {
 Field,
 TextInputField,
 BooleanInputField,
 JsonInput,
 GeneralInput,
 SelectInputField,
 TableInputField,
 getDefaultValue
} from "ok_web_components";
import {
 addNode,
 fetchAttributesTableData, fetchCollectionData,
 fetchDocument,
 updateNode
} from "../api";
import { klona } from "klona/json";
import { graph, Id } from "../../lib/graph";
import {
 BaseField,
 SelectField,
 TableField,
 FieldAttribute,
 FormMetaData
} from "ok_web_components/src/components/input/Form";

interface DynamicFormProps {
 formMetaData: FormMetaData;
 id?: Id;
 formGroup: ReturnType<typeof createFormGroup>
}

export function DynamicForm(props: DynamicFormProps) {
 let formData = props.formMetaData.attributes;

 const Form = () => {
  return <><For
   each={formData}>
   {(meta) => (
    <Switch>
     <Match when={meta.type === "string"}>
      <TextInputField
       label={meta.key}
       // @ts-ignore
       control={props.formGroup.controls[meta.key]}
       type={"text"}
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
        control={props.formGroup.controls[meta.key]} />
      </Field>
     </Match>
     <Match when={meta.type === "dynamic"}>
      <Field label={meta.key}>
       <GeneralInput
        // @ts-ignore
        control={props.formGroup.controls[meta.key]}
       />
      </Field>
     </Match>
     <Match when={meta.type === "select"}>
      <Field label={meta.key}>
       <SelectInputField
        // @ts-ignore
        control={props.formGroup.controls[meta.key]}
        fetchOptions={(meta as SelectField).fetchOptions}
       />
      </Field>
     </Match>
     <Match when={meta.type === "table"}>
      <Field label={meta.key}>
       <TableInputField
        // @ts-ignore
        control={props.formGroup.controls[meta.key]}
        attributes={(meta as TableField).attributes}
        defaultValue="undefined"
       />
      </Field>
     </Match>
    </Switch>
   )}
  </For>

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

 // use a signal to show form because `Object.keys(form.controls).length` is not reactive
 const [fetching, setFetching] = createSignal(true);
 // Todo make any fetching is true, dont display the forms:
 // setValuesToEach Form:
 const owner = getOwner();
 formMetaData.forEach((form) => {
  const formGroup = formValues.controls[form.id];
  const groupConstructor = form.attributes.reduce((acc, meta) => {
   runWithOwner(owner, () => {
    if (meta.type === "table") {
     acc[meta.key] = createFormArray([]);
    } else {
     acc[meta.key] = createFormControl(getDefaultValue(meta.type));
    }
   });
   return acc;
  }, {} as { [key: string]: IFormControl | ReturnType<typeof createFormArray> });

  formGroup.setControls(groupConstructor);

  if (params.id !== "new") {
   // used FormMetaData.save attribute temporary.
   if (form.save[0] === "vertex") {
    const vertex = fetchDocument(form.save[1], params.id);

    if (!vertex) {
     alert(`document with id: ${params.id} not exist`);
     return;
    }

    formGroup.patchValue(D.selectKeys(vertex.properties, Object.keys(form)));
    if (formGroup.controls["_id"])
     formGroup.controls["_id"].markDisabled(true);
    if (formGroup.controls["_key"])
     formGroup.controls["_key"].markDisabled(true);
   }
   // setFetching(false);
  }
 });
 setFetching(false);

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

 return <Show when={!fetching()} fallback={<>Loading</>}>
  <form onSubmit={onSubmit} ref={setFormRef}>
   <For each={formMetaData}>
    {item => <DynamicForm formMetaData={item} id={params.id}
                          formGroup={formValues.controls[item.id]} />}
   </For>
   <button type="submit" class="hidden">submit</button>
   <ui5-button onclick={onSubmit}>Save</ui5-button>
   {JSON.stringify(formValues.value)}
  </form>
 </Show>;
};