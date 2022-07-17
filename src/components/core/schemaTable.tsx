import { untrack, createSignal, For, createEffect, Suspense, onCleanup, Switch, Match } from "solid-js";
import { useNavigate, useParams } from "solid-app-router";
import { apiPath } from "../../constant";
import { fetchAttributesData, fetchCollectionData } from "../api";

export default function TableWithStickyHeader() {
  const navigate = useNavigate();
  const params = useParams();

  const [data, setData] = createSignal({
    data: [],
    headers: [] as { key: string; type: string }[],
  });

  const [editableCellIndex, setEditableCellIndex] = createSignal([null, null]);

  const getObjectData = () => {
    setData((prev) => ({
      ...prev,
      data: [],
      headers: [],
    }));

    fetchAttributesData(params.entity).then((headerWithTypes: { key: string; type: string }[]) => {
      fetchCollectionData(params.entity).then((data) => {
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
    // clear the state when routes parameter changes.
    if (params.entity) untrack(getObjectData);
  });

  const deleteObject = (_key) => {
    fetch(apiPath + `/en/${params.entity}/${_key}`, {
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
              <table class="min-w-full border-separate" style={{ borderSpacing: 0 }}>
                <thead class="bg-gray-50">
                  <tr>
                    <For each={data().headers} fallback={<div>Loading Header...</div>}>
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
                          <For each={data().headers} fallback={<div>Loading Header...</div>}>
                            {(head, rowId) => (
                              <td>
                                <Switch
                                  fallback={
                                    <div
                                      onDblClick={() => {
                                        setEditableCellIndex((prev) => [rowId, head.key]);
                                      }}
                                    >
                                      {JSON.stringify(editableCellIndex) == JSON.stringify([rowId, head.key]) ? "Editable" : JSON.stringify(entity[head.key])}
                                    </div>
                                  }
                                >
                                  <Match when={head.type === "boolean"}>
                                    <div
                                      onDblClick={() => {
                                        setEditableCellIndex((prev) => [rowId, head.key]);
                                      }}
                                    >
                                      {JSON.stringify(editableCellIndex) == JSON.stringify([rowId, head.key]) ? "Editable" : JSON.stringify(entity[head.key])}
                                    </div>
                                  </Match>
                                  <Match when={head.type === "object"}>
                                    <div
                                      onDblClick={() => {
                                        setEditableCellIndex((prev) => [rowId, head.key]);
                                      }}
                                    >
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
