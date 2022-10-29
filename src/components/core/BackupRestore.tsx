import { createEffect, createSignal, JSX, Show } from "solid-js";
import {
 backupToIndexDB,
 backupToJson,
 graph,
 resetDatabase,
 restoreFromIndexDB,
 restoreFromJson
} from "../../lib/graph";
import { GraphView } from "ok_web_components";

function fileDownloader(opt: {
 data: string | ArrayBuffer | ArrayBufferView | Blob,
 filename: string,
 title: string,
 mime?: string,
 bom?: string
}) {
 const throwError = function(name) {
  throw new Error("No " + name + " provided to generate-download-link.");
 };

 const data = opt.data || throwError("data");
 const title = opt.title || throwError("title");
 const filename = opt.filename || throwError("filename");

 const anchor = document.createElement("a");
 anchor.style.display = "none";
 const blobData = (typeof opt.bom !== "undefined") ? [opt.bom, data] : [data];
 const blob = new Blob(blobData, { type: opt.mime || "application/octet-stream" });
 const blobURL = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);

 const attachDataAsOctetStream = function(data) {
  // const link = 'data:application/octet-stream,' + encodeURIComponent(data);
  // anchor.setAttribute('href', link);
  anchor.href = blobURL;
 };

 const setFilename = function(filename) {
  anchor.setAttribute("download", filename);
 };

 const setTitle = function(title) {
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
 setTimeout(function() {
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(blobURL);
 }, 200);
}


export const BackupRestore = () => {

 const downloadJson = () => {
  const json = backupToJson();
  fileDownloader({
   data: JSON.stringify(json),
   title: "Download Json",
   filename: "graph.json"
  });
 };
 const backupToIndexDB_ = () => {
  backupToIndexDB().then(() => alert("graph is stored in indexDB"));
 };
 const restoreFromFile: JSX.EventHandlerUnion<HTMLInputElement, Event> = (e) => {
  const file = (e.target as HTMLInputElement).files[0];

  if (file) {
   file.text().then(json => {
    restoreFromJson(JSON.parse(json));
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


 // @ts-ignore
 return <div>
  <div class="flex flex:wrap gap:0.25rem">
   <ui5-card class="w:24rem">
    <ui5-card-header slot="header" title-text="Backup" interactive
                     subtitle-text="Backup in memory graph to different targets"></ui5-card-header>
    <div class="m:1rem flex gap:0.5rem">
     <ui5-button design="Default" onclick={backupToIndexDB_}>Backup To IndexDB
     </ui5-button>
     <ui5-button design="Default" onclick={downloadJson}>Download Json
     </ui5-button>
    </div>

   </ui5-card>

   <ui5-card class="w:24rem">
    <ui5-card-header slot="header" title-text="Restore" interactive
                     subtitle-text="Restore graph from different targets to the memory"></ui5-card-header>
    <div class="m:1rem flex flex-wrap gap:0.5rem">
     <ui5-button design="Default" onclick={restoreFromIndexDB}>Restore From
      IndexDB
     </ui5-button>
     <ui5-file-uploader accept="image/*" multiple="true" hide-input>
      <ui5-button icon="upload" onchange={restoreFromFile}>
       <span>Restore From JSON</span>
      </ui5-button>
     </ui5-file-uploader>
    </div>
   </ui5-card>

   <ui5-card class="w:24rem">
    <ui5-card-header slot="header" title-text="Graph Functions" interactive
                     subtitle-text="Other graph functions"></ui5-card-header>
    <div class="m:1rem flex flex:wrap gap:0.5rem">
     <ui5-button design="Default" onclick={resetDatabase}>Clear in memory
      store
     </ui5-button>
    </div>
   </ui5-card>
  </div>
  <Show when={load()}>
   <GraphView
    edges={Object.entries(graph.edges).map(([key, value]) => ({ ...value }))}
    nodes={Object.entries(graph.vertexes).map(([key, value]) => ({
     ...value,
     label: value.labels[0]
    }))} />
  </Show>
 </div>;
};