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
import { A, D } from "@mobily/ts-belt";
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
 addEdge,
 addNode,
 fetchAttributesTableData, fetchCollectionData,
 fetchDocument, fetchEdge, updateEdgeWithStartAndEnd,
 updateNode
} from "../api";
import { klona } from "klona/json";
import { addNewEdge, graph, Id } from "../../lib/graph";
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
        data={(meta as TableField).data}
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

 const idMap = new Map<string, string>();
 formMetaData.forEach(form => {
  if (form.idFn) {
   idMap.set(form.id, form.idFn(idMap));
  } else {
   idMap.set(form.id, params.id);
  }
 });

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

  if (params.id && params.id !== "new") {
   if (form.data) {
    const data = form.data(idMap);
    const value = D.selectKeys(data, form.attributes.filter(attr => attr.type !== "table").map(attr => attr.key));
    if (D.isNotEmpty(value)) formGroup.patchValue(value);
    if (formGroup.controls["_id"])
     formGroup.controls["_id"].markDisabled(true);

    const tableAttributes = form.attributes.filter(attr => attr.type === "table");
    if (tableAttributes.length) {
     tableAttributes.forEach((attr: TableField) => attr.data = data[attr.key]);
    }
   } else if (form.save[0] === "vertex") {
    // used FormMetaData.save attribute temporary.
    const vertex = fetchDocument(form.save[1], params.id);

    if (!vertex) {
     alert(`document with id: ${params.id} not exist`);
     return;
    }
    const value = D.selectKeys(vertex.properties, Object.keys(form).filter(key => form[key].type !== "table"));
    if (D.isNotEmpty(value)) formGroup.patchValue(value);
    if (formGroup.controls["_id"])
     formGroup.controls["_id"].markDisabled(true);
   } else if (form.save[0] === "edge") {
    const edge = fetchEdge(form.save[1], params.id);

    if (!edge) {
     alert(`Edge with id: ${params.id} not exist`);
     return;
    }
    const value = D.selectKeys(edge.properties, Object.keys(form).filter(key => form[key].type !== "table"));
    if (D.isNotEmpty(value)) formGroup.patchValue(edge);

   }
   // setFetching(false);
  }
 });
 setFetching(false);

 const onSubmit = (e) => {
  e.preventDefault();
  let index = 0;
  const length = formMetaData.length;
  const results = {} as { [key: string]: any };
  const callMethod = (): Promise<any> => {
   const form = formMetaData[index++];
   if (form) {
    const formValue = klona(formValues.controls[form.id].value);
    const value = D.selectKeys(formValue, Object.keys(form).filter(key => form[key].type !== "table"));
    if (form.save[0] === "vertex") {
     const result_ = {};
     if (params.id == "new") {
      result_["id"] = addNode(form.save[1], value);
     } else {
      // TODO if value is not changed dont update it.
      result_["id"] = updateNode(form.save[1], params.id, value);
     }
     return Promise.resolve(result_);
    } else if (form.save[0] === "edge") {
     const start = form.save[2]?.(results, formValue);
     const end = form.save[3]?.(results, formValue);
     const result_ = {};
     if (start && end) {
      if (params.id == "new") {
       result_["id"] = addEdge(form.save[1], value, start, end);
      } else {
       // TODO if start, end or value is not changed dont update it.
       result_["id"] = updateEdgeWithStartAndEnd(form.save[1], params.id, value, start, end);
      }
     }
     form.attributes.filter(form_ => form_.type === "table").forEach(attr => {
      result_[attr.key] = attr.save(results, formValue[attr.key]);
     });
     return Promise.resolve(result_);
    } else {
     return Promise.resolve({});
    }
   } else {
    return Promise.resolve({});
   }
  };

  return new Promise<{ [key: string]: any }>((res) => {
   const checkAndCall = () => {
    if (index < length) {
     callMethod().then(result => {
      results[formMetaData[index - 1].id] = result;
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