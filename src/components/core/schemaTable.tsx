import { createEffect, createSignal, For, Match, Show, onCleanup, Switch, untrack } from "solid-js";
import { useNavigate, useParams } from "solid-app-router";
import { API_PATH } from "../../constant";
import { fetchAttributesTableData, fetchCollectionData } from "../api";
import { css } from "solid-styled-components";

export default function SchemaTable() {
  const navigate = useNavigate();
  const params = useParams();

  const [data, setData] = createSignal({
    data: [],
    headers: [] as { key: string; type: string }[]
  });

  const [editableCellIndex, setEditableCellIndex] = createSignal([null, null]);

  const getObjectData = () => {
    setData((prev) => ({
      ...prev,
      data: [],
      headers: []
    }));

    fetchAttributesTableData(params.entity).then(
      (headerWithTypesBody) => {
        if (!headerWithTypesBody) {
          alert("header data not available");
          return;
        }
        fetchCollectionData(params.entity).then((body) => {
          if (!body.success) {
            alert(body.exception);
          } else {
            const headers = headerWithTypesBody.data;
            headers.push({ key: "edit", type: "actions" });

            setData((prev) => ({
              ...prev,
              data: body.data,
              headers
            }));
          }
        });
      }
    );
  };

  createEffect(() => {
    // clear the state when routes parameter changes.
    if (params.entity) untrack(getObjectData);
  });

  const deleteObject = (id) => {
    if (confirm("are you sure")) {
      fetch(API_PATH + `/en/${params.entity}/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) alert(data.exception);
          else getObjectData();
        });
    }
  };


  return (
    <div>
      <div>
        <div>
          <h1>{params.entity}</h1>
        </div>
        <div>
          <button type="button" onClick={() => navigate("./new")}>
            Add new {JSON.stringify(editableCellIndex)}
          </button>
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
                <For each={data().data} fallback={<div></div>}>
                  {(entity, i) => {
                    return (
                      <tr>
                        <td>{entity["id"]}</td>
                        <For each={data().headers}>
                          {(head, rowId) => (
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
                                      : JSON.stringify(entity['properties'][head.key])}
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
                                      : JSON.stringify(entity['properties'][head.key])}
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
                                      : JSON.stringify(entity['properties'][head.key])}
                                  </div>
                                </Match>
                                <Match when={head.type === "actions"}>
                                  <td>
                                    <a href={`${window.location.href}/${entity['properties']['id']}`}>
                                      Edit<span></span>
                                    </a>
                                    <button onClick={() => deleteObject(entity['properties']['id'])}>
                                      Delete
                                    </button>
                                  </td>
                                </Match>
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
