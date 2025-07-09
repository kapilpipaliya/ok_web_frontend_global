import {
  type JSX,
  Match,
  Show,
  splitProps,
  Switch,
  createMemo,
  For,
} from "solid-js";
import { Dynamic, Portal } from "solid-js/web";
import { untrack } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { Link, Meta, Title, Base, Style } from "@solidjs/meta";
import { createAsync } from "@solidjs/router";

import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import {
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { usePreviewContext } from "~/features/page_designer/context/PreviewContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";

import type { FormStoreObject } from "../form/context/FormContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { evalExpression } from "~/lib/expression_eval";
import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import type { ServerResult } from "~/cypher/types/ServerResult";
import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { executeServerFunction } from "~/cypher/get/executeServerFunction";
import { useDataContext } from "~/features/page_attr_render/context/DataContext";
import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { DataInternal } from "./data/DataInternal";
import { As } from "~/components/As";

export function replacePlaceholderWithUrl(
  value: string,
  edgeName: string,
  data: Vertex,
  graph: GraphInterface,
): string {
  if (!value.includes("$1")) {
    return value;
  }

  const files =
    evalExpression(`->${edgeName}`, {
      graph,
      setGraph: () => {},
      vertexes: [data],
    }) || [];

  if (files.length === 0) {
    return value;
  }

  const file = files[0];
  return value.replaceAll("$1", getDownloadLink(file));
}

// HtmlField
export function HtmlField(
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    as?: string;
    childrenBefore?: boolean;
    class?: string;
    longPressDuration?: number;
    onLongPress?: (event: Event) => void;
    src?: string;
    text?: string;
    // DataField props
    data?: (() => unknown[]) | unknown[];
    expression?: string;
    loop?: boolean;
    name?: string;
    // Server function props
    serverFunction?: string; // Function body as string
  },
) {
  const [graph, setGraph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta;
  const data = () => parentRenderContext()?.context.data;
  const contextData = useDataContext() || {};
  const layoutStoreId = useDesignerLayoutStore();
  const formStoreId = useDesignerFormIdContext();
  const [previewStore] = usePreviewContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const [local, others] = splitProps(props, [
    "as",
    "class",
    "children",
    "text",
    "childrenBefore",
    // DataField props
    "data",
    "expression",
    "loop",
    "name",
    // Server function props
    "serverFunction",
  ]);

  const asLowerCase = createMemo(() => local.as?.toLowerCase());

  const DataField = () => {
    // DataField logic - Fetch data if expression is provided and no static data
    const selectionOptionsData = createAsync<ServerResult>(
      async () => {
        if ((!local.expression && !local.serverFunction) || local.data) {
          // Return empty result when no fetch is needed
          return {
            success: true,
          } as ServerResult;
        }

        // If serverFunction is provided, execute it
        if (local.serverFunction) {
          return executeServerFunction(
            {
              functionBody: local.serverFunction,
              contextData: contextData,
            },
            {
              nodes: {},
              relationships: {},
              vertexes: data() ? [data()!] : [],
            },
          );
        }

        // Otherwise, use expression-based fetch
        return fetchDataFromDB(
          { expression: local.expression },
          {
            nodes: {},
            relationships: {},
            vertexes: [data()!],
          },
        );
      },
      { deferStream: true },
    );

    const DataFieldInternal = () => {
      // Process the data based on props and fetched results
      const processedData = createMemo(() => {
        // If static data is provided, use it directly
        if (local.data) {
          return {
            options:
              typeof local.data === "function" ? local.data() : local.data,
            error: null,
          };
        }

        // If no expression or server function, return empty
        if (!local.expression && !local.serverFunction) {
          return { options: [], error: null };
        }

        const fetchedData = selectionOptionsData();

        // Still loading
        if (fetchedData === undefined) {
          return { options: [], error: null };
        }

        // Process fetched data
        if (isValidResponse(fetchedData)) {
          // Update graph data if present
          if (fetchedData.graph) {
            setGraphData(graph, setGraph, fetchedData.graph, {
              skipExisting: true,
            });
          }

          // For server function, use the result directly
          if (local.serverFunction && fetchedData.result !== undefined) {
            return { options: fetchedData.result, error: null };
          }

          // For expression, evaluate it
          if (local.expression) {
            const evaluatedData =
              evalExpression(local.expression, {
                graph,
                setGraph,
                vertexes: contextData || [],
              }) || [];

            return { options: evaluatedData, error: null };
          }
        }

        // Error case
        return {
          options: [],
          error: getErrorMessage(fetchedData),
        };
      });

      return (
        <Switch>
          <Match when={processedData().error}>
            <As
              as="div"
              css={`return \` ._id {
                  background-color: \${args.theme.var.color.error};
                  color: \${args.theme.var.color.error_text};
              }

                  \`;`}
            >
              {processedData().error}
            </As>
          </Match>
          <Match when={Array.isArray(processedData().options) && local.loop}>
            <For each={processedData().options}>
              {(value, index) => {
                return (
                  <DataInternal
                    data={data()}
                    index={index()}
                    meta={meta()!}
                    name={local.name!}
                    repeaterValue={value}
                  />
                );
              }}
            </For>
          </Match>
          <Match when={processedData().options && local.name}>
            <DataInternal
              data={data()}
              index={0}
              meta={meta()!}
              name={local.name!}
              repeaterValue={processedData().options}
            />
          </Match>
        </Switch>
      );
    };
    return (
      <Show when={selectionOptionsData()}>
        <DataFieldInternal />
      </Show>
    );
  };

  const handleTextChange = (e: Event) => {
    if (!layoutStoreId) {
      return;
    }

    const target = e.target as HTMLSpanElement;
    const txnId = formStoreVertex()?.P.txnId;
    const metaVertex = meta();
    if (
      formStoreVertex()?.P.selectedId !== -1 &&
      target.textContent !== local.text &&
      txnId &&
      metaVertex
    ) {
      untrack(() => {
        mergeVertexProperties(txnId, metaVertex.id, graph, setGraph, {
          text: target.textContent,
        });
      });
      saveUndoPoint(txnId, graph, setGraph);
    }
  };
  const handleKeyDown = (e: KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey &&
      !e.metaKey
    ) {
      e.preventDefault();
      handleTextChange(e);
      // manually update the text, if changed
      if (local.text !== (e.target as HTMLElement).textContent) {
        (e.target as HTMLElement).textContent = local.text ?? "";
      }
    }
  };

  const Content = () => {
    const TextContent = () => {
      return (
        <Show when={props.text}>
          <Show
            fallback={<span>{local.text}</span>}
            when={previewStore.isDesignMode}
          >
            <span
              contentEditable={true}
              onBlur={handleTextChange}
              onKeyDown={handleKeyDown}
              style={{ display: "inline-block", "min-width": "1em" }}
            >
              {local.text}
            </span>
          </Show>
        </Show>
      );
    };

    // note: text property will not work when using the data field
    return (
      <Switch>
        <Match when={local.expression || local.data || local.serverFunction}>
          <DataField />
        </Match>
        <Match when={true}>
          <Show when={local.childrenBefore}>{local.children}</Show>
          <TextContent />
          <Show when={!local.childrenBefore}>{local.children}</Show>
        </Match>
      </Switch>
    );
  };

  return (
    <Switch>
      <Match when={!local.as || asLowerCase() === "fragment"}>
        <Content />
      </Match>
      <Match when={asLowerCase() === "img"}>
        <img
          class={`${local.class || ""}`}
          loading="lazy"
          {...(others as JSX.ImgHTMLAttributes<HTMLImageElement>)}
          src={replacePlaceholderWithUrl(
            others.src ?? "",
            "$0Src",
            meta(),
            graph,
          )}
        />
      </Match>
      <Match when={asLowerCase() === "icon"}>
        {/* @ts-expect-error - icon wiil be in others */}
        <Icon class={`${local.class || ""}`} noobserver {...others} />
      </Match>
      <Match when={asLowerCase() === "base"}>
        <Base {...others} />
      </Match>

      <Match when={asLowerCase() === "link"}>
        <Link {...others} />
      </Match>

      <Match when={asLowerCase() === "meta"}>
        <Meta {...others} />
      </Match>

      <Match when={asLowerCase() === "style"}>
        <Style>{local.text}</Style>
      </Match>

      <Match when={asLowerCase() === "title"}>
        <Title>{local.text}</Title>
      </Match>
      <Match when={asLowerCase() === "portal"}>
        <Portal {...others}>
          <Content />
        </Portal>
      </Match>
      <Match when={true}>
        <Dynamic
          class={`${local.class || ""}`}
          component={local.as || "div"}
          {...others}
        >
          <Content />
        </Dynamic>
      </Match>
    </Switch>
  );
}
