import { getPkForCollection, Record } from "~/cypher_api/lib/record";
import { IdAttr, Node } from "~/cypher_api/lib/graph";
import {
  deleteVertex,
  findOrCreateNewVertex,
  findOrCreateNewVertexMGCall,
  findVertexByLabelAndPks,
} from "~/cypher_api/lib/vertex";
import csvtojson from "csvtojson";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { A, D } from "@mobily/ts-belt";
import {
  isSimpleCollection,
  setParentValueMGCall,
  setSelectionValue,
  setSelectionValueMGCall,
} from "~/cypher_api/components/input/SelectInputField";
import { parse } from "yaml";
import { isObject } from "~/cypher_api/utils/utils";
import { deleteEdge } from "~/cypher_api/lib/edge";
import { AttrsTableData } from "~/cypher_api/lib/api";
import { AttrsAdminTableData } from "~/cypher_api/lib/apiAdmin";
import { findVertexMGCall } from "~/cypher_api/functions/findVertex";
import { newVertexDBCall } from "~/cypher_api/functions/newVertex";
import { newRowMGCall } from "~/cypher_api/functions/newRow";
import { getChildVertexesLocal, getChildVertexLocal } from "./traverse";
import { getToEdge } from "~/lib/graph/get/sync/getToEdge";

export const updateImportRecord = (
  type: string,
  metaRecord: Record,
  dry = true,
) => {
  metaRecord.deleteAllRows("ImportMeta");

  switch (type) {
    case "component": {
      metaRecord.replaceFieldValues({
        label: "Comp",
        dry,
      });
      const rows = [
        {
          column: "parent",
          collLabel: "Comp",
          collId: IdAttr,
          edge: "Child",
          inward: true,
        },
        {
          column: "category",
          collLabel: "CompCategory",
          collId: IdAttr,
          inward: true,
        },
        {
          column: "dataType",
          collLabel: "DataType",
          collId: IdAttr,
          inward: true,
        },
      ];
      for (const row of rows) {
        metaRecord.selectNewLine({ sublistId: "ImportMeta", properties: row });
      }

      break;
    }
    case "dataType": {
      metaRecord.replaceFieldValues({
        label: "DataType",
        dry,
      });
      break;
    }
    case "dataTypeDefault": {
      metaRecord.replaceFieldValues({
        label: "DataType",
        dry,
      });
      const rows = [
        {
          column: "default",
          collLabel: "Comp",
          edge: "default",
          collId: IdAttr,
        },
      ];
      for (const row of rows) {
        metaRecord.selectNewLine({ sublistId: "ImportMeta", properties: row });
      }
      break;
    }
    case "lookup": {
      metaRecord.replaceFieldValues({
        label: "Coll",
        lookup: "LookupName",
        lookupId: IdAttr,
        dry,
      });
      const rows = [
        {
          column: "StandardLookupValue",
          attrId: IdAttr,
        },
        {
          column: "Definition",
          attrId: "description",
        },
      ];
      for (const row of rows) {
        metaRecord.selectNewLine({ sublistId: "ImportMeta", properties: row });
      }
      break;
    }
    case "attribute": {
      metaRecord.replaceFieldValues({
        label: "Coll",
        lookup: "ResourceName",
        lookupChild: "Attr",
        lookupId: IdAttr,
        dry,
      });
      const rows = [
        { column: "StandardName", attrId: IdAttr },
        { column: "DisplayName", attrId: "displayName" },
        { column: "Definition", attrId: "definition" },
        {
          column: "SimpleDataType",
          collLabel: "Comp",
          collId: IdAttr,
          func: "component",
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
        { column: "BEDES", skip: true },
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
        metaRecord.selectNewLine({ sublistId: "ImportMeta", properties: row });
      }
      break;
    }
    case "user": {
      metaRecord.replaceFieldValues({
        label: "User",
        lookup: "",
        lookupChild: "",
        lookupId: IdAttr,
        dry,
      });
      const rows = [
        {
          column: "role",
          collLabel: "Role",
          collId: IdAttr,
        },
      ];
      for (const row of rows) {
        metaRecord.selectNewLine({ sublistId: "ImportMeta", properties: row });
      }
      break;
    }
    case "role": {
      metaRecord.replaceFieldValues({
        label: "Role",
        lookup: "",
        lookupChild: "",
        lookupId: IdAttr,
        dry,
      });
      break;
    }
    case "perm": {
      metaRecord.replaceFieldValues({
        label: "Perm",
        lookup: "",
        lookupChild: "",
        lookupId: IdAttr,
        dry,
      });
      break;
    }
    default: {
    }
  }
};
const isEmpty = (object: { [key: string]: any }) =>
  !Object.values(object).some((x) => x !== null && x !== "");

// TODO: Fix this
const resoDataTypeToComponents = (
  type: string,
  row: { [key: string]: any },
) => {
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
export const onDataDirectoryImportClick = async (record: Record) => {
  const csvResult = record.vertex.P.csv as string;
  const label = record.vertex.P.label as string;
  const dry = record.vertex.P.dry as boolean;
  const lookup = record.vertex.P.lookup as string;
  const lookupId = record.vertex.P.lookupId as string;
  const lookupChild = record.vertex.P.lookupChild as string;
  if (!label) {
    console.error("label cant be blank");
    return;
  }

  const converter = csvtojson({
    trim: true,
    // checkColumn: true,
    checkType: true, // this converts "true" to boolean
    delimiter: [",", "\t"],
  });

  const metaData = getChildVertexesLocal(
    record.graph,
    record.setGraph,
    ["$0Meta"],
    [record.vertex],
  );
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
      const attributeVertex = getChildVertexLocal(
        record.graph,
        record.setGraph,
        ["Attr"],
        metaVertex,
      );
      if (!attributeVertex.error) {
        attrId = attributeVertex.vertex?.P[IdAttr];
      }
    }

    let collId = metaVertex.P.collId || IdAttr;

    // collection may not exist before, in that case write Label
    let collLabel = metaVertex.P.collLabel;

    if (!attrId && !collLabel && !metaVertex.P.skip) {
      console.error("attrId or collLabel is required");
    }
    const collVertex = getChildVertexLocal(
      record.graph,
      record.setGraph,
      ["$0Coll"],
      metaVertex,
    );
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
      skipRow: metaVertex.P.skipRow?.split?.("\n") || [],
    } as Column;
  });

  // process each row:
  const processRows = async (
    rowData: { [key: string]: any }[],
    labelName: string,
    mainVertex?: Node,
  ) => {
    const selectMetas = normalizeMeta.filter((meta) => meta.collLabel);
    const nonSelectMetas = normalizeMeta.filter((meta) => !meta.collLabel);
    const selectColumnIds = selectMetas.map((meta) => meta.column);
    // Insert all Select Vertexes:
    for (const meta of selectMetas) {
      if (meta.skip) continue;
      // get unique ID and insert if not exist.
      const uniqueValues = A.groupBy(rowData, (row) => row[meta.column]);
      for (const value of Object.keys(uniqueValues)) {
        if (!value) continue;
        if (value === "undefined") continue;
        // find and if not exist then only add new vertex
        const existingVertex = await findVertexMGCall(
          record.dbConn,
          meta.collLabel,
          meta.collId,
          value,
        );

        if (existingVertex.error) {
          await newVertexDBCall(record.dbConn, meta.collLabel, {
            [meta.collId]: value,
          });
        }
      }
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
          console.log(
            `skipping row with ${meta.column} value ${rowObj[meta.column]}`,
          );
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
      let rowVertex: Node;
      if (mainVertex) {
        const type = getToEdge(
          { P: { [IdAttr]: labelName } } as any,
          mainVertex,
        );
        const result = await newRowMGCall(
          record.dbConn,
          mainVertex.id,
          type,
          type,
          rowObj,
        );
        rowVertex = result.vertex!;
      } else {
        // when importing component it has self join, so it's inserting duplicate rows
        // TODO: allow customizing primary key for the collection when doing import instead of rowObj[IdAttr]
        const existingVertex = await findVertexMGCall(
          record.dbConn,
          labelName,
          IdAttr,
          rowObj[IdAttr],
        );
        if (!existingVertex.error) {
          rowVertex = existingVertex.vertex!;
        } else {
          const vertexResult = await newVertexDBCall(
            record.dbConn,
            labelName,
            rowObj,
          );
          if (!vertexResult.error) {
            rowVertex = vertexResult.vertex!;
          }
        }
      }

      for (const selectMeta of selectMetas) {
        const value = selectColumnValues[selectMeta.column];
        if (!value) continue;
        const vertex = rowVertex!;

        if (selectMeta.func) {
          if (selectMeta.func === "component") {
            const componentString = resoDataTypeToComponents(value, row);
            const componentVertex = await findVertexMGCall(
              record.dbConn,
              selectMeta.collLabel,
              selectMeta.collId,
              componentString,
            );
            if (componentVertex.error) {
              console.warn(`component is not found ${componentString}`);
              continue;
            }
            // Note: if component does not exist it will not set
            await setSelectionValueMGCall(
              record.dbConn,
              vertex,
              {
                P: { [IdAttr]: selectMeta.collLabel },
              } as unknown as Node,
              componentVertex.vertex!.id,
            );
          } else if (selectMeta.func === "lookup") {
            const lookup = await findVertexMGCall(
              record.dbConn,
              selectMeta.collLabel,
              selectMeta.collId,
              value,
            );
            if (!lookup.error) {
              // edge and child vertex has same label
              const lookupChild = await newRowMGCall(
                record.dbConn,
                vertex.id,
                selectMeta.collLabel,
              );
              if (lookupChild.error) {
                continue;
              }
              const rowVertex = lookupChild.vertex!;
              await setSelectionValueMGCall(
                record.dbConn,
                rowVertex,
                {
                  P: { [IdAttr]: selectMeta.collLabel },
                } as unknown as Node,
                lookup.vertex!.id,
              );
            }
          }
        } else if (selectMeta.inward) {
          const vertexResult = await findVertexMGCall(
            record.dbConn,
            selectMeta.collLabel,
            selectMeta.collId,
            value,
          );
          if (vertexResult.error) {
            continue;
          }
          await setParentValueMGCall(
            record.dbConn,
            vertex,
            {
              P: {
                props: {
                  parentLabel: selectMeta.collLabel,
                  childLabel: selectMeta.edge,
                },
              },
            } as unknown as Node,
            vertexResult.vertex!.id,
          );
        } else {
          const vertexResult = await findVertexMGCall(
            record.dbConn,
            selectMeta.collLabel,
            selectMeta.collId,
            value,
          );
          if (vertexResult.error) continue;

          await setSelectionValueMGCall(
            record.dbConn,
            vertex,
            {
              P: { [IdAttr]: selectMeta.edge || selectMeta.collLabel },
            } as unknown as Node,
            vertexResult.vertex!.id,
          );
        }
      }
    }
  };

  const rows: { [key: string]: any }[] = await converter.fromString(
    csvResult as string,
  );

  if (lookup && lookupId) {
    // get unique ID and insert if not exist.
    const uniqueValues = A.groupBy(rows, (row) => row[lookup]);
    for (const lookUpUniqueValue of Object.keys(uniqueValues)) {
      if (!lookUpUniqueValue || lookUpUniqueValue === "undefined") {
        console.warn("skipped inserting empty lookups data");
        continue;
      }
      const existingVertex = await findOrCreateNewVertexMGCall(
        record.dbConn,
        label,
        lookupId,
        lookUpUniqueValue,
      );

      const rows = uniqueValues[lookUpUniqueValue]!;
      // when lookup we enter one collection and all other data as its child data
      if (!lookupChild) {
        // value is Collection Label here.
        // insert data:
        await processRows(rows as any, lookUpUniqueValue);
      } else {
        await processRows(rows as any, lookupChild, existingVertex);
      }
    }
  } else {
    await processRows(rows, label);
  }
};

// TODO: Fix this
export function importRecordWithYAMLSchema(yamlInput: any, record: Record) {
  const input = parse(yamlInput);
  console.log(input);
  if (!isObject(input)) {
    return;
  }

  record.replaceFieldValues({});

  const clearChildren = (meta: Node, vertex: Node) => {
    // 2. loop through meta and set all the data.
    const metaVertexes = record.getSublistRowsForType(
      "MetaAttr",
      record.metaVertex,
    );

    const selectMetaVertexes = metaVertexes.filter((meta) =>
      ["SelectBox", "TagBox"].includes(meta.P.component),
    );
    const tableMetaVertexes = metaVertexes.filter((meta) =>
      ["Table"].includes(meta.P.component),
    );

    for (const metaVertex of selectMetaVertexes) {
      const metaProps = metaVertex.P.props || {};

      if (metaProps.inward) {
        // Todo
      } else {
        setSelectionValue(record.txnId, vertex, metaVertex, undefined);
      }
    }

    for (const metaVertex of tableMetaVertexes) {
      const metaProps = metaVertex.P.props || {};

      if (metaProps.inward) {
        // not possible now
      } else {
        const childVertexes = record.getSublistRows(metaVertex, vertex);
        const edge = getToEdge(metaVertex, vertex);
        const outEdges = vertex.OUT[edge] || [];

        for (const v of childVertexes) {
          clearChildren(metaVertex, v);
          // this deletes all vertexes in edges,
          // out edges and the vertex itself.
          // without confirmation, this is not good.
          // some form may depend on it.
          // unsafely delete:
          // deleteRow(v, record.isRealTime, record.txnId, record.ws);

          // safe delete:
          const edgeToDelete = outEdges.find(
            (edgeId) => graph.edges[edgeId].E === v.id,
          );
          if (edgeToDelete) {
            deleteEdge(record.txnId, edgeToDelete);
          }

          deleteVertex(record.txnId, v.id);
        }
      }
    }
  };

  // after finalizing move this code to record.
  clearChildren(record.metaVertex, record.vertex);

  const insertChildren = (
    meta: Node,
    vertex: Node,
    input: {
      [key: string]: any;
    },
  ) => {
    const metaVertexes = record.getSublistRowsForType("MetaAttr", meta);
    // const props = meta.P.props || {};

    const selectMetaVertexes = metaVertexes.filter((meta) =>
      ["SelectBox", "TagBox"].includes(meta.P.component),
    );
    const tableMetaVertexes = metaVertexes.filter((meta) =>
      ["Table"].includes(meta.P.component),
    );

    for (const metaVertex of selectMetaVertexes) {
      const metaProps = metaVertex.P.props || {};

      if (metaProps.inward) {
        // input['IN'] = {} as {[EdgeType: string]: {[primaryKey: string]: any}[]};
      } else {
        const type = getToEdge(metaVertex, vertex);
        const childVertexes = input?.["OUT"]?.[type] || [];
        if (metaVertex.P.props?.items) {
          continue;
        }
        if (!metaVertex.P.props?.collection) {
          console.error("collection is not defined in the meta");
          continue;
        }

        // when a collection is not simple, label is required to import data
        const label = isSimpleCollection(metaVertex.P.props.collection)
          ? metaVertex.P.props.collection
          : metaVertex.P.props.label;
        if (!metaVertex.P.props?.collection) {
          console.error("collection label is not defined in the meta");
          continue;
        }

        for (const v of childVertexes) {
          if (AttrsTableData[label] || AttrsAdminTableData[label]) {
            if (v["name"]) {
              const selectedVertex = findOrCreateNewVertex(
                record.txnId,
                label,
                "name",
                v["name"],
              );
              setSelectionValue(
                record.txnId,
                vertex,
                metaVertex,
                selectedVertex!.id,
              );
            }
          } else {
            const collVertex = findVertexByLabelAndUniqueId(
              graph,
              "Coll",
              "name",
              vertex.L[0],
            );
            if (!collVertex) {
              console.error(`Collection not defined: ${label[0]}`);
              continue;
            }
            const pks = getPkForCollection(collVertex);

            const pksResult = {} as { [primaryKey: string]: any };
            for (const pk of pks) {
              pksResult[pk] = v[pk];
            }
            if (pks.length === 0) {
              pksResult["name"] = v["name"];
            }
            const selectedVertex = findVertexByLabelAndPks(label, pksResult);
            setSelectionValue(
              record.txnId,
              vertex,
              metaVertex,
              selectedVertex!.id,
            );
          }
        }
      }
    }
    for (const metaVertex of tableMetaVertexes) {
      const metaProps = metaVertex.P.props || {};

      if (metaProps.inward) {
        // not possible now
      } else {
        const type = getToEdge(metaVertex, vertex);
        const childVertexes = input?.["OUT"]?.[type] || [];

        for (const v of childVertexes) {
          const newRowResult = record.addNewRowUI(
            metaVertex,
            vertex,
            v.P || {},
          );
          if (!newRowResult.error) {
            insertChildren(
              metaVertex,
              graph.vertexes[newRowResult.vertexId!],
              v,
            );
          }
        }
      }
    }

    return input;
  };

  record.replaceFieldValues(input.P || {});
  insertChildren(record.metaVertex, record.vertex, input);
}
