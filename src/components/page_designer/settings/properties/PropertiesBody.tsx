import { createEffect, createSignal, on, Show } from "solid-js";
import { MonacoEditor } from 'solid-monaco';

import { JsonEditorField } from "~/components/fields/JsonEditorField";
import { setPropertyValueGlobal } from "~/components/page_designer/functions/setPropertyValueGlobal";
import { PROPERTIES } from "~/components/styled/constants/constant";

import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { replaceVertexProperties } from "~/lib/graph/mutate/vertex";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { CustomModal } from "~/components/styled/CustomModal";
import { IconButton } from "~/components/styled/IconButton";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { CollAndData } from "./CollAndData";
import { FormGroupProperties } from "./formgroup/FormGroupProperties";
import { evalExpression } from "~/lib/expression_eval";


import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import { ComponentVariantsInput } from "./ComponentVariantsInput";
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
  const selectedAttr = () => graph.vertexes[formStoreVertex()?.P.selectedId];
  const selectedComp = () => evalExpression("->$0Comp", {
    graph,
    setGraph,
    vertexes: [selectedAttr()],
  })?.[0];
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
    if (formStoreVertex()?.P.selectedId !== -1) {
      setPropertyValueGlobal(
        graph,
        setGraph,
        formStoreVertex()?.P.txnId,
        meta,
        graph.vertexes[formStoreVertex()?.P.selectedId],
        value,
      );
      if (value === null) {
        clearFileSelection(meta);
      }
    }
  };

  const selectedComponentProperties = () => {
    const compVertex = selectedComp();
    if (!compVertex) {
      return [];
    }
    return evalExpression("->$0Prop", {
      graph,
      setGraph,
      vertexes: [compVertex],
    });
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
      <Show when={selectedAttr()?.P.componentName === "Repeater"}>
        <CollAndData />
      </Show>
      <JsonEditorFieldComponent />
      <FunctionEditor setPropertyValue={setPropertyValue} />
      <Show when={selectedAttr()?.P.componentName === "Component"}>
        <ComponentVariantsInput setPropertyValue={setPropertyValue} compVertex={selectedComp()} dataVertex={graph.vertexes[formStoreVertex()?.P.selectedId]}/>
      </Show>
      <FormGroupProperties
        metaAttributes={selectedComponentProperties() ?? []}
        onChange={setPropertyValue}
        selectedLayout={graph.vertexes[formStoreVertex()?.P.selectedId]}
        txnId={formStoreVertex()?.P.txnId}
      />
    </Show>
  );
}

function JsonEditorFieldComponent() {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const [isJsonValid, setIsJsonValid] = createSignal(true);

  const replacePropertyValue = (value: any) => {
    if (formStoreVertex()?.P.selectedId !== -1) {
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
      () => formStoreVertex()?.P.selectedId,
      () => {
        if (formStoreVertex()?.P.selectedId !== -1) {
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
  const [isModalOpen, setIsModalOpen] = createSignal(false);

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

      if (!value.includes('return {')) {
        throw new Error("Function must return an object");
      }

      setIsFunctionValid(true);
      props.setPropertyValue(
        { P: { key: "otherProps" } } as unknown as Vertex,
        value,
      );

      /* Original validation code:
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
      */

    } catch (error) {
      console.error("Error evaluating function:", error);
      setIsFunctionValid(false);
    }
  };

  const handleSave = () => {
    evaluateOtherProps(editorValue());
    if (isFunctionValid()) {
      setIsModalOpen(false);
    }
  };

  const EditorContent = (props: { height?: string }) => (
    <>
      <MonacoEditor
        class={`${PROPERTIES.Css.TextField} ${isFunctionValid() ? "" : "b:red-50"}`}
        language="javascript"
        onChange={(value) => setEditorValue(value)}
        height={props.height ?? "200px"}
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
        Submit
      </button>
      {!isFunctionValid() && <span class="fg:red-50">Invalid Function</span>}
    </>
  );

  return (
    <>
      <div class="mt:5">
        <span class="flex ai:center">Other Props (JavaScript Function)
          <IconButton
            icon="ph:arrow-square-out"
            class="ml:6"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            title="Edit Function in Modal"
          />
        </span>
        <EditorContent height="200px" />
      </div>
      <CustomModal open={isModalOpen} setOpen={setIsModalOpen} title="Edit Other Props" >
        <div class="p:3 width:600px height:600px">
          <EditorContent height="560px" />
        </div>
      </CustomModal>
    </>
  );
}
