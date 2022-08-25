import { createEffect, createSignal, For, Match, Show, onCleanup, Switch, untrack } from "solid-js";
import { useLocation, useNavigate, useParams } from "solid-app-router";
import { deleteNode, fetchAttributesTableData, fetchCollectionData, FormMetaData } from "../api";
import { css } from "solid-styled-components";
import { graph, Id } from "../../lib/graph";

export default function SchemaTable() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const [data, setData] = createSignal({
    data: [] as (Id[] | (() => Id[])),
    headers: [] as { key: string; type: string }[]
  });
  const tableMetaData = fetchAttributesTableData(params.entity) as FormMetaData;

  const [editableCellIndex, setEditableCellIndex] = createSignal([null, null]);

  const getObjectData = () => {
    setData((prev) => ({
      ...prev,
      data: [],
      headers: []
    }));

    const headers = tableMetaData.attributes;
    headers.push({ key: "edit", type: "actions" });

    // For async data get operation, we will handle it differently
    setData((prev) => ({
      ...prev,
      data: () => fetchCollectionData(params.entity),
      headers
    }));
  };

  createEffect(() => {
    // clear the state when routes parameter changes.
    if (params.entity) untrack(getObjectData);
  });

  const deleteObject = (id) => {
    if (confirm("are you sure")) {
      if(tableMetaData.save[0] === "vertex"){
        deleteNode(tableMetaData.save[1], id).then((data) => {
          if (!data.success) alert(data.exception);
          else getObjectData();
        });
      }
    }
  };

  return (
    <div>
      <div>
        <div>
          <h1>{tableMetaData.title}</h1>
        </div>
        <div>
          <ui5-button onClick={() => navigate("./new")}>
            Add new
          </ui5-button>
        </div>
      </div>
      <div>
        <div>
          <div>
            <div
              class={css`
                table,
                th,
                td {
                  border: 1px solid rgba(0, 0, 0, 0.1);
                  border-collapse: collapse;
                }
              `}
            >
              {/* <Suspense fallback={<Loader />}> */}
              <Show when={!data().headers.length}>No Data</Show>
              <table style={{ borderSpacing: 0 }}>
                <thead>
                <tr>
                  <th>ID</th>
                  <For each={data().headers}>
                    {(head) => (
                      <th scope="col" title={head.type}>
                        {head.key}
                      </th>
                    )}
                  </For>
                </tr>
                </thead>
                <tbody>
                <For each={typeof data().data === "function" ? (data().data as (() => Id[]))() : data().data as Id[]}
                     fallback={<div></div>}>
                  {(id, i) => {
                    return (
                      <tr>
                        <td>{graph.vertexes[id]?.["id"]}</td>
                        <For each={data().headers}>
                          {(head, rowId) => (
                            <Show when={graph.vertexes[id]}>
                              <td>
                                <Switch
                                  fallback={
                                    <div
                                      onDblClick={() => {
                                        setEditableCellIndex((prev) => [rowId, head.key]);
                                      }}
                                    >
                                      {JSON.stringify(editableCellIndex) ==
                                      JSON.stringify([rowId, head.key])
                                        ? "Editable"
                                        : JSON.stringify(
                                          graph.vertexes[id]["properties"][head.key]
                                        )}
                                    </div>
                                  }
                                >
                                  <Match when={head.type === "boolean"}>
                                    <div
                                      onDblClick={() => {
                                        setEditableCellIndex((prev) => [rowId, head.key]);
                                      }}
                                    >
                                      {JSON.stringify(editableCellIndex) ==
                                      JSON.stringify([rowId, head.key])
                                        ? "Editable"
                                        : JSON.stringify(
                                          graph.vertexes[id]["properties"][head.key]
                                        )}
                                    </div>
                                  </Match>
                                  <Match when={head.type === "object"}>
                                    <div
                                      onDblClick={() => {
                                        setEditableCellIndex((prev) => [rowId, head.key]);
                                      }}
                                    >
                                      {JSON.stringify(editableCellIndex) ==
                                      JSON.stringify([rowId, head.key])
                                        ? "Editable"
                                        : JSON.stringify(
                                          graph.vertexes[id]["properties"][head.key]
                                        )}
                                    </div>
                                  </Match>
                                  <Match when={head.type === "actions"}>
                                    <td>
                                      <a href={`${location.pathname}/${id}`}>
                                        Edit<span></span>
                                      </a>
                                      <button onClick={() => deleteObject(id)}>Delete</button>
                                    </td>
                                  </Match>
                                </Switch>
                              </td>
                            </Show>
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
