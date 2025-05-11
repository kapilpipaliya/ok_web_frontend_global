import type { SetStoreFunction } from "solid-js/store";

import { createSignal, For, onCleanup, Show } from "solid-js";
import { createUniqueId } from "~/lib/solid/createUniqueId";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { addMetaVertexes } from "~/lib/graph/mutate/form/createMeta";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { PROPERTIES } from "~/pages/settings/constants";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function FormStatus() {
  const [graph, setGraph] = useGraph();

  const vertexIds = createVertexIds();

  const metaTxnId = generateNewTxnId(graph, setGraph);
  createVertices(vertexIds, metaTxnId, graph, setGraph);

  const [formStatus, setFormStatus] = createSignal(
    "Disable on specific date or at submission limit",
  );
  const [expirationDate, setExpirationDate] = createSignal("");
  const [expirationTime, setExpirationTime] = createSignal("");
  const [submissionLimit, setSubmissionLimit] = createSignal("");
  const [warningMessage, setWarningMessage] = createSignal(
    "This page is currently unavailable!",
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
      <As
        as="div"
        css={css`
          margin-bottom: 3rem;
        `}
      >
        <As
          as="div"
          css={css`
              border-bottom-width: 1px;
              border-color: rgb(17,24,39,0.1);
              padding-bottom: 3rem;
          `}
        >
          <As
            as="h2"
            css={css`
                color: rgb(17, 24, 39);
                font-size: 1rem;
                font-weight: 600;
            `}
          >
            Page Properties
          </As>
          <As
            as="div"
            css={css`
                display: grid;
                column-gap: 1.5rem;
                row-gap: 2rem;
                grid-template-columns: repeat(1, 1fr);
                margin-top: 2.5rem;
            `}
          >
            <For each={metaAttributes()}>
              {(metaVertex) => {
                return (
                  <As
                    as="div"
                    css={css`
                        grid-col-span: 4 @sm;
                    `}
                  >
                    <Show when={metaVertex.P.key === "formStatus"}>
                      <div>
                        <As
                          as="label"
                          css={css`
                              line-height: 1.25rem;
                              color: rgb(17, 24, 39);
                              display: block;
                              font-size: 0.875rem;
                              font-weight: 500;
                              leading: 1.5rem;
                          `}
                          for="form-status"
                        >
                          Page Status
                        </As>
                        <As
                          as="select"
                          css={css`
                              border-radius: 0.375rem;
                              border-width: 0;
                              box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
                              box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.5);
                              color: rgb(17, 24, 39);
                              display: block;
                              font-size: 0.875rem;
                              padding-top: 0.375rem;
                              padding-bottom: 0.375rem;
                              width: 100%;
                          `}
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
                        </As>
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
                        <As
                          as="label"
                          css={css`
                              line-height: 1.25rem;
                              color: rgb(17, 24, 39);
                              display: block;
                              font-size: 0.875rem;
                              font-weight: 500;
                              leading: 1.5rem;
                          `}
                          for="expiration-date"
                        >
                          Expiration Date
                        </As>
                        <As
                          as="input"
                          css={css`
                              border-radius: 0.375rem;
                              border-width: 0;
                              box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
                              box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.5);
                              color: rgb(17, 24, 39);
                              display: block;
                              font-size: 0.875rem;
                              leading: 1.5rem;
                              padding-top: 0.375rem;
                              padding-bottom: 0.375rem;
                              width: 100%;
                          `}
                          id="expiration-date"
                          onInput={(e) =>
                            setExpirationDate(e.currentTarget.value)
                          }
                          type="date"
                          value={expirationDate()}
                        />
                        <As
                          as="label"
                          css={css`
                              color: rgb(17, 24, 39);
                              display: block;
                              font-size: 0.875rem;
                              font-weight: 500;
                              leading: 1.5rem;
                          `}
                          for="expiration-time"
                        >
                          Expiration Time
                        </As>
                        <As
                          as="input"
                          css={css`
                              border-radius: 0.375rem;
                              border-width: 0;
                              box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
                              box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.5);
                              color: rgb(17, 24, 39);
                              display: block;
                              font-size: 0.875rem;
                              leading: 1.5rem;
                              padding-top: 0.375rem;
                              padding-bottom: 0.375rem;
                              width: 100%;
                          `}
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
                        <As
                          as="label"
                          css={css`
                              line-height: 1.25rem;
                              color: rgb(17, 24, 39);
                              display: block;
                              font-size: 0.875rem;
                              font-weight: 500;
                              leading: 1.5rem;
                          `}
                          for="submission-limit"
                        >
                          Submission Limit
                        </As>
                        <As
                          as="input"
                          css={css`
                              border-radius: 0.375rem;
                              border-width: 0;
                              box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
                              box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.5);
                              color: rgb(17, 24, 39);
                              display: block;
                              font-size: 0.875rem;
                              leading: 1.5rem;
                              padding-top: 0.375rem;
                              padding-bottom: 0.375rem;
                              width: 100%;
                          `}
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
                        <As
                          as="label"
                          css={css`
                              line-height: 1.25rem;
                              color: rgb(17, 24, 39);
                              display: block;
                              font-size: 0.875rem;
                              font-weight: 500;
                              leading: 1.5rem;
                          `}
                          for="warning-message"
                        >
                          Warning Message
                        </As>
                        <As
                          as="input"
                          css={css`
                              border-radius: 0.375rem;
                              border-width: 0;
                              box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
                              box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.5);
                              color: rgb(17, 24, 39);
                              display: block;
                              font-size: 0.875rem;
                              leading: 1.5rem;
                              padding-top: 0.375rem;
                              padding-bottom: 0.375rem;
                              width: 100%;
                          `}
                          id="warning-message"
                          onInput={(e) =>
                            setWarningMessage(e.currentTarget.value)
                          }
                          type="text"
                          value={warningMessage()}
                        />
                      </div>
                    </Show>
                  </As>
                );
              }}
            </For>
          </As>
        </As>
      </As>

      <As
        as="div"
        css={css`
            display: flex;
            column-gap: 1.5rem;
            margin-top: 1.5rem;
        `}
      >
        <As
          as="button"
          css={css`
              color: rgb(17, 24, 39);
              font-size: 0.875rem;
              font-weight: 600;
              leading: 1.5rem;
          `}
          type="button"
        >
          Cancel
        </As>
        <As
          as="button"
          css={css`
              background-color: rgb(79, 70, 229);
              background-color: rgb(99, 102, 241);
              border-radius: 0.375rem;
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
              color: rgb(255, 255, 255);
              font-size: 0.875rem;
              font-weight: 600;
              leading: 1.5rem;
              padding-left: 0.75rem;
              padding-right: 0.75rem;
              padding-top: 0.5rem;
              padding-bottom: 0.5rem;
          `}
          type="button"
        >
          Submit
        </As>
      </As>
    </>
  );
}

function createVertexIds() {
  return {
    expirationTime: `expirationTimeVertex${createUniqueId()}`,
    // eslint-disable-next-line perfectionist/sort-objects
    expirationDate: `expirationDateVertex${createUniqueId()}`,
    formStatus: `formStatusVertex${createUniqueId()}`,
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
  const vertices: (Omit<Vertex, "IN" | "L" | "OUT"> & {
    attributes?: FieldAttribute[];
  })[] = [
    {
      id: vertexIds.formStatus,
      P: {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "TextInput",
        displayName: "Page Status",
        key: "formStatus",
      },
    },
    {
      id: vertexIds.expirationDate,
      P: {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "DatePicker",
        displayName: "Expiration Date",
        key: "expirationDate",
      },
    },
    {
      id: vertexIds.expirationTime,
      P: {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "TimePicker",
        displayName: "Expiration Time",
        key: "expirationTime",
      },
    },
    {
      id: vertexIds.submissionLimit,
      P: {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "TextInput",
        displayName: "Submission Limit",
        key: "submissionLimit",
      },
    },
    {
      id: vertexIds.warningMessage,
      P: {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "TextInput",
        displayName: "Warning Message",
        key: "warningMessage",
      },
    },
  ];
  for (const vertex of vertices) {
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
  }
}
