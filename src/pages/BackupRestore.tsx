import { createEffect, createSignal, Show, useContext } from "solid-js";
import {
  backupToIndexDB,
  backupToJson,
  commitTxn,
  getNewGraphId,
  getNewTxnId,
  graph, IdAttr,
  resetDatabase,
  restoreFromIndexDB,
  restoreFromJson,
  Vertex
} from "../lib/graph";
import { GraphView } from "../components/GraphView";
import { Link } from "@solidjs/router";
import { Card } from "../components/uikit_components/Card/Card";
import { CardHeader } from "../components/uikit_components/Card/CardHeader";
import { CardTitle } from "../components/uikit_components/Card/CardTitle";
import { CardBody } from "../components/uikit_components/Card/CardBody";
import {
  addNewVertex,
  findVertexByLabelAndUniqueId,
  findVertexByLabelAndUniqueIdWithSkip,
  newVertex,
  replaceVertexProperties,
} from "../lib/Vertex";
import { setSelectionValue } from "../components/input/SelectInputField";
import { WsContext } from "../components/ws_events_dispatcher";
import { getChildVertex, getParentVertex } from "../lib/Traverse";
import { getFormMetaData, getId, newRow, Record } from "../lib/Record";
import { onDataDirectoryImportClick, updateImportRecord } from "../lib/Import";

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
        // const d = new Set();
        // const v = new Set();
        // const da = new Set();
        // const it = new Set();
        const txnId = getNewTxnId();
        for (const componentId in json) {
          const component = json[componentId];
          const componentConfiguration = component["Configuration"];
          if (!componentConfiguration) continue;

          for (const property in componentConfiguration) {
            const propertyObj = componentConfiguration[property];
            const name = propertyObj["Name"];
            let description = propertyObj["description"] as string;
            if (description) {
              description = description.replaceAll(/<a href.*">([\w ]+)<\/a>/g, "$1");
            }
            let type = propertyObj["Type"];
            // if(name === 'displayExpr') d.add(componentId);
            // if(name === 'valueExpr') v.add(componentId);
            // if(name === 'dataSource') da.add(componentId);
            // if(name === 'items') it.add(componentId);
            // continue;
            // Do not specify the items property if you specified the dataSource, and vice versa.
            // if (name === "dataSource") continue;
            const default_ = propertyObj["Default"];
            const readOnly = propertyObj["ReadOnly"];
            const acceptedValues = propertyObj["AcceptedValues"];
            // s.add(type);
            if (type) {
              let dataType;
              type = type
                .split(" | ")
                .filter((t) => !t.includes("function"))
                .filter((t) => ![
                  "false",
                  "null",
                  "AnimationConfig",
                  "dxCalendar_Options",
                  "UserDefinedElement",
                  "template",
                  "any",
                  "undefined",
                  "Store",
                  // "DataSource",
                  "DataSource_Options",
                  "dxFilterBuilder_Options",
                  "Format",
                  "DxPromise",
                  "dxSortable_Options",
                  "dxTextBox_Options",
                  "dxPopup_Options",
                  "dxPopover_Options",
                  "PivotGridDataSource",
                  "getter",
                  "Filter expression",
                ].includes(t));
              if (!type.length) continue;
              if (type.join(',') === "Number,String") {
                dataType = 'String';
              } else if (type.join(',') === "String,Number") {
                dataType = 'Float';
              } else if (type.join(',') === "Date,Number,String") {
                dataType = 'String';
              } else if (type.join(',') === "String,UserDefinedElement") {
                dataType = 'String';
              } else if (type.some((t) => t.includes("Array"))) {
                dataType = "List";
              } else if (type.some((t) => t.includes("DataSource"))) {
                dataType = "List";
              } else if (type.some((t) => t.includes("PositionConfig"))) {
                dataType = "Map";
              } else if (type.join(',') === "Boolean,String") {
                dataType = "Boolean";
              } else if (type.length > 1) {
                console.log("skipped multiple result type", propertyObj);
              } else {
                dataType = type[0];
                if (dataType === "Number") {
                  dataType = "Float";
                } else if (
                  dataType === "object" ||
                  dataType === "Object" ||
                  dataType === "Group" ||
                  dataType === "PositionConfig"
                ) {
                  dataType = "Map";
                }
              }
              if (dataType) {
                const vertex = findVertexByLabelAndUniqueId("Comp", IdAttr, `${componentId}`);
                if (vertex) {
                  const dataTypeVertex = findVertexByLabelAndUniqueId("DataType", IdAttr, dataType);
                  if (!dataTypeVertex) {
                    console.log("dataType not found", dataType);
                    continue;
                  }

                  const rowResult = newRow(txnId, vertex, "CompProp");
                  replaceVertexProperties(txnId, rowResult.vertexId!, { key: name, description: description });
                  setSelectionValue(
                    txnId,
                    graph.vertexes[rowResult.vertexId!],
                    { properties: { [IdAttr]: "DataType" } } as Vertex,
                    dataTypeVertex.id,
                  );
                  // It takes too much time to commit the full transaction.
                }
              } else {
                console.log('dataType Not Found:', name, type);
              }
            }
          }
        }
        commitTxn(txnId, Ws);
        alert("inserting properties finished.");
      });
    }
  };

  const makeASampleForm = () => {
    // get all the fields
    const vertexId = getNewGraphId();
    const txnId = getNewTxnId();
    addNewVertex(txnId, newVertex(vertexId, ["Coll"], { [IdAttr]: "TestForm", title: "Test Form", table: true }));
    const existingVertex = graph.vertexes[vertexId];
    for (const compVertexId of graph.vertexLabelIdMap["Comp"]) {
      const componentVertex = graph.vertexes[compVertexId];
      const componentName = componentVertex.properties[IdAttr];
      if (["DropDownBox", "Bullet", "CircularGauge", "LinearGauge", "ProgressBar"].includes(componentName)) continue;
      const newRow1 = newRow(txnId, existingVertex, "CollAttr");
      replaceVertexProperties(txnId, newRow1.vertexId!, { [IdAttr]: getId(componentName), displayName: componentName});
      const dataType = getParentVertex(["DataType$0"], componentVertex);
      if (!dataType.error) {
        // set component dataType and component
        setSelectionValue(
          txnId,
          graph.vertexes[newRow1.vertexId!],
          { properties: { [IdAttr]: "dataType" } } as Vertex,
          dataType.vertex!.id,
        );
        setSelectionValue(
          txnId,
          graph.vertexes[newRow1.vertexId!],
          { properties: { [IdAttr]: "comp" } } as Vertex,
          compVertexId,
        );
      }
    }
    commitTxn(txnId, Ws);
  };
  const importAllCSV = () => {
    const form = getFormMetaData('Import');
    if(form.error) return form.error;
    const record = new Record({ form: form.form!, ws: Ws });
    const createResult = record.create();
    if (createResult.error) return createResult.error;


    // 1. import dataTypes
    updateImportRecord('dataType', record, false);
    record.mergeFieldValues({
      csv: `name
Null
String
Boolean
Integer
Float
List
Map
Duration
Date
LocalTime
LocalDateTime`,
    });
    onDataDirectoryImportClick(record, Ws);
    // 2. Import components
    updateImportRecord('component', record, false);
    record.mergeFieldValues({
      csv: `name\tdataType\tparent\tcategory
Autocomplete\tString\t\tForm
Calendar\tInteger\t\tForm
CheckBox\tBoolean\t\tForm
ColorBox\tString\t\tForm
DateBox\tDate\t\tForm
DropDownBox\tList\t\tForm
FileUploader\tList\t\tForm
FilterBuilder\tList\t\tForm
HtmlEditor\tString\t\tForm
NumberBox\tFloat\t\tForm
RadioGroup\tList\t\tForm
RangeSelector\t\t\tForm
RangeSlider\t\t\tForm
SelectBox\tList\t\tForm
Slider\tFloat\t\tForm
Switch\tBoolean\t\tForm
TagBox\tList\t\tForm
TextArea\tString\t\tForm
TextBox\tString\t\tForm
Table\t\t\tForm
Bullet\tInteger\t\tView
CircularGauge\tInteger\t\tView
LinearGauge\tFloat\t\tView
ProgressBar\tFloat\t\tView
Int\tInteger\tNumberBox\tCustom
Float\tFloat\tNumberBox\tCustom
DateTimeBox\tLocalDateTime\tDateBox\tCustom`,
    });
    onDataDirectoryImportClick(record, Ws);
    // 3. Import dataTypeDefault
    updateImportRecord('dataTypeDefault', record, false);
    record.mergeFieldValues({
      csv: `name\tdefault
String\tTextBox
Boolean\tCheckBox
Integer\tInt
Float\tFloat
List\tTextArea
Map\tTextArea
Duration\tDateBox
Date\tDateBox
LocalTime\tDateTimeBox
LocalDateTime\tDateBox`,
    });
    onDataDirectoryImportClick(record, Ws);


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
  const C = (props: { title: string; subtitle: string; children: JSX.Element }) => {
    return (
      <Card>
        <CardHeader class="p:10">
          <CardTitle class="uk-margin-remove-bottom">{props.title}</CardTitle>
          <span>{props.subtitle}</span>
        </CardHeader>
        <CardBody class="m:0 p:12">{props.children}</CardBody>
      </Card>
    );
  };

  // @ts-ignore
  return (
    <>
      <div class="mb:1.5rem mt:10 m:6">
        <div class="grid-cols:2 grid-cols:3@xs grid-cols:3@sm grid-cols:3@md grid-cols:3@lg grid-cols:3@xl gap:10 w:full text:center">
          <C title={"Backup"} subtitle={"Backup in memory graph to different targets"}>
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
          <C title={"Restore"} subtitle={"Restore graph from different targets to the memory"}>
            <CardBody class="m:0 p:12">
              <button type="button" onclick={restoreFromIndexDB}>
                Restore From IndexDB
              </button>
              <input ref={fileInputRef!} type="file" accept="image/*" multiple style="display: hidden"></input>
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
                <input ref={componentPropsInputRef!} type="file" accept="json" style="display: hidden"></input>
                <button type="button" onClick={importComponentProps}>
                  <span>Restore From JSON</span>
                </button>
              </div>
            </CardBody>
          </C>
          <C title={"Graph Functions"} subtitle={"Simple Import"}>
            <CardBody class="m:0 p:12">
              <div class="m:1rem flex gap:0.5rem">
                <button type="button" onClick={makeASampleForm}>
                  <span>Make a sample Form</span>
                </button>
              </div>
            </CardBody>
          </C>
          <C title={"Graph Functions"} subtitle={"Import All CSV"}>
            <CardBody class="m:0 p:12">
              <div class="m:1rem flex gap:0.5rem">
                <button type="button" onClick={importAllCSV}>
                  <span>Import all csv</span>
                </button>
              </div>
            </CardBody>
          </C>
        </div>

      </div>

      <Show<boolean> when={load()}>
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
