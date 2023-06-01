import { newRow, Record } from "./Record";
import {
 commitTxn,
 getNewGraphId,
 getNewTxnId,
 graph,
 IdAttr,
 Vertex
} from "./graph";
import {
 addNewVertex,
 findVertexByLabelAndUniqueId,
 mergeVertexProperties,
 newVertex
} from "./Vertex";
import { ServerEventsDispatcher } from "../components/ws_events_dispatcher";
import csvtojson from "csvtojson";
import { getChildVertex, getChildVertexes, getToEdge } from "./Traverse";
import { A, D } from "@mobily/ts-belt";
import {
 setParentValue,
 setSelectionValue
} from "../components/input/SelectInputField";

export const updateImportRecord = (type: string, record: Record, dry= true) => {

 record.deleteAllRows("ImportMeta");

 switch (type) {
  case "component": {
   record.replaceFieldValues({
    label: "Comp",
    dry
   });
   const rows = [{
    column: "parent",
    collLabel: "Comp",
    collId: IdAttr,
    edge: "Child",
    inward: true
   }, {
    column: "category",
    collLabel: "CompCategory",
    collId: IdAttr,
    inward: true
   }, {
    column: "dataType",
    collLabel: "DataType",
    collId: IdAttr,
    inward: true
   }];
   for (const row of rows) {
    record.selectNewLine({ sublistId: "ImportMeta", properties: row });
   }

   break;
  }
  case "dataType": {
   record.replaceFieldValues({
    label: "DataType",
    dry
   });
   break;
  }
  case "dataTypeDefault": {
   record.replaceFieldValues({
    label: "DataType",
    dry
   });
   const rows = [{
    column: "default",
    collLabel: "Comp",
    edge: "default",
    collId: IdAttr
   }];
   for (const row of rows) {
    record.selectNewLine({ sublistId: "ImportMeta", properties: row });
   }
   break;
  }
  case "lookup": {
   record.replaceFieldValues({
    label: "Coll",
    lookup: "LookupName",
    lookupId: IdAttr,
    dry
   });
   const rows = [{
    column: "StandardLookupValue",
    attrId: IdAttr
   }, {
    column: "Definition",
    attrId: "description"
   }];
   for (const row of rows) {
    record.selectNewLine({ sublistId: "ImportMeta", properties: row });
   }
   break;
  }
  case "attribute": {
   record.replaceFieldValues({
    label: "Coll",
    lookup: "ResourceName",
    lookupChild: "Attr",
    lookupId: IdAttr,
    dry
   });
   const rows = [
    { column: "StandardName", attrId: IdAttr },
    { column: "DisplayName", attrId: "displayName" },
    { column: "Definition", attrId: "definition" },
    {
     column: "SimpleDataType",
     collLabel: "Comp",
     collId: IdAttr,
     func: "component"
    },
    { column: "SourceResource", skip: true },
    { column: "SugMaxLength", skip: true },
    { column: "SugMaxPrecision", skip: true },
    { column: "Synonyms", skip: true },
    { column: "FrenchCanadianDisplayName", skip: true },
    { column: "LookupStatus", skip: true },
    { column: "LookupName", skip: true },
    { column: "RepeatingElement", skip: true },
    { column: "payload", skip: true },
    { column: "TargetResourceKey", skip: true },
    { column: "SourceResourceKey", skip: true },
    { column: "BEDES", skip: true }
    // TODO: Point Groups to Group Tab
    // {
    //  column: "Groups",
    //  // think how to make this work?
    //  // collLabel: "CollGroup",
    //  // collId: IdAttr,
    //  // inward: true
    //  skip: true
    // }
   ];
   for (const row of rows) {
    record.selectNewLine({ sublistId: "ImportMeta", properties: row });
   }
   break;
  }
  default: {
  }
 }
};
const isEmpty = (object: { [key: string]: any }) => !Object.values(object).some((x) => x !== null && x !== "");

function findOrCreateNewVertex(txnId: number, label: string, lookupId: string, lookUpUniqueValue: string) {
 let existingVertex = findVertexByLabelAndUniqueId(label, lookupId, lookUpUniqueValue);

 if (!existingVertex) {
  const vertexId = getNewGraphId();
  addNewVertex(txnId, newVertex(vertexId, [label], { [lookupId]: lookUpUniqueValue }));
  existingVertex = graph.vertexes[vertexId];
 }
 return existingVertex;
}

const resoDataTypeToComponents = (type: string, row: { [key: string]: any }) => {
 switch (type) {
  case "Boolean":
   return "CheckBox";
  case "Collection":
   return "SelectBox";
  case "Date":
   return "DateBox";
  case "Number": {
   if (row.SugMaxPrecision) {
    return "Int";
   } else {
    return "Float";
   }
  }
  case "Resource":
   return "SelectBox";
  case "String":
   return "TextBox";
  case "String List, Multi":
   return "TagBox";
  case "String List, Single":
   return "SelectBox";
  case "Timestamp":
   return "DateTimeBox";
  default:
   return "";
 }
};
export const onDataDirectoryImportClick = (record: Record, Ws: ServerEventsDispatcher) => {
 const csvResult = record.vertex.P.csv as string;
 const label = record.vertex.P.label as string;
 const dry = record.vertex.P.dry as boolean;
 const lookup = record.vertex.P.lookup as string;
 const lookupId = record.vertex.P.lookupId as string;
 const lookupChild = record.vertex.P.lookupChild as string;
 if (!label) {
  alert("label cant be blank");
  return;
 }

 const txnId = getNewTxnId();

 const converter = csvtojson({
  trim: true,
  // checkColumn: true,
  delimiter: [",", "\t"]
 });

 const metaData = getChildVertexes(["$0Meta"], [record.vertex]);
 if (metaData.error) {
  return;
 }

 interface Column {
  column: string;
  attrId: string;
  collLabel: string;
  collId: string;
  inward: boolean;
  func: string;
  edge: string;
  skip: boolean;
 }

 const normalizeMeta = metaData.vertexes!.map((metaVertex) => {
  const column = metaVertex.P.column as string;
  // attribute may not exist before, in that case write ID
  let attrId = metaVertex.P.attrId;
  if (!attrId) {
   const attributeVertex = getChildVertex(["$0Attr"], metaVertex);
   if (!attributeVertex.error) {
    attrId = attributeVertex.vertex?.P[IdAttr];
   }
  }

  let collId = metaVertex.P.collId || IdAttr;

  // collection may not exist before, in that case write Label
  let collLabel = metaVertex.P.collLabel;

  if (!attrId && !collLabel && !metaVertex.P.skip) {
   alert("attrId or collLabel is required");
  }
  const collVertex = getChildVertex(["$0Coll"], metaVertex);
  if (!collVertex.error) {
   collLabel = collVertex.vertex?.P[collId];
  }
  return {
   column,
   attrId,
   collLabel,
   collId,
   inward: metaVertex.P.inward,
   func: metaVertex.P.func,
   edge: metaVertex.P.edge,
   skip: metaVertex.P.skip,
   skipRow: metaVertex.P.skipRow?.split?.("\n") || []
  } as Column;
 });

 // process each row:
 const processRows = (rowData: { [key: string]: any }[], labelName: string, mainVertex?: Vertex) => {
  const selectMetas = normalizeMeta.filter((meta) => meta.collLabel);
  const nonSelectMetas = normalizeMeta.filter((meta) => !meta.collLabel);
  const selectColumnIds = selectMetas.map((meta) => meta.column);
  // Insert all Select Vertexes:
  for (const meta of selectMetas) {
   if (meta.skip) continue;
   // get unique ID and insert if not exist.
   const uniqueValues = A.groupBy(rowData, (row) => row[meta.column]);
   Object.keys(uniqueValues).forEach((value) => {
    if (!value) return;
    if (value === "undefined") return;
    // find and if not exist then only add new vertex
    let existingVertex = findVertexByLabelAndUniqueId(meta.collLabel, meta.collId, value);

    if (!existingVertex) {
     addNewVertex(
      txnId,
      newVertex(getNewGraphId(), [meta.collLabel], {
       [meta.collId]: value
      })
     );
    }
   });
  }

  for (const row of rowData) {
   const selectColumnValues = D.selectKeys(row, selectColumnIds);
   // remove lookup value
   const rowObj = D.deleteKeys(row, selectColumnIds);
   let skipRow = false;
   // rename object mapping.
   for (const meta of nonSelectMetas) {
    if (meta.skipRow.includes(rowObj[meta.column])) {
     skipRow = true;
     console.log(`skipping row with ${meta.column} value ${rowObj[meta.column]}`);
     break;
    }
    if (meta.skip) {
     // @ts-ignore
     rowObj[meta.column] = undefined;
    }
    if (!meta.attrId) continue;
    // @ts-ignore
    const m = rowObj[meta.column];
    if (m === undefined) continue;
    // @ts-ignore
    delete rowObj[meta.column];
    // @ts-ignore
    rowObj[meta.attrId] = m;
   }
   if (skipRow) continue;

   // insert current row and all lookup as children or parent
   let rowVertexId = getNewGraphId();
   if (mainVertex) {
    const type = getToEdge({ P: { [IdAttr]: labelName } } as Vertex, mainVertex);
    const newRow1 = newRow(txnId, mainVertex, type);
    rowVertexId = newRow1.vertexId!;
    mergeVertexProperties(txnId, rowVertexId, rowObj);
   } else {
    // when importing component it has self join, so it's inserting duplicate rows
    const existingVertex = findVertexByLabelAndUniqueId(labelName, IdAttr, rowObj[IdAttr]);
    if (existingVertex) {
     rowVertexId = existingVertex.id;
    } else {
     addNewVertex(txnId, newVertex(rowVertexId, [labelName], rowObj));
    }
   }

   for (const selectMeta of selectMetas) {
    const value = selectColumnValues[selectMeta.column];
    if (!value) continue;
    const vertex = graph.vertexes[rowVertexId];

    const v = () => findVertexByLabelAndUniqueId(selectMeta.collLabel, selectMeta.collId, value);
    if (selectMeta.func) {
     if (selectMeta.func === "component") {
      const componentString = resoDataTypeToComponents(value, row);
      const componentVertex = findVertexByLabelAndUniqueId(
       selectMeta.collLabel,
       selectMeta.collId,
       componentString
      );
      if (!componentVertex) {
       console.warn(`component is not found ${componentString}`);
       continue;
      }
      // Note: if component does not exist it will not set
      setSelectionValue(
       txnId,
       vertex,
       {
        P: { [IdAttr]: selectMeta.collLabel }
       } as unknown as Vertex,
       componentVertex.id
      );
     } else if (selectMeta.func === "lookup") {
      const lookup = findVertexByLabelAndUniqueId(selectMeta.collLabel, selectMeta.collId, value);
      if (lookup) {
       // edge and child vertex has same label
       const lookupChild = newRow(txnId, graph.vertexes[rowVertexId], selectMeta.collLabel);
       const rowVertex = graph.vertexes[lookupChild.vertexId!];
       setSelectionValue(
        txnId,
        rowVertex,
        {
         P: { [IdAttr]: selectMeta.collLabel }
        } as unknown as Vertex,
        lookup.id
       );
      }
     }
    } else if (selectMeta.inward) {
     setParentValue(
      txnId,
      vertex,
      {
       P: {
        props: {
         parentLabel: selectMeta.collLabel,
         childLabel: selectMeta.edge
        }
       }
      } as unknown as Vertex,
      v()!.id
     );
    } else {
     setSelectionValue(
      txnId,
      vertex,
      {
       P: { [IdAttr]: selectMeta.edge || selectMeta.collLabel }
      } as unknown as Vertex,
      v()!.id
     );
    }
   }
  }
 };

 const rows = [] as { [key: string]: any }[];

 converter
  .fromString(csvResult as string)
  .on("data", (data) => {
   //data is a buffer object
   const jsonStr = data.toString("utf8");
   const json = JSON.parse(jsonStr);
   // addNewVertex(txnId, newVertex(getNewGraphId(), [label], json));
   if (!isEmpty(json)) {
    rows.push(json);
   }
  })
  .on("end", () => {
   if (lookup && lookupId) {
    // get unique ID and insert if not exist.
    const uniqueValues = A.groupBy(rows, (row) => row[lookup]);
    for (const lookUpUniqueValue of Object.keys(uniqueValues)) {
     if (!lookUpUniqueValue || lookUpUniqueValue === "undefined") {
      console.warn("skipped inserting empty lookups data");
      continue;
     }
     const existingVertex = findOrCreateNewVertex(txnId, label, lookupId, lookUpUniqueValue);

     const rows = uniqueValues[lookUpUniqueValue]!;
     // when lookup we enter one collection and all other data as its child data
     if (!lookupChild) {
      // value is Collection Label here.
      // insert data:
      processRows(rows, lookUpUniqueValue);
     } else {
      processRows(rows, lookupChild, existingVertex);
     }
    }
   } else {
    processRows(rows, label);
   }

   if (!dry) commitTxn(txnId, Ws);
   alert("finished import");
  });
};