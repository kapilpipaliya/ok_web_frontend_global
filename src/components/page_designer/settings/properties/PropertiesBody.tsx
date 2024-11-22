import { createEffect, createSignal, on, Show } from "solid-js";

import { JsonEditorField } from "~/components/fields/JsonEditorField";
import { setPropertyValueGlobal } from "~/components/page_designer/functions/setPropertyValueGlobal";
import { PROPERTIES } from "~/components/styled/constants/constant";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { replaceVertexProperties } from "~/lib/graph/mutate/vertex";

import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { CollAndData } from "./CollAndData";
import { FormGroupProperties } from "./formgroup/FormGroupProperties";

export function PropertiesBody() {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();

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

  const selectedComponentProperties = () => {
    const selectedComp = graph.vertexes[layoutStore.selectedComponent];
    if (!selectedComp) {
      return { error: true };
    }
    return getSelectionOptions(graph, setGraph, "->$0Prop", [selectedComp]);
  };

  return (
    <Show
      when={
        layoutStore.selectedId !== -1 && graph.vertexes[layoutStore.selectedId]
      }
    >
      {/* <div class="flex gap:2 jc:start"> */}
        {/* <button onClick={toggleImportsModal}>Import HTML</button> */}
      {/* </div> */}
      <Show when={graph.vertexes[layoutStore.selectedComponent].P.key === "Repeater"}>
        <CollAndData />
      </Show>
      <JsonEditorFieldComponent />
      <FunctionEditor setPropertyValue={setPropertyValue} />
      <FormGroupProperties
        metaAttributes={selectedComponentProperties().vertexes ?? []}
        onChange={setPropertyValue}
        selectedLayout={graph.vertexes[layoutStore.selectedId]}
        txnId={layoutStore.formStore[0].txnId}
      />
    </Show>
  );
}

function JsonEditorFieldComponent() {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  const [isJsonValid, setIsJsonValid] = createSignal(true);

  const replacePropertyValue = (value: any) => {
    if (layoutStore.selectedId !== -1 && layoutStore.selectedComponent !== -1) {
      try {
        const parsedValue = JSON.parse(value);
        replaceVertexProperties(
          layoutStore.formStore[0].txnId,
          graph.vertexes[layoutStore.selectedId].id,
          graph,
          setGraph,
          parsedValue,
        );
        setIsJsonValid(true);
      } catch (error) {
        console.error("Error parsing value:", error);
        setIsJsonValid(false);
      }
    }
  };
    createEffect(
    on(
      () => layoutStore.selectedComponent,
      () => {
        if (layoutStore.selectedComponent !== -1) {
          setIsJsonValid(true);
        }
      },
      { defer: true },
    ),
  );

  return (
    <label class="mt:5">
      Properties JSON
      {/* <textarea
          placeholder="Enter value here"
          value={JSON.stringify(graph.vertexes[layoutStore.selectedId].P, null, 2)}
          onChange={(e) => replacePropertyValue(e.currentTarget.value)}
          class={`${PROPERTIES.Css.TextField} ${!isJsonValid() ? 'b:red-50' : ''}`}
          style={{ height: "200px" }}
        /> */}
      <JsonEditorField
        json={graph.vertexes[layoutStore.selectedId].P}
        onChange={replacePropertyValue}
      />
      {!isJsonValid() && <span class="fg:red-50">Invalid JSON</span>}
    </label>
  );
}

function FunctionEditor(props: { setPropertyValue: (meta: Vertex, value: any) => void }) {
  const [graph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  const [isFunctionValid, setIsFunctionValid] = createSignal(true);

  createEffect(
    on(
      () => layoutStore.selectedComponent,
      () => {
        if (layoutStore.selectedComponent !== -1) {
          setIsFunctionValid(true);
        }
      },
      { defer: true },
    ),
  );

  const evaluateOtherProps = (value: string) => {
    try {
      if (!value) {
        setIsFunctionValid(true);
        props.setPropertyValue(
          { P: { key: "otherProps" } } as unknown as Vertex,
          value,
        );
        return;
      }
      const func = new Function("args", `${value}`);
      if (typeof func === "function") {
        const result = func({});
        if (typeof result === "object") {
          setIsFunctionValid(true);
          props.setPropertyValue(
            { P: { key: "otherProps" } } as unknown as Vertex,
            value,
          );
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

  return (
    <label class="mt:5">
      Other Props (JavaScript Function)
      <textarea
        class={`${PROPERTIES.Css.TextField} ${isFunctionValid() ? "" : "b:red-50"}`}
        onChange={(e) => evaluateOtherProps(e.currentTarget.value)}
        placeholder="Enter JavaScript function here"
        style={{ height: "200px" }}
        value={graph.vertexes[layoutStore.selectedId].P.otherProps ?? ""}
      />
      {!isFunctionValid() && <span class="fg:red-50">Invalid Function</span>}
    </label>
  );
}
