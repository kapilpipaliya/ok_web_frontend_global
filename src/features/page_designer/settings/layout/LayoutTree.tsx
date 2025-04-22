import { Icon } from "@iconify-icon/solid";
import { createSignal, For, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Id, Vertex } from "~/lib/graph/graph";

import { useGraph } from "~/lib/graph/GraphContext";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

import {
  useDesignerFormIdContext,
} from "../../context/LayoutContext";
import { LayoutTreeItem } from "./LayoutTreeItem";

export function LayoutTree() {
  const [graph, setGraph] = useGraph();
  const [collapsedKeys, setCollapsedKeys] = createSignal([] as Id[]);

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  function toggleExpand(itemId: Id) {
    setCollapsedKeys((prev) =>
      prev.includes(itemId)
        ? prev.filter((item) => item !== itemId)
        : [...prev, itemId],
    );
  }

  // const steps = createMemo<Vertex[]>(() =>
  //   getChildrenAttrs(graph, setGraph, layoutStore.formData?.formData)
  // );

  // const isFormRootVertetx = () =>
  //   layoutStore.formData?.formData?.L?.[0] === "Form";

  const rootVertexes = () => {
    // if (isFormRootVertetx()) {
    //   if (layoutStore.activeStepId && graph.vertexes[layoutStore.activeStepId]) {
    //     return [graph.vertexes[layoutStore.activeStepId]];
    //   }
    //   return steps()[0]
    //     ? [steps()[0]]
    //     : [];
    // }

    return formStoreVertex()?.P.formDataId
      ? graph.vertexes[formStoreVertex()?.P.formDataId!]
        ? [graph.vertexes[formStoreVertex()?.P.formDataId!]]
        : []
      : [];
  };
  
  const toggleAllJsonEditors = () => {
    mergeVertexProperties<FormStoreObject>(
      0,
      formStoreId!,
      graph,
      setGraph,
      {
        showAllJsonEditors: !(formStoreVertex()?.P.showAllJsonEditors ?? false)
      }
    );
  };

  const jsonOpacity = () => (formStoreVertex()?.P.showAllJsonEditors ?? false) ? "1" : "0.6";
  const jsonTooltip = () => (formStoreVertex()?.P.showAllJsonEditors ?? false) 
    ? "Hide all JSON editors" 
    : "Show all JSON editors";

  return (
    <As
      as="div"
      css={css`
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      `}
    >
      <As
        as="div"
        css={css`
          display: flex;
          align-items: center;
          padding: 8px 8px;
          border-bottom: 1px solid #e5e5e5;
          gap: 8px;
          background-color: white;
        `}
      >
        <As
          as="span"
          title={jsonTooltip()}
          css={css`
            cursor: pointer;
            margin-left: 4px;
            opacity: ${jsonOpacity()};
            display: flex;
            align-items: center;
            gap: 4px;
          `}
          onClick={toggleAllJsonEditors}
        >
          <Icon 
            icon="tabler:json" 
            height={18} 
            width={18} 
          />
        </As>
      </As>
      <As
        as="div"
        css={css`
          padding: 0;
          margin: 0;
          overflow-y: auto;
          flex: 1;
        `}
      >
        <Show when={formStoreVertex()}>
          <For each={rootVertexes()}>
            {(vertex) => (
              <LayoutTreeItem
                collapsedKeys={collapsedKeys}
                metaVertex={vertex}
                toggleExpand={toggleExpand}
              />
            )}
          </For>
        </Show>
      </As>
    </As>
  );
}
