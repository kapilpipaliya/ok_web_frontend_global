import { For } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";

import { PageLayoutObject, useDesignerLayoutStore } from "../../context/LayoutContext";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { FormStoreObject } from "~/components/form/context/FormContext";

export const ResizeViewButtons = (props: { formStoreId: string, openIndex: number }) => {
  const [graph, setGraph] = useGraph();
  const formStoreVertex = () => graph.vertexes[props.formStoreId!] as Vertex<FormStoreObject>;
  const views = [
    { icon: true, key: "prime:mobile", value: "Mobile" },
    { icon: true, key: "uil:tablet", value: "Tablet" },
    { icon: true, key: "humbleicons:desktop", value: "Desktop" },
  ];
  return (
    <div>
      <For each={views}>
        {(view, index) => (
          <IconButton
            class="b:1px|solid|lightgrey color:rgb(17,24,39) cursor:default f:0.875rem font-weight:600 px:0.75rem py:0.5rem"
            classList={{
              "bg:#E0E7F3": view.value === formStoreVertex()?.P.openedViews[props.openIndex].view,
              "bl:none": index() !== 0,
              "color:#5252F1": view.value === formStoreVertex()?.P.openedViews[props.openIndex].view,
              "color:grey": view.value !== formStoreVertex()?.P.openedViews[props.openIndex].view,
              "r:0|5|5|0": index() === 2,
              "r:5|0|0|5": index() === 0,
            }}
            icon={view.key}
            onclick={() => {
              const updatedOpenedViews = [...formStoreVertex()?.P.openedViews];
              updatedOpenedViews[props.openIndex] = { view: view.value, id: updatedOpenedViews[props.openIndex].id };
              mergeVertexProperties<FormStoreObject>(0, props.formStoreId!, graph, setGraph, { openedViews: updatedOpenedViews });
            }}
            size={22}
            title={view.value}
          />
        )}
      </For>
    </div>
  );
};
