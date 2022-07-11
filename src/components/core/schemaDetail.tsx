import { createSignal, For, Match, Show, Switch } from "solid-js";
import { useParams, useNavigate } from "solid-app-router";
import { createFormControl, createFormGroup, IFormControl } from "solid-forms";
import { TextInput } from "../input/text_input";
import { Field } from "../input/field";
import { BooleanInput } from "../input/boolean_input";
import { JsonEditor } from "../input/json_input";
import { apiPath } from "../../constant";

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
        break;
    }
  };

  // use a signal to show form because `Object.keys(form.controls).length` is not reactive
  const [fetching, setFetching] = createSignal(true);
  fetch(apiPath + `/en/${params.entity}/_attributes`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
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
        fetch(apiPath + `/en/${params.entity}/${params.id}`)
          .then((res) => res.json())
          .then((data) => {
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
      fetch(apiPath + `/en/${params.entity}`, {
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
      fetch(apiPath + `/en/${params.entity}/${params.id}`, {
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
        break;

      default:
        return meta.type;
        break;
    }
  };

  return (
    <>
      <div class="flex justify-center flex-col w-full">
        <form onSubmit={onSubmit} class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <Show when={!fetching()} fallback={<>Loading</>}>
            <For each={formData}>
              {(meta) => (
                <Switch>
                  <Match when={meta.type === "string"}>
                    <Field label={meta.key}>
                      <TextInput
                        control={form.controls[meta.key]}
                        type={getHtmlInputType(meta)}
                        class="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </Field>
                  </Match>
                  <Match when={meta.type === "boolean"}>
                    <Field label={meta.key}>
                      <BooleanInput
                        control={form.controls[meta.key]}
                        class="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </Field>
                  </Match>
                  <Match when={meta.type === "object"}>
                    <Field label={meta.key}>
                      <JsonEditor
                        control={form.controls[meta.key]}
                        type={getHtmlInputType(meta)}
                        class="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </Field>
                  </Match>
                </Switch>
              )}
            </For>
          </Show>
          <br />
          {JSON.stringify(form.value)}

          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Save
          </button>
        </form>
      </div>
    </>
  );
}
