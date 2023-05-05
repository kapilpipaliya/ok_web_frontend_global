import { createEffect, createSignal, Show } from "solid-js";
import {
  backupToIndexDB,
  backupToJson,
  graph,
  resetDatabase,
  restoreFromIndexDB,
  restoreFromJson
} from "../lib/graph";
import { GraphView } from "../components/GraphView";
import { Link } from "@solidjs/router";

function fileDownloader(opt: {
  data: string | ArrayBuffer | ArrayBufferView | Blob;
  filename: string;
  title: string;
  mime?: string;
  bom?: string;
}) {
  const throwError = function (name: string) {
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
  return (
   <div>
     <div class="mb:1.5rem mt:10 m:6">
       <div
        class="grid-cols:2 grid-cols:3@xs grid-cols:3@sm grid-cols:3@md grid-cols:3@lg grid-cols:3@xl gap:10 w:full text:center">

         <div
          class="bg:#fff box-shadow:1|1|7|#ddd r:5 height:4rem flex flex:column jc:space-evenly ai:center cursor:pointer">
           <div slot="header" title-text="Backup" subtitle-text="Backup in memory graph to different targets"></div>
           <div class="m:1rem flex gap:0.5rem">
             <button type="button" onclick={backupToIndexDB_}>
               Backup To IndexDB
             </button>
             <button type="button" onclick={downloadJson}>
               Download Json
             </button>
           </div>

         </div>

         <div
          class="bg:#fff box-shadow:1|1|7|#ddd r:5 height:4rem flex flex:column jc:space-evenly ai:center cursor:pointer">
           <div slot="header" title-text="Restore" subtitle-text="Restore graph from different targets to the memory"></div>
           <div class="m:1rem flex flex-wrap gap:0.5rem">
             <button type="button" onclick={restoreFromIndexDB}>
               Restore From IndexDB
             </button>
             <input ref={fileInputRef!} type="file" accept="image/*" multiple
                    style="display: hidden"></input>
             <button type="button" onClick={restoreFromFile}>
               <span>Restore From JSON</span>
             </button>
           </div>
         </div>


         <div
          class="bg:#fff box-shadow:1|1|7|#ddd r:5 height:4rem flex flex:column jc:space-evenly ai:center cursor:pointer">
           <div slot="header" title-text="Graph Functions" subtitle-text="Other graph functions"></div>
           <div class="m:1rem flex flex:wrap gap:0.5rem">
             <button type="button" onclick={resetDatabase}>
               Clear in memory store
             </button>
           </div>


         </div>

         <div class="bg:#fff box-shadow:1|1|7|#ddd r:5 height:4rem flex flex:column jc:space-evenly ai:center cursor:pointer">
           <div class="">
             <div slot="header" title-text="Graph Functions"
                  subtitle-text="Simple Import"></div>
             <div class="m:1rem flex flex:wrap gap:0.5rem">
               <Link href="/SimpleImport">Simple Import</Link>
             </div>
           </div>
         </div>

         <div class="bg:#fff box-shadow:1|1|7|#ddd r:5 height:4rem flex flex:column jc:space-evenly ai:center cursor:pointer">
           <div class="">
             <div slot="header" title-text="Graph Functions"
                  subtitle-text="Simple Import"></div>
             <div class="m:1rem flex flex:wrap gap:0.5rem">
               <input ref={componentPropsInputRef!} type="file" accept="json"
                      style="display: hidden"></input>
               <button type="button" onClick={restoreFromFile}>
                 <span>Restore From JSON</span>
               </button>
             </div>
           </div>
         </div>

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
     <div ref={el=> {
       console.log(OxPropertyEditor)
       const inst = new OxPropertyEditor(el)
       debugger
     }}></div>
    </div>
  );
};
