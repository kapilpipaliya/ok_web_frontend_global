import {
  addNewRow,
  deleteRow,
  getChildVertex,
  getChildVertexes,
  getSublistRows,
  getSublistRowsForType,
  isObject,
  newRow,
  Record,
} from "~/lib/Utils";
import {
  commitTxn,
  getNewGraphId,
  getNewTxnId,
  GraphInterface,
  IdAttr,
  Vertex,
} from "~/lib/graph/graph";
import {
  addNewVertex,
  deleteVertex,
  findOrCreateNewVertex,
  mergeVertexProperties,
  newVertex,
  replaceVertexProperties,
} from "~/lib/graph/mutate/vertex";
import {
  findVertexByLabelAndPks,
  findVertexByLabelAndUniqueId,
} from "~/lib/graph/get/sync/findVertex";
import { ServerEventsDispatcher } from "~/lib/websocket/ws_events_dispatcher";
import csvtojson from "csvtojson";
import { getToEdge } from "~/lib/graph/get/sync/getToEdge";
import { A, D } from "@mobily/ts-belt";
import {
  isSimpleCollection,
  setParentValue,
} from "~/components/dynamic/fields/input/SelectInputField";
import { parse } from "yaml";
import { deleteEdge } from "~/lib/graph/mutate/edge";
import { AttrsTableData } from "~/lib/api";
import { setSelectionValue } from "~/components/dynamic/fields/static/SelectionUtils";
import { AttrsAdminTableData } from "~/lib/apiAdmin";
import { SetStoreFunction, Store } from "solid-js/store";
import { getPkForCollection } from "~/lib/graph/get/sync/graph_functions";

export const updateImportRecord = (
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  type: string,
  record: Record,
  dry = true,
) => {
  // TODO: Is this method valid? does it delete nested Rows set by this form?, check code written in NavDesigner component to clear the form.
  const deleteAllRows = (edgeType: string) => {
    const vertexes =
      getChildVertexes(graph, [edgeType], [record.vertex]).vertexes || [];
    for (const row of vertexes) {
      deleteRow(
        row,
        record.isRealTime,
        graph,
        setGraph,
        record.txnId,
        record.ws,
      );
    }
  };
  deleteAllRows("ImportMeta");

  switch (type) {
    case "component": {
      replaceVertexProperties(record.txnId, record.vertex.id, graph, setGraph, {
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
        newRow(
          graph,
          setGraph,
          record.txnId,
          record.vertex,
          "ImportMeta",
          "ImportMeta",
          row,
        );
      }

      break;
    }
    case "dataType": {
      replaceVertexProperties(record.txnId, record.vertex.id, graph, setGraph, {
        label: "DataType",
        dry,
      });
      break;
    }
    case "dataTypeDefault": {
      replaceVertexProperties(record.txnId, record.vertex.id, graph, setGraph, {
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
        newRow(
          graph,
          setGraph,
          record.txnId,
          record.vertex,
          "ImportMeta",
          "ImportMeta",
          row,
        );
      }
      break;
    }
    case "lookup": {
      replaceVertexProperties(record.txnId, record.vertex.id, graph, setGraph, {
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
        newRow(
          graph,
          setGraph,
          record.txnId,
          record.vertex,
          "ImportMeta",
          "ImportMeta",
          row,
        );
      }
      break;
    }
    case "attribute": {
      replaceVertexProperties(record.txnId, record.vertex.id, graph, setGraph, {
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
        newRow(
          graph,
          setGraph,
          record.txnId,
          record.vertex,
          "ImportMeta",
          "ImportMeta",
          row,
        );
      }
      break;
    }
    case "user": {
      replaceVertexProperties(record.txnId, record.vertex.id, graph, setGraph, {
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
        newRow(
          graph,
          setGraph,
          record.txnId,
          record.vertex,
          "ImportMeta",
          "ImportMeta",
          row,
        );
      }
      break;
    }
    case "role": {
      replaceVertexProperties(record.txnId, record.vertex.id, graph, setGraph, {
        label: "Role",
        lookup: "",
        lookupChild: "",
        lookupId: IdAttr,
        dry,
      });
      break;
    }
    case "perm": {
      replaceVertexProperties(record.txnId, record.vertex.id, graph, setGraph, {
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
export const onDataDirectoryImportClick = (
  record: Record,
  Ws: ServerEventsDispatcher,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) => {
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
    checkType: true, // this converts "true" to boolean
    delimiter: [",", "\t"],
  });

  const metaData = getChildVertexes(graph, ["$0Meta"], [record.vertex]);
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
      const attributeVertex = getChildVertex(graph, ["Attr"], metaVertex);
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
    const collVertex = getChildVertex(graph, ["$0Coll"], metaVertex);
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
  const processRows = (
    rowData: {
      [key: string]: any;
    }[],
    labelName: string,
    mainVertex?: Vertex,
  ) => {
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
        let existingVertex = findVertexByLabelAndUniqueId(
          meta.collLabel,
          meta.collId,
          value,
          graph,
        );

        if (!existingVertex) {
          addNewVertex(
            txnId,
            newVertex(getNewGraphId(), [meta.collLabel], {
              [meta.collId]: value,
            }),
            graph,
            setGraph,
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
      let rowVertexId = getNewGraphId();
      if (mainVertex) {
        const type = getToEdge(
          { P: { [IdAttr]: labelName } } as any,
          mainVertex,
        );
        const newRow1 = newRow(graph, setGraph, txnId, mainVertex, type);
        rowVertexId = newRow1.vertexId!;
        mergeVertexProperties(txnId, rowVertexId, graph, setGraph, rowObj);
      } else {
        // when importing component it has self join, so it's inserting duplicate rows
        // TODO: allow customizing primary key for the collection when doing import instead of rowObj[IdAttr]
        const existingVertex = findVertexByLabelAndUniqueId(
          labelName,
          IdAttr,
          rowObj[IdAttr],
          graph,
        );
        if (existingVertex) {
          rowVertexId = existingVertex.id;
        } else {
          addNewVertex(
            txnId,
            newVertex(rowVertexId, [labelName], rowObj),
            graph,
            setGraph,
          );
        }
      }

      for (const selectMeta of selectMetas) {
        const value = selectColumnValues[selectMeta.column];
        if (!value) continue;
        const vertex = graph.vertexes[rowVertexId];

        const v = () =>
          findVertexByLabelAndUniqueId(
            selectMeta.collLabel,
            selectMeta.collId,
            value,
            graph,
          );
        if (selectMeta.func) {
          if (selectMeta.func === "component") {
            const componentString = resoDataTypeToComponents(value, row);
            const componentVertex = findVertexByLabelAndUniqueId(
              selectMeta.collLabel,
              selectMeta.collId,
              componentString,
              graph,
            );
            if (!componentVertex) {
              console.warn(`component is not found ${componentString}`);
              continue;
            }
            // Note: if component does not exist it will not set
            setSelectionValue(
              txnId,
              vertex,
              graph,
              setGraph,
              {
                P: { [IdAttr]: selectMeta.collLabel },
              } as unknown as Vertex,
              componentVertex.id,
            );
          } else if (selectMeta.func === "lookup") {
            const lookup = findVertexByLabelAndUniqueId(
              selectMeta.collLabel,
              selectMeta.collId,
              value,
              graph,
            );
            if (lookup) {
              // edge and child vertex has same label
              const lookupChild = newRow(
                graph,
                setGraph,
                txnId,
                graph.vertexes[rowVertexId],
                selectMeta.collLabel,
              );
              const rowVertex = graph.vertexes[lookupChild.vertexId!];
              setSelectionValue(
                txnId,
                rowVertex,
                graph,
                setGraph,
                {
                  P: { [IdAttr]: selectMeta.collLabel },
                } as unknown as Vertex,
                lookup.id,
              );
            }
          }
        } else if (selectMeta.inward) {
          setParentValue(
            graph,
            setGraph,
            txnId,
            vertex,
            {
              P: {
                props: {
                  parentLabel: selectMeta.collLabel,
                  childLabel: selectMeta.edge,
                },
              },
            } as unknown as Vertex,
            v()!.id,
          );
        } else {
          setSelectionValue(
            txnId,
            vertex,
            graph,
            setGraph,
            {
              P: { [IdAttr]: selectMeta.edge || selectMeta.collLabel },
            } as unknown as Vertex,
            v()!.id,
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
          const existingVertex = findOrCreateNewVertex(
            txnId,
            label,
            lookupId,
            lookUpUniqueValue,
            graph,
            setGraph,
          );

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

export function importRecordWithYAMLSchema(
  yamlInput: any,
  record: Record,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const input = parse(yamlInput);
  if (!isObject(input)) {
    return;
  }

  replaceVertexProperties(record.txnId, record.vertex.id, graph, setGraph, {});

  const clearChildren = (meta: Vertex, vertex: Vertex) => {
    // 2. loop through meta and set all the data.
    const metaVertexes = getSublistRowsForType(
      graph,
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
        setSelectionValue(
          record.txnId,
          vertex,
          graph,
          setGraph,
          metaVertex,
          undefined,
        );
      }
    }

    for (const metaVertex of tableMetaVertexes) {
      const metaProps = metaVertex.P.props || {};

      if (metaProps.inward) {
        // not possible now
      } else {
        const childVertexes = getSublistRows(graph, metaVertex, vertex);
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
            deleteEdge(record.txnId, edgeToDelete, graph, setGraph);
          }

          deleteVertex(record.txnId, v.id, graph, setGraph);
        }
      }
    }
  };

  // after finalizing move this code to record.
  clearChildren(record.metaVertex, record.vertex);

  const insertChildren = (
    meta: Vertex,
    vertex: Vertex,
    input: {
      [key: string]: any;
    },
  ) => {
    const metaVertexes = getSublistRowsForType(graph, "MetaAttr", meta);
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
          alert("collection is not defined in the meta");
          continue;
        }

        // when a collection is not simple, label is required to import data
        const label = isSimpleCollection(metaVertex.P.props.collection)
          ? metaVertex.P.props.collection
          : metaVertex.P.props.label;
        if (!metaVertex.P.props?.collection) {
          alert("collection label is not defined in the meta");
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
                graph,
                setGraph,
              );
              setSelectionValue(
                record.txnId,
                vertex,
                graph,
                setGraph,
                metaVertex,
                selectedVertex!.id,
              );
            }
          } else {
            const collVertex = findVertexByLabelAndUniqueId(
              "Coll",
              "name",
              vertex.L[0],
              graph,
            );
            if (!collVertex) {
              alert(`Collection not defined: ${label[0]}`);
              continue;
            }
            const pks = getPkForCollection(graph, collVertex);

            const pksResult = {} as { [primaryKey: string]: any };
            for (const pk of pks) {
              pksResult[pk] = v[pk];
            }
            if (pks.length === 0) {
              pksResult["name"] = v["name"];
            }
            const selectedVertex = findVertexByLabelAndPks(
              label,
              pksResult,
              graph,
            );
            setSelectionValue(
              record.txnId,
              vertex,
              graph,
              setGraph,
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
          const newRowResult = addNewRow(
            record.txnId,
            metaVertex,
            graph,
            vertex,
            v.P || {},
            record.isRealTime,
            record.ws,
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

  replaceVertexProperties(
    record.txnId,
    record.vertex.id,
    graph,
    setGraph,
    input.P || {},
  );
  insertChildren(record.metaVertex, record.vertex, input);
}
