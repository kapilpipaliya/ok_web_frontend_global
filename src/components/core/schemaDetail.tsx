import { createSignal, For, Match, Show, Switch } from "solid-js";
import { useParams, useNavigate } from "solid-app-router";
import { createFormControl, createFormGroup, IFormControl } from "solid-forms";
import { Field, TextInputField, JsonInput, GeneralInput } from "ok_web_components";
import { API_PATH } from "../../constant";
import { fetchAttributes, fetchDocument } from "../api";

export default function SchemaDetail(props: any) {
  const params = useParams();
  const navigate = useNavigate();
  const form = createFormGroup({});

  let formData = [] as Array<{ key: string; type: string }>;
  const getDefaultValue = (meta: { key: string; type: string }) => {
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

  // use a signal to show form because `Object.keys(form.controls).length` is not reactive
  const [fetching, setFetching] = createSignal(true);
  fetchAttributes(params.entity).then((data) => {
    formData =
      params.id != "new"
        ? data
        : data.filter((d) => {
            return d.key != "_id" && d.key != "_key";
          });

    const groupConstructor = formData.reduce((acc, meta) => {
      const { key, type } = meta;
      acc[key] = createFormControl(getDefaultValue(meta));
      return acc;
    }, {} as { [key: string]: IFormControl });

    form.setControls(groupConstructor);

    if (params.id !== "new") {
      fetchDocument(params.entity, params.id).then((data) => {
        if (data.success) {
          form.patchValue(data.data);

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
      fetch(API_PATH + `/en/${params.entity}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form.value),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) alert(data.exception);
          else navigate("../");
        });
    } else {
      fetch(API_PATH + `/en/${params.entity}/${params.id}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form.value),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) alert(data.exception);
          else navigate("../");
        });
    }
  };

  const getHtmlInputType = (meta: { key: string; type: string }) => {
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
        break;
    }
  };

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
                    <TextInputField
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

          <button>Save</button>
        </form>
      </div>
    </>
  );
}
