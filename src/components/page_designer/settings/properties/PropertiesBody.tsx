import { createEffect, createMemo, createSignal, For, Match, on, Show, Switch } from "solid-js";
import { MonacoEditor } from 'solid-monaco';

import { JsonEditorField } from "~/components/fields/JsonEditorField";
import { setPropertyValueGlobal } from "~/components/page_designer/functions/setPropertyValueGlobal";
import { PROPERTIES } from "~/components/styled/constants/constant";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { replaceVertexProperties } from "~/lib/graph/mutate/vertex";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { CollAndData } from "./CollAndData";
import { FormGroupProperties } from "./formgroup/FormGroupProperties";
import { evalExpression } from "~/lib/expression_eval";


import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
// import onigasm from 'onigasm/lib/onigasm.wasm?url';

window.MonacoEnvironment = {
  getWorker(_moduleId: unknown, label: string) {
    switch (label) {
      case 'css':
        return new cssWorker();
      case 'json':
        return new jsonWorker();
      case 'typescript':
      case 'javascript':
        return new tsWorker();
      default:
        return new editorWorker();
    }
  },
  // onigasm,
};

export function PropertiesBody() {
  const [graph, setGraph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const clearFileSelection = (meta: Vertex) => {
    const txnId = formStoreVertex()?.P.txnId;
    if (!txnId) {
      return;
    }

    setSelectionValue(
      txnId,
      graph.vertexes[formStoreVertex()?.P.selectedId],
      graph,
      setGraph,
      meta,
    );
  };

  const setPropertyValue = (meta: Vertex, value: any) => {
    if (formStoreVertex()?.P.selectedId !== -1 && formStoreVertex()?.P.selectedComponent !== -1) {
      setPropertyValueGlobal(
        graph,
        setGraph,
        formStoreVertex()?.P.txnId,
        meta,
        graph.vertexes[formStoreVertex()?.P.selectedId],
        graph.vertexes[formStoreVertex()?.P.selectedComponent],
        value,
      );
      if (value === null) {
        clearFileSelection(meta);
      }
    }
  };

  const selectedComponentProperties = () => {
    const selectedComp = graph.vertexes[formStoreVertex()?.P.selectedComponent];
    if (!selectedComp) {
      return { error: true };
    }
    return getSelectionOptions(graph, setGraph, "->$0Prop", [selectedComp]);
  };

  return (
    <Show
      when={
        formStoreVertex()?.P.selectedId !== -1 && graph.vertexes[formStoreVertex()?.P.selectedId]
      }
    >
      {/* <div class="flex gap:2 jc:start"> */}
      {/* <button onClick={toggleImportsModal}>Import HTML</button> */}
      {/* </div> */}
      <Show when={graph.vertexes[formStoreVertex()?.P.selectedComponent].P.key === "Repeater"}>
        <CollAndData />
      </Show>
      <JsonEditorFieldComponent />
      <FunctionEditor setPropertyValue={setPropertyValue} />
      <Show when={graph.vertexes[formStoreVertex()?.P.selectedComponent].L[0] === "Component"}>
        <ComponentVariantsInput setPropertyValue={setPropertyValue} />
      </Show>
      <FormGroupProperties
        metaAttributes={selectedComponentProperties().vertexes ?? []}
        onChange={setPropertyValue}
        selectedLayout={graph.vertexes[formStoreVertex()?.P.selectedId]}
        txnId={formStoreVertex()?.P.txnId}
      />
    </Show>
  );
}

function ComponentVariantsInput(props: { setPropertyValue: (meta: Vertex, value: any) => void }) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const variants = createMemo(() => {
    const selectedComp = graph.vertexes[formStoreVertex()?.P.selectedComponent];
    if (!selectedComp) return [];
    return evalExpression("->$0Variant", { graph, setGraph, vertexes: [selectedComp] }) as Vertex[];
  });

  // createEffect(() => {
  //   if (variants().length === 0) {
  //     // Fetch variants data if not already loaded
  //     fetchComponentData([graph.vertexes[formStoreVertex()?.P.selectedComponent]], graph, setGraph);
  //   }
  // });
  return (
    <div class="">
      <For each={variants()}>
        {(variant) => {
          const options = createMemo(() => {
            return evalExpression("->$0Option", {
              graph,
              setGraph,
              vertexes: [variant]
            }) as Vertex[];
          });
          return (
            <div class="flex ai:center gap:2 justify-content:space-between mt:6">
              <span class="f:15 flex:.5">{variant.P.label || variant.P.key}</span>
              <div class="flex f:15 flex:1 gap:1px">
                <Switch>
                  <Match when={options()}>
                    <select
                      class={`${PROPERTIES.Css.TextField} flex-1 px:2 py:1 border rounded`}
                      value={graph.vertexes[formStoreVertex()?.P.selectedId].P[variant.P.key] || ""}
                      onChange={(e) => props.setPropertyValue(variant, e.currentTarget.value)}
                    >
                      <option value="">Select...</option>
                      <For each={options()}>
                        {(option) => (
                          <option value={option.P.value}>{option.P.key}</option>
                        )}
                      </For>
                    </select>
                  </Match>
                  <Match when={variant.P.type?.toLowerCase() === "boolean"}>
                    <input
                      type="checkbox"
                      class={`${PROPERTIES.Css.TextField} flex-1 px:2 py:1 border rounded`}
                      checked={graph.vertexes[formStoreVertex()?.P.selectedId].P[variant.P.key] || false}
                      onChange={(e) => props.setPropertyValue(variant, e.currentTarget.checked)}
                    />
                  </Match>
                  <Match when={variant.P.type?.toLowerCase() === "number" || variant.P.type?.toLowerCase() === "date"}>
                    <input
                      type={variant.P.type?.toLowerCase()}
                      class={`${PROPERTIES.Css.TextField} flex-1 px:2 py:1 border rounded`}
                      value={graph.vertexes[formStoreVertex()?.P.selectedId].P[variant.P.key] || ""}
                      onChange={(e) => props.setPropertyValue(variant,
                        variant.P.type?.toLowerCase() === "number" ? Number(e.currentTarget.value) : e.currentTarget.value
                      )}
                    />
                  </Match>
                  <Match when={true}>
                    <input
                      type="text"
                      class={`${PROPERTIES.Css.TextField} flex-1 px:2 py:1 border rounded`}
                      value={graph.vertexes[formStoreVertex()?.P.selectedId].P[variant.P.key] || ""}
                      onChange={(e) => props.setPropertyValue(variant, e.currentTarget.value)}
                    />
                  </Match>
                </Switch>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
}

function JsonEditorFieldComponent() {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const [isJsonValid, setIsJsonValid] = createSignal(true);

  const replacePropertyValue = (value: any) => {
    if (formStoreVertex()?.P.selectedId !== -1 && formStoreVertex()?.P.selectedComponent !== -1) {
      try {
        const parsedValue = JSON.parse(value);
        replaceVertexProperties(
          formStoreVertex()?.P.txnId,
          graph.vertexes[formStoreVertex()?.P.selectedId].id,
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
      () => formStoreVertex()?.P.selectedComponent,
      () => {
        if (formStoreVertex()?.P.selectedComponent !== -1) {
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
          value={JSON.stringify(graph.vertexes[formStoreVertex()?.P.selectedId].P, null, 2)}
          onChange={(e) => replacePropertyValue(e.currentTarget.value)}
          class={`${PROPERTIES.Css.TextField} ${!isJsonValid() ? 'b:red-50' : ''}`}
          style={{ height: "200px" }}
        /> */}
      <JsonEditorField
        json={graph.vertexes[formStoreVertex()?.P.selectedId].P}
        onChange={replacePropertyValue}
      />
      {!isJsonValid() && <span class="fg:red-50">Invalid JSON</span>}
    </label>
  );
}

function FunctionEditor(props: { setPropertyValue: (meta: Vertex, value: any) => void }) {
  const [graph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const [isFunctionValid, setIsFunctionValid] = createSignal(true);
  const getOtherProps = () => graph.vertexes[formStoreVertex()?.P.selectedId].P.otherProps ?? "";
  const [editorValue, setEditorValue] = createSignal(getOtherProps());

  createEffect(
    on(
      () => formStoreVertex()?.P.selectedId,
      () => {
        if (formStoreVertex()?.P.selectedId !== -1) {
          setIsFunctionValid(true);
          setEditorValue(getOtherProps());
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

  const handleSave = () => {
    evaluateOtherProps(editorValue());
  };

  return (
    <label class="mt:5">
      Other Props (JavaScript Function)
      <MonacoEditor
        class={`${PROPERTIES.Css.TextField} ${isFunctionValid() ? "" : "b:red-50"}`}
        language="javascript"
        onChange={(value) => setEditorValue(value)}
        height="200px"
        onMount={(ref, a) => console.log(ref, a)}
        options={{
          minimap: { enabled: false },
          lineNumbers: "off",
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 0,
        }}
        value={editorValue()}
      />
      <button 
        class="mt:2 px:3 py:1 bg:blue-60 fg:white r:1" 
        onClick={handleSave}
      >
        Save
      </button>
      {!isFunctionValid() && <span class="fg:red-50">Invalid Function</span>}
    </label>
  );
}
