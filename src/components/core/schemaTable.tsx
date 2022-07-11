import {
  untrack,
  createSignal,
  For,
  createEffect,
  Suspense,
  onCleanup,
  Switch,
  Match,
} from "solid-js";
import { useNavigate, useParams } from "solid-app-router";

const statusStyles = {
  success: "bg-green-100 text-green-800",
  processing: "bg-yellow-100 text-yellow-800",
  failed: "bg-gray-100 text-gray-800",
};

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// TableWithStickyHeader
export default function TableWithStickyHeader() {
  const navigate = useNavigate();
  const params = useParams();

  const [data, setData] = createSignal({
    data: [],
    headers: [] as { key: string; type: string }[],
  });

  const [editableCellIndex, setEditableCelliIndex] = createSignal([null, null]);

  // formData = params.id != "new" ? data : data.filter(d => { return d.key != "_id" && d.key != "_key" });

  // const groupConstructor = formData.reduce((acc, { key, type }) => {
  //   acc[key] = createFormControl("");
  //   return acc;

  // }, {} as { [key: string]: IFormControl });

  // form.setControls(groupConstructor);

  // if (params.id !== "new") {
  //   fetch(`/en/${params.entity}/${params.id}`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data.success) {

  //         form.patchValue(data.data);

  //         if (form.controls["_id"]) form.controls["_id"].markDisabled(true)
  //         if (form.controls["_key"]) form.controls["_key"].markDisabled(true)
  //       }
  //     });
  // }
  // });

  const getObjectData = () => {
    setData((prev) => ({
      ...prev,
      data: [],
      headers: [],
    }));

    fetch(`/en/${params.entity}/_attributes`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((headerWithTypes: { key: string; type: string }[]) => {
        fetch(`/en/${params.entity}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (!data.success) alert(data.exception);
            else {
              const headers = headerWithTypes;
              headers.push({ key: "edit", type: "actions" });

              setData((prev) => ({
                ...prev,
                data: data.data,
                headers,
              }));
            }
          });
      });
  };
  createEffect(() => {
    if (params.entity) untrack(getObjectData);
  });

  const deleteObject = (_key) => {
    fetch(`/en/${params.entity}/${_key}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) alert(data.exception);
        else window.location.reload();
      });
  };

  const Loader = () => {
    console.log("ok");
    const [count, setCount] = createSignal(0),
      interval = setInterval(() => setCount((c) => c + 1), 1000);
    onCleanup(() => clearInterval(interval));

    return <div>Loading... {count()}</div>;
  };

  return (
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">{params.entity}</h1>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            onClick={() => navigate("./new")}
          >
            Add new {JSON.stringify(editableCellIndex)}
          </button>
        </div>
      </div>
      <div class="mt-8 flex flex-col">
        <div class="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle">
            <div class="shadow-sm ring-1 ring-black ring-opacity-5">
              {/* <Suspense fallback={<Loader />}> */}
              <table
                class="min-w-full border-separate"
                style={{ borderSpacing: 0 }}
              >
                <thead class="bg-gray-50">
                  <tr>
                    <For
                      each={data().headers}
                      fallback={<div>Loading Header...</div>}
                    >
                      {(head) => (
                        <th
                          scope="col"
                          class="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                          title={head.type}
                        >
                          {head.key}
                        </th>
                      )}
                    </For>
                  </tr>
                </thead>
                <tbody class="bg-white">
                  <For each={data().data} fallback={<div></div>}>
                    {(entity, i) => {
                      return (
                        <tr>
                          <For
                            each={data().headers}
                            fallback={<div>Loading Header...</div>}
                          >
                            {(head, rowId) => (
                              <td
                                class={classNames(
                                  true ? "border-b border-gray-200" : "",
                                  "whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden sm:table-cell"
                                )}
                              >
                                <Switch fallback={<div onDblClick={() => { console.log("ok1");setEditableCelliIndex(prev => [rowId, head.key]) }}>
                                  {JSON.stringify(editableCellIndex) == JSON.stringify([rowId, head.key]) ? "Editable" : JSON.stringify(entity[head.key])}
                                </div>}>
                                  <Match when={head.type === "boolean"}>
                                    <div onDblClick={() => { console.log("ok2");setEditableCelliIndex(prev => [rowId, head.key]) }}>
                                      {JSON.stringify(editableCellIndex) == JSON.stringify([rowId, head.key]) ? "Editable" : JSON.stringify(entity[head.key])}
                                    </div>
                                  </Match>
                                  <Match when={head.type === "object"}>
                                    <div onDblClick={() => { console.log("ok3");setEditableCelliIndex(prev => [rowId, head.key]) }}>
                                      {JSON.stringify(editableCellIndex) == JSON.stringify([rowId, head.key]) ? "Editable" : JSON.stringify(entity[head.key])}
                                    </div>
                                  </Match>
                                  {/* <Match when={head.type === "actions"}>
                                    <td
                                      class={classNames(
                                        true ? "border-b border-gray-200" : "",
                                        "relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-6 lg:pr-8"
                                      )}
                                    >
                                      <a
                                        href={`${window.location.href}/${entity._key}`}
                                        class="text-indigo-600 hover:text-indigo-900"
                                      >
                                        Edit<span class="sr-only"></span>
                                      </a>
                                      <button
                                        class="pl-3 text-red-600 hover:text-red-900"
                                        onClick={() =>
                                          deleteObject(entity._key)
                                        }
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </Match> */}
                                </Switch>
                              </td>
                            )}
                          </For>
                        </tr>
                      );
                    }}
                  </For>
                </tbody>
              </table>
              {/* </Suspense> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
