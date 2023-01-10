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
   <div class="w:24rem">
    <div slot="header" title-text="Backup"
                     subtitle-text="Backup in memory graph to different targets"></div>
    <div class="m:1rem flex gap:0.5rem">
     <button type="button" onclick={backupToIndexDB_}>Backup To IndexDB
     </button>
     <button type="button" onclick={downloadJson}>Download Json
     </button>
    </div>

   </div>

   <div class="w:24rem">
    <div slot="header" title-text="Restore"
                     subtitle-text="Restore graph from different targets to the memory"></div>
    <div class="m:1rem flex flex-wrap gap:0.5rem">
     <button type="button" onclick={restoreFromIndexDB}>Restore From
      IndexDB
     </button>
     <input type="file" accept="image/*" multiple hide-input>
      <button data-icon="upload" onchange={restoreFromFile}>
       <span>Restore From JSON</span>
      </button>
     </input>
    </div>
   </div>

   <div class="w:24rem">
    <div slot="header" title-text="Graph Functions"
                     subtitle-text="Other graph functions"></div>
    <div class="m:1rem flex flex:wrap gap:0.5rem">
     <button type="button" onclick={resetDatabase}>Clear in memory
      store
     </button>
    </div>
   </div>
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