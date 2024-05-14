import { useNavigate, useParams } from "@solidjs/router";
import { createSignal, Show, useContext } from "solid-js";

import { IFormContext } from "~/lib/Utils";
// Comment This Lines in web build
import { createStore } from "solid-js/store";
import { stringify } from "yaml";
import {
 AbstractSingleForm
} from "~/components/dynamic/components/DynamicForm";
import { importRecordWithYAMLSchema } from "~/lib/graph/mutate/import";
import { GraphContext } from "~/lib/graph/graph";
import CustomButton from "~/components/solid-blocks/blocks/button/buttons";
import { getExportCode } from "~/lib/graph/get/sync/graph_functions";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";

/*
TODO:
Instead of this use Page Builder
 */
export const NavDesigner = () => {
  const params = useParams();
  const [graph, setGraph] = useContext(GraphContext)!;
  const config = createStore({} as { formData: IFormContext });
  const [count, setCount] = createSignal(1);
  const [previewCode, setPreviewCode] = createSignal(false);
  const { Ws } = useContext(WsContext);
  const navigate = useNavigate();
  const rerender = () => {
    setCount((prev) => prev + 1);
  };
  const PreviewCode = () => {
    return (
      <pre>
        {stringify(
          getExportCode(
            graph,
            config[0].formData.formMeta,
            config[0].formData.formData,
          ),
        )}
      </pre>
    );
  };

  const [importCode, setImportCode] = createSignal("");

  const importCodeFn = () => {
    importRecordWithYAMLSchema(
      config[0].formData.txnId,
      config[0].formData.formMeta,
      config[0].formData.formData,
      importCode(),
      graph,
      setGraph,
      Ws,
    );
  };
  return (
    <div class="flex">
      <div class="border:1|solid|blue-60 p:10 m:5">
        <AbstractSingleForm
          formId={"Nav"}
          graph={graph}
          setGraph={setGraph}
          id={params.id}
          config={config}
          // TODO: add dry option
        />
        <textarea
          value={importCode()}
          onChange={(e) => setImportCode(e.target.value)}
        />
        <CustomButton variant="contained" onClick={importCodeFn}>
          Import Code
        </CustomButton>
      </div>

      <div class="border:1|solid|blue-60 p:10 m:5 min-w:300">
        <button type={"button"} onClick={rerender}>
          Run
        </button>
        <button
          type={"button"}
          onClick={(_) => setPreviewCode((prev) => !prev)}
        >
          Preview
        </button>
        <br />
        <Show when={previewCode()}>
          <PreviewCode />
        </Show>
        <Show when={count() && config[0].formData.formData && count()} keyed>
          <div
          // ref={(el) => renderNavTreeFromGraph(el, config[0].record, navigate)}
          ></div>
        </Show>
      </div>
    </div>
  );
};
