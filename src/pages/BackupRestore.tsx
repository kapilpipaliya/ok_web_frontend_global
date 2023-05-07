import { createEffect, createSignal, Show, useContext } from "solid-js";
import {
  backupToIndexDB,
  backupToJson, commitTxn, getNewTxnId,
  graph,
  resetDatabase,
  restoreFromIndexDB,
  restoreFromJson, Vertex
} from "../lib/graph";
import { GraphView } from "../components/GraphView";
import { Link } from "@solidjs/router";
import { Card } from "../components/uikit_components/Card/Card";
import { CardHeader } from "../components/uikit_components/Card/CardHeader";
import { CardTitle } from "../components/uikit_components/Card/CardTitle";
import { CardBody } from "../components/uikit_components/Card/CardBody";
import {
  findVertexByLabelAndUniqueId,
  findVertexByLabelAndUniqueIdWithSkip, replaceVertexProperties
} from "../lib/Vertex";
import { newRow } from "../components/input/TableInputField";
import { setSelectionValue } from "../components/input/SelectInputField";
import { WsContext } from "../components/ws_events_dispatcher";

function fileDownloader(opt: {
  data: string | ArrayBuffer | ArrayBufferView | Blob;
  filename: string;
  title: string;
  mime?: string;
  bom?: string;
}) {
  const throwError = function(name: string) {
    throw new Error("No " + name + " provided to generate-download-link.");
  };

  const data = opt.data || throwError("data");
  const title = opt.title || throwError("title");
  const filename = opt.filename || throwError("filename");

  const anchor = document.createElement("a");
  anchor.style.display = "none";
  const blobData = typeof opt.bom !== "undefined" ? [opt.bom, data] : [data];
  const blob = new Blob(blobData, {
    type: opt.mime || "application/octet-stream",
  });
  const blobURL =
    window.URL && window.URL.createObjectURL
      ? window.URL.createObjectURL(blob)
      : window.webkitURL.createObjectURL(blob);

  const attachDataAsOctetStream = function (data: any) {
    // const link = 'data:application/octet-stream,' + encodeURIComponent(data);
    // anchor.setAttribute('href', link);
    anchor.href = blobURL;
  };

  const setFilename = function (filename: string) {
    anchor.setAttribute("download", filename);
  };

  const setTitle = function (title: string) {
    anchor.appendChild(document.createTextNode(title));
  };

  // Safari thinks _blank anchor are pop ups. We only want to set _blank
  // target if the browser does not support the HTML5 download attribute.
  // This allows you to download files in desktop safari if pop up blocking
  // is enabled.
  if (typeof anchor.download === "undefined") {
    anchor.setAttribute("target", "_blank");
  }

  attachDataAsOctetStream(data);
  setFilename(filename);
  setTitle(title);

  document.body.appendChild(anchor);
  anchor.click();

  // Fixes "webkit blob resource error 1"
  setTimeout(function () {
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(blobURL);
  }, 200);
}

export const BackupRestore = () => {
  const { Ws } = useContext(WsContext);
  let fileInputRef: HTMLInputElement;
  let componentPropsInputRef: HTMLInputElement;
  const downloadJson = () => {
    const json = backupToJson();
    fileDownloader({
      data: JSON.stringify(json),
      title: "Download Json",
      filename: "graph.json",
    });
  };
  const backupToIndexDB_ = () => {
    backupToIndexDB().then(() => alert("graph is stored in indexDB"));
  };
  const restoreFromFile = () => {
    const file = fileInputRef!.files![0];

    if (file) {
      file.text().then((json) => {
        restoreFromJson(JSON.parse(json));
      });
    }
  };
  const importComponentProps = () => {
    const file = componentPropsInputRef!.files![0];

    if (file) {
      file.text().then((jsonText) => {
        const json = JSON.parse(jsonText);
        // const s = new Set();
        const keys = {};
        for (const componentId in json) {
          const component = json[componentId];
          const componentConfiguration = component["Configuration"];
          if (!componentConfiguration) continue;


          for (const property in componentConfiguration) {
            const propertyObj = componentConfiguration[property];
            const name = propertyObj["Name"];
            let type = propertyObj["Type"];
            const default_ = propertyObj["Default"];
            const readOnly = propertyObj["ReadOnly"];
            const acceptedValues = propertyObj["AcceptedValues"];
            // s.add(type);
            if (type) {
              let dataType;
              type = type.split(" | ").filter(t => !t.includes("function")).filter(t => ["false", "null", "AnimationConfig", "dxCalendar_Options", "UserDefinedElement", "template", "any", "undefined", "Store", "DataSource", "DataSource_Options", "dxFilterBuilder_Options", "Format", "DxPromise",
                "dxSortable_Options", "dxTextBox_Options", "dxPopup_Options", "dxPopover_Options", "PivotGridDataSource", "getter", 'Filter expression']);
              if (!type.length) continue;
              if (type.some(t => t.includes("Array"))) {
                dataType = "List";
              } else if (type.some(t => t.includes("PositionConfig"))) {
                dataType = "Map";
              } else if (type.length > 1) {
                console.log('skipped multiple result type', propertyObj);
              } else {
                dataType = type[0];
                if (dataType === 'Number') {
                  dataType = 'Float';
                } else if (dataType === 'object' || dataType === 'Object' || dataType === 'Group' || dataType === 'PositionConfig') {
                  dataType = "Map";
                }
              }
              if (dataType) {
                const vertex = findVertexByLabelAndUniqueId('Comp', 'id', `${componentId}Field`);
                if (vertex) {

                  // const dataTypeVertex = findVertexByLabelAndUniqueId('DataType', 'id', dataType);
                  // if (!dataTypeVertex) {
                  //   console.log('dataType not found', dataType);
                  //   continue;
                  // }
                  // const txnId = getNewTxnId();
                  // const rowResult = newRow(txnId, vertex, 'CompProp');
                  // replaceVertexProperties(txnId, rowResult.vertexId!, {key: name});
                  // setSelectionValue(txnId, graph.vertexes[rowResult.vertexId!], {properties: {id: 'DataType'}} as Vertex, dataTypeVertex.id);
                  // // It takes too much time to commit the full transaction.
                  // commitTxn(txnId, Ws);
                }
              }
            }
          }
        }
        debugger
      });
    }
  };
  // Hack to remount the component
  const [load, setLoad] = createSignal(false);
  createEffect(() => {
    if (graph.vertexes && graph.edges) {
      setLoad(false);
      setTimeout(() => setLoad(true), 0);
      console.log("reloading");
    }
  });
  const C = (props: { title: string, subtitle: string, children: JSX.Element }) => {
    return <Card>
      <CardHeader class="p:10">
        <CardTitle class="uk-margin-remove-bottom">
          {props.title}
        </CardTitle>
        <span>{props.subtitle}</span>
      </CardHeader>
      <CardBody class="m:0 p:12">
        {props.children}
      </CardBody>
    </Card>;
  };

  // @ts-ignore
  return (
   <>
     <div class="mb:1.5rem mt:10 m:6">
       <div
        class="grid-cols:2 grid-cols:3@xs grid-cols:3@sm grid-cols:3@md grid-cols:3@lg grid-cols:3@xl gap:10 w:full text:center">
         <C title={"Backup"}
            subtitle={"Backup in memory graph to different targets"}>
           <CardBody class="m:0 p:12">
             <div class="m:1rem flex gap:0.5rem">
               <button type="button" onclick={backupToIndexDB_}>
                 Backup To IndexDB
               </button>
               <button type="button" onclick={downloadJson}>
                 Download Json
               </button>
             </div>
           </CardBody>
         </C>
         <C title={"Restore"}
            subtitle={"Restore graph from different targets to the memory"}>
           <CardBody class="m:0 p:12">
             <button type="button" onclick={restoreFromIndexDB}>
               Restore From IndexDB
             </button>
             <input ref={fileInputRef!} type="file" accept="image/*" multiple
                    style="display: hidden"></input>
             <button type="button" onClick={restoreFromFile}>
               <span>Restore From JSON</span>
             </button>
           </CardBody>
         </C>
         <C title={"Graph Functions"} subtitle={"Other graph functions"}>
           <CardBody class="m:0 p:12">
             <div class="m:1rem flex gap:0.5rem">
               <button type="button" onclick={resetDatabase}>
                 Clear in memory store
               </button>
             </div>
           </CardBody>
         </C>
         <C title={"Graph Functions"} subtitle={"Simple Import"}>
           <CardBody class="m:0 p:12">
             <div class="m:1rem flex gap:0.5rem">
               <Link href="/SimpleImport">Simple Import</Link>
             </div>
           </CardBody>
         </C>
         <C title={"Graph Functions"} subtitle={"Simple Import"}>
           <CardBody class="m:0 p:12">
             <div class="m:1rem flex gap:0.5rem">
               <input ref={componentPropsInputRef!} type="file" accept="json"
                      style="display: hidden"></input>
               <button type="button" onClick={importComponentProps}>
                 <span>Restore From JSON</span>
               </button>
             </div>
           </CardBody>
         </C>
       </div>
      </div>

      <Show when={load()}>
        <GraphView
          edges={Object.entries(graph.edges)
            .filter(([_, edge]) => edge.type !== "MetaAttr")
            .map(([key, value]) => ({ ...value }))}
          nodes={Object.entries(graph.vertexes)
            .filter(([_, vertex]) => vertex.labels[0] !== "MetaAttr")
            .map(([key, value]) => ({
              ...value,
              label: value.labels[0],
            }))}
        />
      </Show>
   </>
  );
};
