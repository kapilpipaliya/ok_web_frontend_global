import { createSignal, For, getOwner, Match, runWithOwner, Show, Switch } from "solid-js";
import { useParams, useNavigate, useLocation } from "solid-app-router";
import { bindOwner, createFormControl, createFormGroup, IFormControl } from "solid-forms";
import { Field, TextInputField, BooleanInputField, JsonInput, GeneralInput } from "ok_web_components";
import { addNode, fetchAttributesTableData, fetchDocument, updateNode } from "../api";
import { klona } from "klona/json";

interface AttributeMetaType {
  key: string;
  type: string
}

const getDefaultValue = (meta: AttributeMetaType) => {
  switch (meta.type) {
    case "string":
      return "";
    case "boolean":
      return false;
    case "json":
      return {};
    default:
      return "";
  }
};

const getHtmlInputType = (meta: AttributeMetaType) => {
  switch (meta.type) {
    case "string":
      return "text";
    case "integer":
      return "number";
    case "decimal":
      return "number";
    case "json":
      return "jsoneditor";
    default:
      return meta.type;
  }
};

export default function SchemaDetail(props: {}) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const form = createFormGroup({});

  let formData = [] as AttributeMetaType[];

  // use a signal to show form because `Object.keys(form.controls).length` is not reactive
  const [fetching, setFetching] = createSignal(true);
  const owner = getOwner();
  fetchAttributesTableData(params.entity).then((body) => {
    formData =
      params.id != "new"
        ? body.data
        : body.data.filter((d) => {
          return d.key != "_id" && d.key != "_key";
        });

    const groupConstructor = formData.reduce((acc, meta) => {
      runWithOwner(owner, () => {
        acc[meta.key] = createFormControl(getDefaultValue(meta));
      });
      return acc;
    }, {} as { [key: string]: IFormControl });

    form.setControls(groupConstructor);

    if (params.id !== "new") {
      fetchDocument(params.entity, params.id).then((body) => {
        if (body.success) {
          if (!body.data) {
            alert(`document with id: ${params.id} not exist`);
            return;
          }
          form.patchValue(body.data["properties"]);

          if (form.controls["_id"]) form.controls["_id"].markDisabled(true);
          if (form.controls["_key"]) form.controls["_key"].markDisabled(true);
        }
        setFetching(false);
      });
    } else {
      setFetching(false);
    }
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (params.id == "new") {
      addNode(params.entity, klona(form.value))
        .then((data) => {
          if (data.error) alert(data.exception);
          else navigate(location.pathname.split("/").slice(0, -1).join("/"));
        });
    } else {
      updateNode(params.entity, params.id, klona(form.value))
        .then((data) => {
          if (data.error) alert(data.exception);
          else navigate(location.pathname.split("/").slice(0, -1).join("/"));
        });
    }
  };
  /* @mount */
  {
    // Todo: Focus first form element, hint: think to use a library
  }
  return (
    <>
      <div>
        <form onSubmit={onSubmit}>
          <Show when={!fetching()} fallback={<>Loading</>}>
            <For each={formData}>
              {(meta) => (
                <Switch>
                  <Match when={meta.type === "string"}>
                    <TextInputField
                      label={meta.key}
                      control={form.controls[meta.key]}
                      type={getHtmlInputType(meta)}
                    />
                  </Match>
                  <Match when={meta.type === "boolean"}>
                    <BooleanInputField
                      label={meta.key}
                      type="checkbox"
                      control={form.controls[meta.key]}
                    />
                  </Match>
                  <Match when={meta.type === "json"}>
                    <Field label={meta.key}>
                      <JsonInput control={form.controls[meta.key]} type={getHtmlInputType(meta)} />
                    </Field>
                  </Match>
                  <Match when={meta.type === "dynamic"}>
                    <Field label={meta.key}>
                      <GeneralInput
                        control={form.controls[meta.key]}
                        type={getHtmlInputType(meta)}
                      />
                    </Field>
                  </Match>
                </Switch>
              )}
            </For>
          </Show>
          <br />
          {JSON.stringify(form.value)}

          <button type="submit" class="hidden">submit</button>
          <ui5-button onclick={onSubmit}>Save</ui5-button>
        </form>
      </div>
    </>
  );
}
