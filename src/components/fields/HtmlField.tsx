import {
  type JSX,
  Match,
  Show,
  splitProps,
  Switch,
  createMemo,
  For,
  createUniqueId,
  type Component,
  useContext,
} from "solid-js";
import { Dynamic, Portal } from "solid-js/web";
import { untrack } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { Link, Meta, Title, Base, Style, useHead } from "@solidjs/meta";
import { createAsync, query } from "@solidjs/router";

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
import { SolidMarkdown } from "~/components/solid-markdown";
import remarkGfm from "remark-gfm";
import { SlotContext } from "~/components/fields/component/contexts/SlotContext";

// Dedupe + hydration-safe server function execution. A single logical call
// runs once — even across SSR + client hydration, component remounts (e.g. when
// a page layout resolves and the field re-mounts), and a page's leave
// transition (so the outgoing page never refetches).
//
// The cache key is intentionally ONLY the processed function body + its context
// — never the source vertex. `query` subscribes `createAsync` to the entry's
// version signal, so navigation re-runs the (still-mounted, leaving) field's
// resource; if the key included the vertex, that re-run would compute a new key
// (the vertex changes as the page tears down / graph streams in), miss the
// cache and refetch. Keying on the stable body means the re-run hits the same
// live entry and returns the cached result instead. Server functions here do
// not read `_.vertexes`, so omitting them is safe; a changed dynamic route
// param is baked into the body, so it still yields a new key and a fresh call.
// `query` also scopes its cache per-request on the server (no cross-request
// leakage).
const executeServerFunctionQuery = query(
  (payload: {
    functionBody: string;
    contextData: unknown;
  }): Promise<ServerResult> =>
    executeServerFunction(
      { functionBody: payload.functionBody, contextData: payload.contextData },
      { nodes: {}, relationships: {}, vertexes: [] },
    ),
  "htmlFieldServerFunction",
);

const MetaTag = (
  tag: string,
  props: { [k: string]: any },
  setting?: { escape?: boolean; close?: boolean },
) => {
  useHead({
    tag,
    props,
    setting,
    id: createUniqueId(),
    get name() {
      return props.name || props.property;
    },
  });

  return null;
};

export const Script: Component<JSX.ScriptHTMLAttributes<HTMLScriptElement>> = (
  props,
) => MetaTag("script", props, { close: true });

// Component that untracks props and re-renders based on key
const UntrackedMetaTag: Component<{
  tag: "base" | "link" | "meta" | "script" | "style" | "title";
  props: any;
  children?: any;
}> = (componentProps) => {
  // Create a key from the props to force re-render when props change
  // Track componentProps.props, but untrack during JSON.stringify to avoid deep reactivity issues
  const propsKey = createMemo(() => {
    const props = componentProps.props; // This is tracked
    return untrack(() => JSON.stringify(props)); // This is not tracked
  });

  return (
    <Show when={propsKey()} keyed>
      {(key) => {
        // Parse the key back to get untracked props snapshot
        // This ensures we have a completely non-reactive copy
        const untrackedProps = JSON.parse(key);

        return (
          <Switch>
            <Match when={componentProps.tag === "base"}>
              <Base {...untrackedProps} />
            </Match>
            <Match when={componentProps.tag === "link"}>
              <Link {...untrackedProps} />
            </Match>
            <Match when={componentProps.tag === "meta"}>
              <Meta {...untrackedProps} />
            </Match>
            <Match when={componentProps.tag === "script"}>
              <Script {...untrackedProps}>{componentProps.children}</Script>
            </Match>
            <Match when={componentProps.tag === "style"}>
              <Style {...untrackedProps}>{componentProps.children}</Style>
            </Match>
            <Match when={componentProps.tag === "title"}>
              <Title {...untrackedProps}>{componentProps.children}</Title>
            </Match>
          </Switch>
        );
      }}
    </Show>
  );
};

export function replacePlaceholderWithUrl(
  value: string,
  edgeName: string,
  data: Vertex,
  graph: GraphInterface,
): string {
  if (!value) return "";
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
// Helper function to parse serverFunction and extract accessed properties and function calls
function parseContextAccess(functionBody: string): {
  properties: string[];
  functionCalls: Array<{ match: string; property: string }>;
} {
  const properties: string[] = [];
  const functionCalls: Array<{ match: string; property: string }> = [];

  // Context bag access: c.x or _.contextData.x
  // Match function calls like c.propertyName() / _.contextData.propertyName()
  const functionRegex =
    /\bc\.(\w+)\(\)|\bc\[['"]([^'"]+)['"]\]\(\)|_\.contextData\.(\w+)\(\)|_\.contextData\[['"]([^'"]+)['"]\]\(\)/g;

  let match;
  while ((match = functionRegex.exec(functionBody)) !== null) {
    const property = match[1] || match[2] || match[3] || match[4];
    if (property) {
      functionCalls.push({
        match: match[0],
        property,
      });
    }
  }

  // Match property access (non-function). Use `\b(?!\()` so names like
  // `legacy()` are not partially captured as `legac` via `\w+` backtracking.
  // 1. c.propertyName / _.contextData.propertyName
  // 2. c['propertyName'] / _.contextData['propertyName']
  const propertyRegex =
    /\bc\.(\w+)\b(?!\()|\bc\[['"]([^'"]+)['"]\](?!\()|_\.contextData\.(\w+)\b(?!\()|_\.contextData\[['"]([^'"]+)['"]\](?!\()/g;

  while ((match = propertyRegex.exec(functionBody)) !== null) {
    const property = match[1] || match[2] || match[3] || match[4];
    if (property && !properties.includes(property)) {
      properties.push(property);
    }
  }

  return { properties, functionCalls };
}

// Helper function to create a new context object from the proxy and process function body
function createContextObject(
  contextData: any,
  functionBody: string,
): { context: any; processedFunctionBody: string } {
  // Parse the function to find properties and function calls
  const { properties, functionCalls } = parseContextAccess(functionBody);

  // Create a new object with only the accessed properties
  const newContext: any = {};

  for (const prop of properties) {
    newContext[prop] = contextData[prop];
  }

  // Process function calls and replace them with their values
  let processedFunctionBody = functionBody;

  for (const { match, property } of functionCalls) {
    if (typeof contextData[property] === "function") {
      try {
        const result = contextData[property]();
        // Replace the function call with its result (properly stringified)
        processedFunctionBody = processedFunctionBody.replace(
          match,
          JSON.stringify(result),
        );
      } catch (error) {
        console.error(`Error calling contextData.${property}():`, error);
        // If function call fails, leave it as is
      }
    }
  }

  return { context: newContext, processedFunctionBody };
}

export function HtmlField(
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    as?: string;
    childrenBefore?: boolean;
    class?: string;
    longPressDuration?: number;
    onLongPress?: (event: Event) => void;
    src?: string;
    text?: string;
    textType?: string; // "markdown" or undefined
    // DataField props
    data?: (() => unknown[]) | unknown[];
    expression?: string;
    loop?: boolean;
    contextName?: string;
    // Server function props
    serverFunction?: string; // Function body as string
    renderChildren?: boolean;
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
    "textType",
    "childrenBefore",
    // DataField props
    "data",
    "expression",
    "loop",
    "contextName",
    // Server function props
    "serverFunction",
  ]);

  const asLowerCase = createMemo(() => local.as?.toLowerCase());

  // Markdown renders block elements (<div>, <p>); wrapping in <p> is invalid HTML
  // and breaks SSR hydration. Use a block wrapper instead.
  const wrapperComponent = createMemo(() => {
    const as = local.as?.toLowerCase();
    if (local.textType === "markdown" && (as === "p" || as === "span")) {
      return "div";
    }
    return local.as || "div";
  });

  const DataField = () => {
    // Check if local.data is an async function
    const isAsyncDataFunction = () => {
      return (
        typeof local.data === "function" &&
        local.data.constructor.name === "AsyncFunction"
      );
    };

    // DataField logic - Fetch data if expression is provided and no static data
    const selectionOptionsData = createAsync<ServerResult>(
      async () => {
        // If local.data is an async function, call it and wrap result
        if (isAsyncDataFunction()) {
          try {
            const result = await (local.data as () => Promise<unknown[]>)();
            return {
              success: true,
              result: result,
            } as ServerResult;
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : String(error),
            } as ServerResult;
          }
        }

        if (!(local.expression || local.serverFunction) || local.data) {
          // Return empty result when no fetch is needed
          return {
            success: true,
          } as ServerResult;
        }

        // If serverFunction is provided, execute it. The call is keyed only by
        // its body + context (see executeServerFunctionQuery) so it runs once
        // and never refetches on navigation.
        if (local.serverFunction) {
          const { context, processedFunctionBody } = createContextObject(
            contextData,
            local.serverFunction,
          );
          return executeServerFunctionQuery({
            functionBody: processedFunctionBody,
            contextData: context,
          });
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
        // If static data is provided (not async function), use it directly
        if (local.data && !isAsyncDataFunction()) {
          return {
            options:
              typeof local.data === "function" ? local.data() : local.data,
            error: null,
          };
        }

        // If no expression, server function, or async data, return empty
        if (
          !(local.expression || local.serverFunction || isAsyncDataFunction())
        ) {
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

          // For async data function or server function, use the result directly
          if (
            (isAsyncDataFunction() || local.serverFunction) &&
            fetchedData.result !== undefined
          ) {
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

      const loopOptions = () =>
        Array.isArray(processedData().options) ? processedData().options : [];

      return (
        <Switch>
          <Match when={processedData().error}>
            <As
              as="div"
              css={`return \` ._id {
                  background-color: \${t.var.color.error};
                  color: \${t.var.color.error_text};
              }

                  \`;`}
            >
              {processedData().error}
            </As>
          </Match>
          <Match when={Array.isArray(processedData().options) && local.loop}>
            <For each={loopOptions()}>
              {(value, index) => {
                return (
                  <DataInternal
                    data={data()}
                    index={index()}
                    meta={meta()!}
                    contextName={local.contextName!}
                    repeaterValue={value}
                  />
                );
              }}
            </For>
          </Match>
          <Match
            when={
              processedData().options &&
              local.contextName &&
              props.renderChildren
            }
          >
            <DataInternal
              data={data()}
              index={0}
              meta={meta()!}
              contextName={local.contextName!}
              repeaterValue={processedData().options}
              children={local.children}
              renderChildren
            />
          </Match>
          <Match when={processedData().options && local.contextName}>
            <DataInternal
              data={data()}
              index={0}
              meta={meta()!}
              contextName={local.contextName!}
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
        <Show when={local.textType === "markdown"} fallback={local.text}>
          <SolidMarkdown remarkPlugins={[remarkGfm]}>
            {local.text}
          </SolidMarkdown>
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
        <UntrackedMetaTag tag="base" props={others} />
      </Match>

      <Match when={asLowerCase() === "link"}>
        <UntrackedMetaTag tag="link" props={others} />
      </Match>

      <Match when={asLowerCase() === "meta"}>
        <UntrackedMetaTag tag="meta" props={others} />
      </Match>

      <Match when={asLowerCase() === "style"}>
        <UntrackedMetaTag tag="style" props={{}}>
          {local.text}
        </UntrackedMetaTag>
      </Match>

      <Match when={asLowerCase() === "title"}>
        <UntrackedMetaTag tag="title" props={{}}>
          {local.text}
        </UntrackedMetaTag>
      </Match>

      <Match when={asLowerCase() === "script"}>
        <UntrackedMetaTag tag="script" props={others}>
          {local.text}
        </UntrackedMetaTag>
      </Match>

      <Match when={asLowerCase() === "portal"}>
        <Portal {...others}>
          <Content />
        </Portal>
      </Match>
      <Match when={asLowerCase() === "slot"}>
        <Content />
      </Match>
      <Match when={!local.as || asLowerCase() === "fragment"}>
        <Content />
      </Match>
      <Match when={true}>
        <Dynamic
          class={`${local.class || ""}`}
          component={wrapperComponent()}
          {...others}
        >
          <Content />
        </Dynamic>
      </Match>
    </Switch>
  );
}
