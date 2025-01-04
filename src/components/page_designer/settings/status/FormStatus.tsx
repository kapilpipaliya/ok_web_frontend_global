import type { SetStoreFunction } from "solid-js/store";

import { createSignal, createUniqueId, For, onCleanup, Show } from "solid-js";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { type GraphInterface, useGraph, type Vertex } from "~/lib/graph/graph";
import { addMetaVertexes } from "~/lib/graph/mutate/form/createMeta";
import { addNewVertex, mergeVertexProperties, newVertex } from "~/lib/graph/mutate/vertex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";

import { PROPERTIES } from "../../../styled/constants/constant";

export function FormStatus() {
  const [graph, setGraph] = useGraph();

  const vertexIds = createVertexIds();

  const metaTxnId = graph.newTxnId();
  createVertices(vertexIds, metaTxnId, graph, setGraph);

  const [formStatus, setFormStatus] = createSignal(
    "Disable on specific date or at submission limit",
  );
  const [expirationDate, setExpirationDate] = createSignal("");
  const [expirationTime, setExpirationTime] = createSignal("");
  const [submissionLimit, setSubmissionLimit] = createSignal("");
  const [warningMessage, setWarningMessage] = createSignal(
    "This form is currently unavailable!",
  );

  function metaAttributes() {
    return [
      graph.vertexes[vertexIds.formStatus],
      graph.vertexes[vertexIds.expirationDate],
      graph.vertexes[vertexIds.expirationTime],
      graph.vertexes[vertexIds.submissionLimit],
      graph.vertexes[vertexIds.warningMessage],
    ];
  }

  onCleanup(() => {
    revertTransaction(metaTxnId, graph, setGraph);
  });

  return (
    <>
      <div class="space-y:3rem">
        <div class="border-bottom-width:1px border-color:rgb(17,24,39,0.1) pb:3rem">
          <h2 class="lh:1.5rem color:rgb(17,24,39) f:1rem font-weight:600 leading:1.75rem">
            Form Properties
          </h2>
          <div class="display:grid gap-x:1.5rem gap-y:2rem grid-cols:1 mt:2.5rem">
            <For each={metaAttributes()}>
              {(metaVertex) => {
                return (
                  <div class="grid-col-span:4@sm">
                    <Show when={metaVertex.P.key === "formStatus"}>
                      <div>
                        <label
                          class="lh:1.25rem color:rgb(17,24,39) display:block f:0.875rem font-weight:500 leading:1.5rem"
                          for="form-status"
                        >
                          Form Status
                        </label>
                        <select
                          class="ring-inset --ring-color:rgb(209,213,219) ring-inset:focus --ring-color:rgb(79,70,229):focus lh:1.25rem@sm border-radius:0.375rem border-width:0 box-shadow:0|0|0|1px|rgba(0,0,0,0.5) box-shadow:0|0|0|2px|rgba(0,0,0,0.5):focus color:rgb(17,24,39) display:block f:0.875rem leading:1.5rem@sm py:0.375rem width:100%"
                          id="form-status"
                          onInput={(e) => setFormStatus(e.currentTarget.value)}
                          value={formStatus()}
                        >
                          <option value="Enabled">Enabled</option>
                          <option value="Disabled">Disabled</option>
                          <option value="Disable on specific date">
                            Disable on specific date
                          </option>
                          <option value="Disable at submission limit">
                            Disable at submission limit
                          </option>
                          <option value="Disable on specific date or at submission limit">
                            Disable on specific date or at submission limit
                          </option>
                        </select>
                      </div>
                    </Show>

                    <Show
                      when={
                        (formStatus() === "Disable on specific date" ||
                          formStatus() ===
                            "Disable on specific date or at submission limit") &&
                        metaVertex.P.key === "expirationDate"
                      }
                    >
                      <div>
                        <label
                          class="lh:1.25rem color:rgb(17,24,39) display:block f:0.875rem font-weight:500 leading:1.5rem"
                          for="expiration-date"
                        >
                          Expiration Date
                        </label>
                        <input
                          class="ring-inset --ring-color:rgb(209,213,219) ::color:rgb(156,163,175)placeholder ring-inset:focus --ring-color:rgb(79,70,229):focus lh:1.25rem@sm border-radius:0.375rem border-width:0 box-shadow:0|0|0|1px|rgba(0,0,0,0.5) box-shadow:0|0|0|2px|rgba(0,0,0,0.5):focus color:rgb(17,24,39) display:block f:0.875rem leading:1.5rem@sm py:0.375rem width:100%"
                          id="expiration-date"
                          onInput={(e) =>
                            setExpirationDate(e.currentTarget.value)
                          }
                          type="date"
                          value={expirationDate()}
                        />
                        <label
                          class="lh:1.25rem color:rgb(17,24,39) display:block f:0.875rem font-weight:500 leading:1.5rem"
                          for="expiration-time"
                        >
                          Expiration Time
                        </label>
                        <input
                          class="ring-inset --ring-color:rgb(209,213,219) ::color:rgb(156,163,175)placeholder ring-inset:focus --ring-color:rgb(79,70,229):focus lh:1.25rem@sm border-radius:0.375rem border-width:0 box-shadow:0|0|0|1px|rgba(0,0,0,0.5) box-shadow:0|0|0|2px|rgba(0,0,0,0.5):focus color:rgb(17,24,39) display:block f:0.875rem leading:1.5rem@sm py:0.375rem width:100%"
                          id="expiration-time"
                          onInput={(e) =>
                            setExpirationTime(e.currentTarget.value)
                          }
                          type="time"
                          value={expirationTime()}
                        />
                        <div>Timezone New York (GMT -04:00)</div>
                      </div>
                    </Show>

                    <Show
                      when={
                        (formStatus() === "Disable at submission limit" ||
                          formStatus() ===
                            "Disable on specific date or at submission limit") &&
                        metaVertex.P.key === "submissionLimit"
                      }
                    >
                      <div>
                        <label
                          class="lh:1.25rem color:rgb(17,24,39) display:block f:0.875rem font-weight:500 leading:1.5rem"
                          for="submission-limit"
                        >
                          Submission Limit
                        </label>
                        <input
                          class="ring-inset --ring-color:rgb(209,213,219) ::color:rgb(156,163,175)placeholder ring-inset:focus --ring-color:rgb(79,70,229):focus lh:1.25rem@sm border-radius:0.375rem border-width:0 box-shadow:0|0|0|1px|rgba(0,0,0,0.5) box-shadow:0|0|0|2px|rgba(0,0,0,0.5):focus color:rgb(17,24,39) display:block f:0.875rem leading:1.5rem@sm py:0.375rem width:100%"
                          id="submission-limit"
                          onInput={(e) =>
                            setSubmissionLimit(e.currentTarget.value)
                          }
                          type="number"
                          value={submissionLimit()}
                        />
                      </div>
                    </Show>

                    <Show
                      when={
                        (formStatus() === "Disabled" ||
                          formStatus() === "Disable on specific date" ||
                          formStatus() === "Disable at submission limit" ||
                          formStatus() ===
                            "Disable on specific date or at submission limit") &&
                        metaVertex.P.key === "warningMessage"
                      }
                    >
                      <div>
                        <label
                          class="lh:1.25rem color:rgb(17,24,39) display:block f:0.875rem font-weight:500 leading:1.5rem"
                          for="warning-message"
                        >
                          Warning Message
                        </label>
                        <input
                          class="ring-inset --ring-color:rgb(209,213,219) ::color:rgb(156,163,175)placeholder ring-inset:focus --ring-color:rgb(79,70,229):focus lh:1.25rem@sm border-radius:0.375rem border-width:0 box-shadow:0|0|0|1px|rgba(0,0,0,0.5) box-shadow:0|0|0|2px|rgba(0,0,0,0.5):focus color:rgb(17,24,39) display:block f:0.875rem leading:1.5rem@sm py:0.375rem width:100%"
                          id="warning-message"
                          onInput={(e) =>
                            setWarningMessage(e.currentTarget.value)
                          }
                          type="text"
                          value={warningMessage()}
                        />
                      </div>
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
      </div>

      <div class="flex align-items:center gap-x:1.5rem justify-content:flex-end mt:1.5rem">
        <button
          class="lh:1.25rem color:rgb(17,24,39) f:0.875rem font-weight:600 leading:1.5rem"
          type="button"
        >
          Cancel
        </button>
        <button
          class="lh:1.25rem bg:rgb(79,70,229) bg:rgb(99,102,241):hover border-radius:0.375rem box-shadow:0|1px|2px|0|rgba(0,0,0,0.05) color:rgb(255,255,255) f:0.875rem font-weight:600 outline-color:rgb(23,17,123):focus-visible outline-offset:2px:focus-visible outline-style:solid:focus-visible outline-width:2px:focus-visible px:0.75rem py:0.5rem"
          type="button"
        >
          Save
        </button>
      </div>
    </>
  );
}

function createVertexIds() {
  return {
    formStatus: `formStatusVertex${createUniqueId()}`,
    // eslint-disable-next-line perfectionist/sort-objects
    expirationDate: `expirationDateVertex${createUniqueId()}`,
    expirationTime: `expirationTimeVertex${createUniqueId()}`,
    submissionLimit: `submissionLimitVertex${createUniqueId()}`,
    warningMessage: `warningMessageVertex${createUniqueId()}`,
  };
}
function createVertices(
  vertexIds: ReturnType<typeof createVertexIds>,
  txnId: number,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const vertices: ({
    attributes?: FieldAttribute[];
  } & Omit<Vertex, "IN" | "L" | "OUT">)[] = [
    {
      id: vertexIds.formStatus,
      P: {
        class: PROPERTIES.Css.TextField,
        componentName: "TextInput",
        displayName: "Form Status",
        key: "formStatus",
      },
    },
    {
      id: vertexIds.expirationDate,
      P: {
        class: PROPERTIES.Css.TextField,
        componentName: "DatePicker",
        displayName: "Expiration Date",
        key: "expirationDate",
      },
    },
    {
      id: vertexIds.expirationTime,
      P: {
        class: PROPERTIES.Css.TextField,
        componentName: "TimePicker",
        displayName: "Expiration Time",
        key: "expirationTime",
      },
    },
    {
      id: vertexIds.submissionLimit,
      P: {
        class: PROPERTIES.Css.TextField,
        componentName: "TextInput",
        displayName: "Submission Limit",
        key: "submissionLimit",
      },
    },
    {
      id: vertexIds.warningMessage,
      P: {
        class: PROPERTIES.Css.TextField,
        componentName: "TextInput",
        displayName: "Warning Message",
        key: "warningMessage",
      },
    },
  ];

  vertices.forEach((vertex) => {
    const newVertexInstance = newVertex(vertex.id, ["MetaTemp"], vertex.P);
    addNewVertex(txnId, newVertexInstance, graph, setGraph);
    if (vertex.attributes) {
      addMetaVertexes(
        graph,
        setGraph,
        txnId,
        graph.vertexes[vertex.id],
        vertex.attributes,
      );
    }
  });
}
