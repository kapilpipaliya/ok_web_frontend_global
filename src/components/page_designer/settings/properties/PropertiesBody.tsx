import { Show, createSignal } from "solid-js";

import { setPropertyValueGlobal } from "~/components/page_designer/functions/setPropertyValueGlobal";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { CollAndData } from "./CollAndData";
import { FormGroupProperties } from "./formgroup/FormGroupProperties";
import { replaceVertexProperties } from "~/lib/graph/mutate/vertex";
import { PROPERTIES } from "~/components/constants/constant";

export function PropertiesBody() {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  const [isJsonValid, setIsJsonValid] = createSignal(true);
  const [isFunctionValid, setIsFunctionValid] = createSignal(true);

  const setPropertyValue = (meta: Vertex, value: any) => {
    if (layoutStore.selectedId !== -1 && layoutStore.selectedComponent !== -1) {
      return setPropertyValueGlobal(  
        graph,
        setGraph,
        layoutStore.formStore[0].txnId,
        meta,
        graph.vertexes[layoutStore.selectedId],
        graph.vertexes[layoutStore.selectedComponent],
        value,
      );
    }
  };
  const replacePropertyValue = (value: any) => {
    if (layoutStore.selectedId !== -1 && layoutStore.selectedComponent !== -1) {
      try {
        const parsedValue = JSON.parse(value);
        replaceVertexProperties(layoutStore.formStore[0].txnId, graph.vertexes[layoutStore.selectedId].id, graph, setGraph, parsedValue);
        setIsJsonValid(true);
      } catch (error) {
        console.error("Error parsing value:", error);
        setIsJsonValid(false);
      }
    }
  };

  const evaluateOtherProps = (value: string) => {
    setPropertyValue({P: {key: "otherProps"}} as unknown as Vertex, value);
    try {
      if (!value) {
        setIsFunctionValid(true);
        return;
      }
      const func = new Function('args', `${value}`);
      if (typeof func === 'function') {
        const result = func({});
        if (typeof result === 'object') {
          setIsFunctionValid(true);
          // Do something with the result if needed
        } else {
          throw new Error("Function did not return an object");
        }
      } else {
        throw new Error("Input is not a function");
      }
    } catch (error) {
      console.error("Error evaluating function:", error);
      setIsFunctionValid(false);
    }
  };

  const selectedComponentProperties = () => {
    const selectedComp = graph.vertexes[layoutStore.selectedComponent];
    if (!selectedComp) {
      return { error: true };
    }
    return getSelectionOptions(graph, setGraph, "->$0Prop", [selectedComp]);
  };

  return (
    <Show when={layoutStore.selectedId !== -1}>
      <div class="flex gap:2 jc:start">
        {/* <button onClick={toggleImportsModal}>Import HTML</button> */}
      </div>
      <CollAndData />
      <label class="mt:5">
        Properties JSON
        <textarea
          placeholder="Enter value here"
          value={JSON.stringify(graph.vertexes[layoutStore.selectedId].P, null, 2)}
          onChange={(e) => replacePropertyValue(e.currentTarget.value)}
          class={`${PROPERTIES.Css.TextField} ${!isJsonValid() ? 'b:red-50' : ''}`}
          style={{ height: "200px" }}
        />
        {!isJsonValid() && <span class="fg:red-50">Invalid JSON</span>}
      </label>
      <label class="mt:5">
        Other Props (JavaScript Function)
        <textarea
          placeholder="Enter JavaScript function here"
          value={graph.vertexes[layoutStore.selectedId].P.otherProps ?? ""}
          onChange={(e) => evaluateOtherProps(e.currentTarget.value)}
          class={`${PROPERTIES.Css.TextField} ${!isFunctionValid() ? 'b:red-50' : ''}`}
          style={{ height: "200px" }}
        />
        {!isFunctionValid() && <span class="fg:red-50">Invalid Function</span>}
      </label>
      <FormGroupProperties
        metaAttributes={selectedComponentProperties().vertexes ?? []}
        onChange={setPropertyValue}
        selectedLayout={graph.vertexes[layoutStore.selectedId]}
        txnId={layoutStore.formStore[0].txnId}
      />
    </Show>
  );
}
