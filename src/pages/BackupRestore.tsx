import {
  batch,
  createEffect,
  createSignal,
  JSX,
  Show,
  useContext
} from "solid-js";
import {
  backupToIndexDB,
  backupToJson,
  commitTxn,
  getNewGraphId,
  getNewTxnId,
  graph,
  IdAttr,
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
  newVertex,
  replaceVertexProperties
} from "../lib/Vertex";
import { setSelectionValue } from "../components/input/SelectInputField";
import { WsContext } from "../components/ws_events_dispatcher";
import { getParentVertex } from "../lib/Traverse";
import { getFormMetaData, getId, newRow, Record } from "../lib/Record";
import { onDataDirectoryImportClick, updateImportRecord } from "../lib/Import";
import { Field, NsMetaJson, Type } from "../NSMetaData";

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
  let importNSDataInputRef: HTMLInputElement;
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
                    { P: { [IdAttr]: "DataType" } } as Vertex,
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
      const componentName = componentVertex.P[IdAttr];
      if (["DropDownBox", "Bullet", "CircularGauge", "LinearGauge", "ProgressBar"].includes(componentName)) continue;
      const newRow1 = newRow(txnId, existingVertex, "CollAttr");
      replaceVertexProperties(txnId, newRow1.vertexId!, { [IdAttr]: getId(componentName), displayName: componentName});
      const dataType = getParentVertex(["DataType$0"], componentVertex);
      if (!dataType.error) {
        // set component dataType and component
        setSelectionValue(
          txnId,
          graph.vertexes[newRow1.vertexId!],
          { P: { [IdAttr]: "dataType" } } as Vertex,
          dataType.vertex!.id,
        );
        setSelectionValue(
          txnId,
          graph.vertexes[newRow1.vertexId!],
          { P: { [IdAttr]: "comp" } } as Vertex,
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
  const importNSData = () => {
    const file = importNSDataInputRef!.files![0];

    function nsTypeToGraphType(type: Type) {
      let dataType;
      switch (type) {
        case "address": {
          dataType = "Map";
          break;
        }
        case "bigdecimal": {
          dataType = "Float";
          break;
        }
        case "ccexpdate": {
          dataType = "Date";
          break;
        }
        case "ccnumber": {
          dataType = "Float";
          break;
        }
        case "ccvalidfrom": {
          dataType = "Date";
          break;
        }
        case "checkbox": {
          dataType = "Boolean";
          break;
        }
        case "clobtext": {
          dataType = "String";
          break;
        }
        case "currency": {
          dataType = "Float";
          break;
        }
        case "currency2": {
          dataType = "Float";
          break;
        }
        case "date": {
          dataType = "Date";
          break;
        }
        case "datetime": {
          dataType = "LocalDateTime";
          break;
        }
        case "datetimetz": {
          dataType = "LocalDateTime";
          break;
        }
        case "double": {
          dataType = "Float";
          break;
        }
        case "email": {
          dataType = "String";
          break;
        }
        case "emails": {
          dataType = "String";
          break;
        }
        case "file": {
          dataType = "Integer";
          break;
        }
        case "float": {
          dataType = "Float";
          break;
        }
        case "identifier": {
          dataType = "String";
          break;
        }
        case "identifieranycase": {
          dataType = "String";
          break;
        }
        case "image": {
          dataType = "Integer";
          break;
        }
        case "integer": {
          dataType = "Integer";
          break;
        }
        case "label": {
          dataType = "String";
          break;
        }
        case "mmyydate": {
          dataType = "Date";
          break;
        }
        case "multiselect": {
          dataType = "List";
          break;
        }
        case "namevaluelist": {
          dataType = "List";
          break;
        }
        case "nonnegfloat": {
          dataType = "Float";
          break;
        }
        case "password": {
          dataType = "String";
          break;
        }
        case "percent": {
          dataType = "Float";
          break;
        }
        case "period": {
          dataType = "Float";
          break;
        }
        case "phone": {
          dataType = "String";
          break;
        }
        case "poscurrency": {
          dataType = "Float";
          break;
        }
        case "posfloat": {
          dataType = "Float";
          break;
        }
        case "posinteger": {
          dataType = "Integer";
          break;
        }
        case "radio": {
          dataType = "String";
          break;
        }
        case "rate": {
          dataType = "Float";
          break;
        }
        case "ratehighprecision": {
          dataType = "Float";
          break;
        }
        case "richtext": {
          dataType = "String";
          break;
        }
        case "rtext": {
          dataType = "String";
          break;
        }
        case "select": {
          dataType = "Integer";
          break;
        }
        case "ssnumber": {
          dataType = "Float";
          break;
        }
        case "summary": {
          dataType = "String";
          break;
        }
        case "text": {
          dataType = "String";
          break;
        }
        case "textarea": {
          dataType = "String";
          break;
        }
        case "time": {
          dataType = "LocalTime";
          break;
        }
        case "timeofday": {
          dataType = "LocalTime";
          break;
        }
        case "timetrack": {
          dataType = "Duration";
          break;
        }
        case "url": {
          dataType = "String";
          break;
        }
        case "year": {
          dataType = "Integer";
          break;
        }
      }
      return dataType;
    }

    function importNsData_(json: { [p: string]: NsMetaJson }) {
      let txnId = getNewTxnId();
      const splitTransaction = false;

      function fieldsInsert(fields: Field[], collectionVertex: Vertex) {
        for (const field of fields) {
          let description = field.help;
          if (description) {
            description = description.replaceAll(/<a href.*">([\w ]+)<\/a>/g, "$1");
          }
          let type = field.type;
          // s.add(type);
          if (type) {
            let dataType = nsTypeToGraphType(type);

            if (dataType) {
              if (collectionVertex) {
                const dataTypeVertex = findVertexByLabelAndUniqueId("DataType", IdAttr, dataType);
                if (!dataTypeVertex) {
                  console.log("dataType not found", dataType);
                  continue;
                }

                const rowResult = newRow(txnId, collectionVertex, "CollAttr");
                replaceVertexProperties(txnId, rowResult.vertexId!, {
                  name: field.id,
                  displayName: field.label,
                  definition: field.help,
                  required: field.required
                });
                setSelectionValue(
                 txnId,
                 graph.vertexes[rowResult.vertexId!],
                 { P: { [IdAttr]: "DataType" } } as Vertex,
                 dataTypeVertex.id
                );
              }
            } else {
              console.log("dataType Not Found:", name, type);
            }
          }
        }
      }

      for (const collectionId_ in json) {
        const collection = json[collectionId_];
        const fields = collection["fields"];
        if (!fields) continue;
        const label = collection.label;
        const collectionId = collection.id;
        let collectionVertex = findVertexByLabelAndUniqueId("Coll", IdAttr, `${collectionId}`);
        if (!collectionVertex) {
          const id = getNewGraphId();
          const newCollVertex = addNewVertex(txnId, newVertex(id, ["Coll"], {
            name: collectionId,
            title: label,
            supportCustomFields: collection.supportCustomFields,
            searchOnly: collection.searchOnly,
            supportDeletedRecordSearch: collection.supportDeletedRecordSearch
          }));
          if (newCollVertex.error) {
            continue;
          } else {
            collectionVertex = graph.vertexes[id];
          }
        } else {
          // not updating vertex properties.
        }
        fieldsInsert(fields, collectionVertex);
      }
      if (splitTransaction) commitTxn(txnId, Ws);

      if (splitTransaction) txnId = getNewTxnId();
      for (const collectionId_ in json) {
        const collection = json[collectionId_];
        const collectionId = collection.id;
        const sublists = collection["sublists"];
        if (!sublists) continue;
        let collectionVertex = findVertexByLabelAndUniqueId("Coll", IdAttr, `${collectionId}`)!;

        for (const sublist of sublists) {
          const sublistCollName = `${collectionId}${sublist.id}`;
          let collVertex = findVertexByLabelAndUniqueId("Coll", IdAttr, sublistCollName);
          if (!collVertex) {
            const id = getNewGraphId();
            const newCollVertex = addNewVertex(txnId, newVertex(id, ["Coll"], {
              name: sublistCollName,
              title: sublist.label
            }));
            if (newCollVertex.error) {
              continue;
            } else {
              collVertex = graph.vertexes[id];
            }
          } else {
            // not updating vertex properties.
          }
          const fields = sublist["fields"];
          if (fields) {
            fieldsInsert(fields, collVertex);
          }

          const rowResult = newRow(txnId, collectionVertex, "CollChild");
          replaceVertexProperties(txnId, rowResult.vertexId!, {
            displayName: sublist.label,
            name: sublist.id
          });
          setSelectionValue(
           txnId,
           graph.vertexes[rowResult.vertexId!],
           { P: { [IdAttr]: "coll" } } as Vertex,
           collVertex.id
          );


        }
      }
      if (splitTransaction) commitTxn(txnId, Ws);

      if (splitTransaction) txnId = getNewTxnId();
      for (const collectionId_ in json) {
        const collection = json[collectionId_];
        const collectionId = collection.id;
        const tabs = collection["tabs"];
        if (!tabs) continue;
        let collectionVertex = findVertexByLabelAndUniqueId("Coll", IdAttr, `${collectionId}`)!;

        for (const tab of tabs) {
          const rowResult = newRow(txnId, collectionVertex, "CollTab");
          replaceVertexProperties(txnId, rowResult.vertexId!, {
            displayName: tab.label,
            name: tab.name
          });
        }
      }
      if (splitTransaction) commitTxn(txnId, Ws);

      if (splitTransaction) txnId = getNewTxnId();
      for (const collectionId_ in json) {
        const collection = json[collectionId_];
        const collectionId = collection.id;
        const transformTypes = collection["transformTypes"];
        if (!transformTypes) continue;
        let collectionVertex = findVertexByLabelAndUniqueId("Coll", IdAttr, `${collectionId}`)!;

        for (const transformType of transformTypes) {
          const rowResult = newRow(txnId, collectionVertex, "CollTransform");
          replaceVertexProperties(txnId, rowResult.vertexId!, {
            fieldDefaults: transformType.fieldDefaults
          });
          let collVertex = findVertexByLabelAndUniqueId("Coll", IdAttr, transformType.targetRecordType);
          if (!collVertex) {
            console.log("transform collection not found", transformType.targetRecordType);
            continue;
          }
          setSelectionValue(
           txnId,
           graph.vertexes[rowResult.vertexId!],
           { P: { [IdAttr]: "coll" } } as Vertex,
           collVertex.id
          );
        }
      }
      commitTxn(txnId, Ws);


      /*
       transform collection not found vendorBill
       transform collection not found vendorCredit
       transform collection not found vendorPayment
       transform collection not found cashRefund
       transform collection not found cashSale
       transform collection not found creditMemo
       transform collection not found customSale
       2 transform collection not found customPurchase
      */

      // because multiple transactions not working splitting it
      // commitTxn(txnId, Ws);
    }

    if (file) {
      file.text().then((jsonText) => {
        const json = JSON.parse(jsonText) as { [key: string]: NsMetaJson };
        batch(() => {
          importNsData_(json);
        })
        alert("inserting ns data finished.");
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
          <C title={"Graph Functions"} subtitle={"Import Netsuite Data"}>
            <CardBody class="m:0 p:12">
              <div class="m:1rem flex gap:0.5rem">
                <input ref={importNSDataInputRef!} type="file" accept="json"
                       style="display: hidden"></input>
                <button type="button" onClick={importNSData}>
                  <span>Import NS Data</span>
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
