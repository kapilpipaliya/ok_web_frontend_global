import { createSignal, For, getOwner, Match, runWithOwner, Show, Switch } from "solid-js";
import { useParams, useNavigate, useLocation } from "solid-app-router";
import { bindOwner, createFormControl, createFormGroup, IFormControl } from "solid-forms";
import { Field, TextInputField, BooleanInputField, JsonInput, GeneralInput } from "ok_web_components";
import { addNode, fetchAttributesTableData, fetchDocument, FieldAttribute, FormMetaData, updateNode } from "../api";
import { klona } from "klona/json";
import { Id } from "../../lib/graph";

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

export function SchemaDetail(props: { formMetaData: FormMetaData; id?: Id; formGroup: ReturnType<typeof createFormGroup> }) {
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
        const body = fetchDocument(props.formMetaData.save[1], props.id);

        if (!body) {
          alert(`document with id: ${props.id} not exist`);
          return;
        }
        props.formGroup.patchValue(body.properties);

        if (props.formGroup.controls["_id"]) props.formGroup.controls["_id"].markDisabled(true);
        if (props.formGroup.controls["_key"]) props.formGroup.controls["_key"].markDisabled(true);

      }

      setFetching(false);

    } else {
      setFetching(false);
    }
  }

  const Form = () => {
    return <><Show when={!fetching()} fallback={<>Loading</>}><For each={formData}>
      {(meta) => (
        <Switch>
          <Match when={meta.type === "string"}>
            <TextInputField
              label={meta.key}
              control={props.formGroup.controls[meta.key]}
              type={getHtmlInputType(meta)}
            />
          </Match>
          <Match when={meta.type === "boolean"}>
            <BooleanInputField
              label={meta.key}
              type="checkbox"
              control={props.formGroup.controls[meta.key]}
            />
          </Match>
          <Match when={meta.type === "json"}>
            <Field label={meta.key}>
              <JsonInput control={props.formGroup.controls[meta.key]} type={getHtmlInputType(meta)} />
            </Field>
          </Match>
          <Match when={meta.type === "dynamic"}>
            <Field label={meta.key}>
              <GeneralInput
                control={props.formGroup.controls[meta.key]}
                type={getHtmlInputType(meta)}
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
            return Promise.resolve(addNode(form.save[1], klona(formValues.controls[form.id].value)));
          } else {
            return Promise.resolve(updateNode(form.save[1], params.id, klona(formValues.controls[form.id].value)));
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
      navigate(location.pathname.split("/").slice(0, -1).join("/"))
    });
  };
  return <form onSubmit={onSubmit} ref={setFormRef}>
    <For each={formMetaData}>
      {item => <SchemaDetail formMetaData={item} id={params.id} formGroup={formValues.controls[item.id]} />}
    </For>
    <button type="submit" class="hidden">submit</button>
    <ui5-button onclick={onSubmit}>Save</ui5-button>
    {JSON.stringify(formValues.value)}
  </form>;
};