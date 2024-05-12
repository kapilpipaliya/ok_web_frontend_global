import {
  getNewGraphId,
  getNewTxnId,
  Id,
  IdAttr,
  IGraph,
  Node,
  revertTransaction,
} from "~/cypher_api/lib/graph";
import { klona } from "klona/json";
import {
  addNewVertex,
  deleteVertex,
  findVertexByLabelAndUniqueId,
  mergeVertexProperties,
  newVertex,
  replaceVertexProperties,
} from "~/cypher_api/lib/vertex";
import { batch, createContext, onCleanup, untrack } from "solid-js";
import {
  getChildVertex,
  getChildVertexes,
  getChildVertexesLocal,
  getChildVertexLocal,
  getParentVertex,
  getSelectionOptions,
  getToEdge,
} from "~/cypher_api/lib/traverse";
import { removeUndefinedProperties } from "~/cypher_api/utils/functions";
import { addNewEdge, deleteEdge, newEdge } from "~/cypher_api/lib/edge";
import { setSelectionValue } from "~/cypher_api/components/input/SelectInputField";
import {
  capitalizeFirstLetter,
  getValueFromVertexOrKey,
  groupBy,
  isObject,
} from "~/cypher_api/utils/utils";
import { AdminAttrKeys, AttrsTableData } from "~/cypher_api/lib/api";
import { AttrsAdminTableData } from "~/cypher_api/lib/apiAdmin";
import { SetStoreFunction, Store } from "solid-js/store";
import { DBConnection } from "~/cypher_api/lib/dbs";
import { findVertexMGCall } from "~/cypher_api/functions/findVertex";
import { getOutEdges } from "~/cypher_api/functions/getOutEdges";
import { deleteRelationShipMGCall } from "~/cypher_api/functions/deleteRelationShip";
import { deleteNodeMGCall } from "~/cypher_api/functions/deleteNode";

export interface FieldAttribute {
  name: string;
  // tab?: string;
  // group?: string;
  dataType?: string;
  meta?: string;
  component: string;
  displayName?: string;
  props?: {
    [key: string]: any;
    // validationRules?: Array<ValidationRule>;
  };
  // postSubmit?: (formValues: IFormGroup, formGroup: IFormGroup, tableItemFormGroup: IFormGroup, values: FormResult)=>void
  attributes?: FieldAttribute[];
}

export interface FormMetaData {
  name: string; // required to create new vertex
  title: string;
  attributes: FieldAttribute[];
  isRealTime?: boolean;
  // postSubmit?: (data: any) => any
}

export async function getCompPropsMap(dbConn: DBConnection, comp: Node) {
  const children = await getChildVertexes(dbConn, ["$0Prop"], [comp]);
  return (children.vertexes || []).reduce(
    (acc, curr) => {
      acc[curr.P.name] = curr;
      return acc;
    },
    {} as { [key: string]: Node },
  );
}

export async function getCompProps(dbConn: DBConnection, comp: Node) {
  const children = await getChildVertexes(dbConn, ["$0Prop"], [comp]);
  return (children.vertexes || []).reduce(
    (acc, curr) => {
      if (curr.P.name && curr.P.value !== undefined) {
        acc[curr.P.name] = curr.P.value;
      }
      return acc;
    },
    {} as { [key: string]: any },
  );
}

export async function getRowProps(dbConn: DBConnection, comp: Node) {
  const children = await getChildVertexes(dbConn, ["$0Prop"], [comp]);
  return (children.vertexes || []).reduce(
    (acc, curr) => {
      const key = getSelectionOptions([curr], "->$0Name::'P.name'").vertexes;
      if (key && curr.P.value !== undefined) {
        acc[key] = curr.P.value;
      }

      return acc;
    },
    {} as { [key: string]: any },
  );
}

function getComponentProperties(metaRows: Node[]) {
  const metaData = metaRows.reduce(
    (acc, curr) => {
      const key = getSelectionOptions([curr], "::'P.name'").vertexes; // ->$0Name:P.name||:P.name
      if (key && curr.P.value !== undefined) {
        acc[key] = curr.P.value;
      }
      return acc;
    },
    {} as { [key: string]: any },
  );
  return metaData;
}

export async function getCollAttrs(
  dbConn: DBConnection,
  vertexCollAttr: Node,
): Promise<{ error: boolean; attr?: FieldAttribute }> {
  const attr = Object.assign(
    {},
    removeUndefinedProperties(vertexCollAttr.P, false, 10),
  );
  attr.metaId = vertexCollAttr.id;

  let collAttrCompResult = await getChildVertex(
    dbConn,
    ["$0Comp"],
    vertexCollAttr,
  );
  let collAttrComp = collAttrCompResult.vertex;

  // set dataType to attr
  const dataType = await getChildVertex(dbConn, ["$0DataType"], vertexCollAttr);
  if (dataType.error) {
    if (!collAttrComp) {
      console.warn(
        "data Type not found for attr",
        vertexCollAttr.P.name,
        "taking string dataType",
      );
      const dataTypeVertex = await findVertexMGCall(
        dbConn,
        "DataType",
        "name",
        "String",
      );
      if (dataTypeVertex.error) {
        console.warn("String data Type not found");
        return { error: true };
      }
      dataType.vertex = dataTypeVertex.vertex!;
      attr.dataType = dataType.vertex!.P[IdAttr];
    } else {
      const dataTypeFromComp = await getParentVertex(
        dbConn,
        ["DataTypeComp"],
        collAttrComp,
      );
      if (dataTypeFromComp.error) {
        console.warn(
          "data Type not found from Component for attr",
          vertexCollAttr.P.name,
        );
        return { error: true };
      }
      attr.dataType = dataTypeFromComp.vertex!.P[IdAttr];
    }
  } else {
    attr.dataType = dataType.vertex!.P[IdAttr];
  }

  const collAttrCollResult = await getChildVertex(
    dbConn,
    ["$0Coll"],
    vertexCollAttr,
  );
  const collAttrColl = collAttrCollResult.vertex!;

  // set props to attr
  let collProps = (
    (await getChildVertexes(dbConn, ["$0Prop"], [vertexCollAttr])).vertexes ||
    []
  ).reduce(
    (acc, curr) => {
      const key = getSelectionOptions([curr], "->$0Name::'P.name'").vertexes;
      if (key && curr.P.value !== undefined) {
        acc[key] = curr.P.value;
      }
      return acc;
    },
    {} as { [key: string]: any },
  );
  if (collAttrColl) {
    collProps.collection = collAttrColl["P"]?.["name"];
  }

  // merge default component props
  if (!collAttrComp) {
    const dataTypeDefault = await getChildVertex(
      dbConn,
      ["$0Default"],
      dataType.vertex!,
    );
    if (dataTypeDefault.error) {
      console.warn("Component not configured");
      return { error: true };
    }
    collAttrComp = dataTypeDefault.vertex!;
  }

  const compProps = await getCompProps(dbConn, collAttrComp);
  collProps = Object.assign(
    {},
    removeUndefinedProperties(compProps, false, 10),
    collProps,
  );

  const parentVertexResult = await getParentVertex(
    dbConn,
    ["CompChild"],
    collAttrComp,
  );
  if (!parentVertexResult.error) {
    const parentCompProps = (
      (
        await getChildVertexes(
          dbConn,
          ["CompProp"],
          [parentVertexResult.vertex!],
        )
      ).vertexes || []
    ).reduce(
      (acc, curr) => {
        if (curr.P.name && curr.P.value !== undefined) {
          acc[curr.P.name] = curr.P.value;
        }
        return acc;
      },
      {} as { [key: string]: any },
    );
    collProps = Object.assign(
      {},
      removeUndefinedProperties(parentCompProps, false, 10),
      collProps,
    );
    attr.component = parentVertexResult.vertex!.P[IdAttr];
  } else {
    attr.component = collAttrComp.P[IdAttr];
  }
  attr.props = collProps;
  return { error: false, attr };
}

export let isUpdatingInput = false;

export function setUpdateStatus(value: boolean) {
  isUpdatingInput = value;
}

const getCollectionOneLevelAttrs = async (
  dbConn: DBConnection,
  collVertex: Node,
): Promise<{ error: string; attrs?: FieldAttribute[] }> => {
  const vertexCollAttrResult = await getChildVertexes(
    dbConn,
    ["Attr"],
    [collVertex],
  );
  if (vertexCollAttrResult.error) {
    return { error: "No Attributes in a Coll" };
  }
  const collAttrs = vertexCollAttrResult.vertexes!.sort(
    (a, b) => a.P.pos - b.P.pos,
  );
  let attrs: FieldAttribute[] = [];

  for (const vertexCollAttr of collAttrs) {
    const addPropsResult = await getCollAttrs(dbConn, vertexCollAttr);
    if (addPropsResult.error) continue;
    const attributes = await getCollectionOneLevelAttrs(dbConn, vertexCollAttr);
    if (!attributes.error) {
      addPropsResult.attr!.attributes = attributes.attrs!;
    }
    attrs.push(addPropsResult.attr!);
  }
  return { error: "", attrs };
};
export const getFormApiFromForm = async (
  dbConn: DBConnection,
  formId: string,
): Promise<{ error: string; form?: FormMetaData }> => {
  const collResult = await findVertexMGCall(dbConn, "Coll", IdAttr, formId);
  if (collResult.error) {
    return { error: "coll not found" };
  }
  const coll = collResult.vertex!;
  const attrsResult = await getCollectionOneLevelAttrs(dbConn, coll);
  if (attrsResult.error) {
    return { error: attrsResult.error };
  }

  return {
    error: "",
    form: {
      attributes: attrsResult.attrs!,
      [IdAttr]: coll.P[IdAttr],
      title: coll.P.title,
      isRealTime: coll.P.isRealTime,
      // collection used in Grid, its same like id key
      // @ts-ignore
      collection: coll.P[IdAttr],
    },
  };
};

export function newRow(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  txnId: number,
  parentVertex: Node,
  label: string,
  edgeType?: string,
  properties?: { [key: string]: any },
): { error: boolean; vertexId?: Id; edgeId?: Id } {
  return batch(() => {
    const vertexNew = newVertex(
      getNewGraphId(),
      [label || edgeType!],
      properties,
    );
    const insertVertex = addNewVertex(graph, setGraph, txnId, vertexNew);
    if (insertVertex.error) {
      console.error(insertVertex.error);
      return {
        error: true,
      };
    }

    const edgeNew = newEdge(
      getNewGraphId(),
      edgeType || label!,
      {},
      parentVertex.id,
      vertexNew.id,
    );
    const insertEdgeResult = addNewEdge(graph, setGraph, txnId, edgeNew);
    if (insertEdgeResult.error) {
      console.error(insertEdgeResult.error);
      return {
        error: true,
        vertexId: vertexNew.id,
      };
    }
    return {
      error: false,
      vertexId: vertexNew.id,
      edgeId: edgeNew.id,
    };
  });
}

// TODO: when meta changed realtime its not updating.
// TODO:
export function componentProps(metaVertex: Node, data: Node) {
  const meta = metaVertex.P.meta.split("+");
  const results = [] as { [key: string]: any }[];
  for (const metaPart of meta) {
    const metaRows = getSelectionOptions([data], metaPart).vertexes || [];
    const metaData = getComponentProperties(metaRows);
    results.push(metaData);
  }
  return results.reduce(
    (acc, curr) => {
      Object.assign(acc, curr);
      return acc;
    },
    {} as { [key: string]: any },
  );
}

// add meta from vertex value:
// TODO
export function addMeta(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  metaVertex: Node,
  data: Node,
) {
  if (metaVertex.P.meta) {
    const metaData = componentProps(metaVertex, data);
    const metaDataVal = removeUndefinedProperties(metaData, false, 10);
    untrack(() => {
      const newMetaData = Object.assign(
        {},
        // when component is rendered dynamically graph.vertexes[metaVertex.P.templateId] value is undefined
        graph.vertexes[metaVertex.P.templateId]?.P?.props || {},
        metaDataVal,
      );
      mergeVertexProperties(graph, setGraph, getNewTxnId(), metaVertex.id, {
        props: newMetaData,
      });
    });
  }
}

export async function getPkForCollection(
  dbConn: DBConnection,
  collVertex: Node,
) {
  const pks =
    (await getChildVertexes(dbConn, ["$0Pk"], [collVertex])).vertexes || [];
  return pks.map((pk) => pk.P.name);
}

export async function getNameKeyForCollection(
  dbConn: DBConnection,
  collVertex: Node,
) {
  const pks =
    (await getChildVertexes(dbConn, ["$0NameKey"], [collVertex])).vertexes ||
    [];
  return pks.map((pk) => pk.P.name);
}

export async function deleteRow(
  dbConn: DBConnection,
  vertex: Node,
  isRealTime: boolean,
  txnId: number,
) {
  // delete all vertex in edges
  const inEdgesResult = await getOutEdges(dbConn, vertex.id, "", {
    isInward: true,
  });
  for (const [relationShip, node] of inEdgesResult.pairs || []) {
    const deleteEdgeResult = await deleteRelationShipMGCall(
      dbConn,
      relationShip.id,
    );
    if (deleteEdgeResult?.error) console.error(deleteEdgeResult.error);
  }
  // delete all outEdges of vertex
  const outEdgesResult = await getOutEdges(dbConn, vertex.id, "");
  for (const [relationShip, node] of outEdgesResult.pairs || []) {
    const deleteEdgeResult = await deleteRelationShipMGCall(
      dbConn,
      relationShip.id,
    );
    if (deleteEdgeResult?.error) console.error(deleteEdgeResult.error);
  }

  // delete vertex:
  const deleteResult = await deleteNodeMGCall(dbConn, vertex.id);
  if (deleteResult.error) console.error(deleteResult.error);
}

export function deleteRowLocal(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  txnId: number,
  vertex: Node,
) {
  batch(() => {
    // delete all vertex in edges
    const inEdges = vertex.IN;
    for (const type in inEdges) {
      for (const edgeId of inEdges[type]) {
        const deleteEdgeResult = deleteEdge(graph, setGraph, txnId, edgeId);
        if (deleteEdgeResult?.error) console.error(deleteEdgeResult.error);
      }
    }
    // delete all outEdges of vertex
    const outEdge = vertex.OUT;
    for (const type in outEdge) {
      for (const edgeId of outEdge[type]) {
        const deleteEdgeResult = deleteEdge(graph, setGraph, txnId, edgeId);
        if (deleteEdgeResult?.error) console.error(deleteEdgeResult.error);
      }
    }

    // delete vertex:
    const deleteResult = deleteVertex(graph, setGraph, txnId, vertex.id);
    if (deleteResult.error) console.error(deleteResult.error);
  });
}

export const addMetaVertexes = (
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  txnId: number,
  vertex: Node,
  attributes: FieldAttribute[],
) => {
  for (const attribute of attributes) {
    // if (attribute?.props?.skip) {
    //   continue;
    // }

    const attr = klona(attribute);
    // @ts-ignore
    if (!attr.tab) attr.tab = "main";
    // @ts-ignore
    if (!attr.group) attr.group = "main";
    // if(attribute.component === "Table") attribute.group = attribute.id;

    const addAttributeResult = newRow(
      graph,
      setGraph,
      txnId,
      vertex,
      "MetaAttr",
      "MetaAttr",
      attr,
    );
    if (addAttributeResult.error) {
      console.error(addAttributeResult.error);
    }
    // todo discard transaction

    // if (attribute.component === "Table" && attribute.attributes) {
    if (attribute.attributes) {
      addMetaVertexes(
        graph,
        setGraph,
        txnId,
        graph.vertexes[addAttributeResult.vertexId!],
        attribute.attributes,
      );
    }
    // todo discard transaction
  }
};

//'setValue(component,null)'
export function getLabel(input: string) {
  input = input.replaceAll(" ", "");
  input = capitalizeFirstLetter(input);
  // TODO: letter make pascalCase letter
  return input;
}

export function getId(input: string) {
  input = input.replaceAll(" ", "");
  input = input.toLowerCase();
  // TODO: letter make pascalCase letter
  return input;
}

export function onChangeHandler(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  txnId: number,
  formVertex: Node,
  vertex: Node,
  changedFieldAttribute: Node,
) {
  if (!changedFieldAttribute.P.props?.onchange) return;
  const isNew = formVertex.id < 0;
  try {
    let args = JSON.parse(changedFieldAttribute.P.props.onchange);
    if (Array.isArray(args)) {
      // args in proper format.
    } else if (isObject(args)) {
      // TODO: Find the form is new or edit.
      if (args.new && isNew) {
        args = args.new;
      } else if (args.edit) {
        args = args.edit;
      } else {
        return;
      }
    }

    const attribute = (
      getSelectionOptions([changedFieldAttribute], "-MetaAttr->MetaAttr")
        .vertexes || []
    ).find((vertex: Node) => vertex.P[IdAttr] === args[0]);
    if (!attribute) {
      return;
    }
    let value = args[1];

    if (value === null) value = undefined;
    if (value === "label")
      value = getLabel(vertex.P[changedFieldAttribute.P[IdAttr]]);
    if (value === "id")
      value = getId(vertex.P[changedFieldAttribute.P[IdAttr]]);
    if (value === "clear") value = null;
    if (attribute.P.component == "Select" || attribute.P.component === "Tag") {
      setSelectionValue(graph, setGraph, txnId, vertex, attribute, value);
    } else {
      mergeVertexProperties(graph, setGraph, txnId, vertex.id, {
        [attribute.P[IdAttr]]: value,
      });
    }
  } catch (e) {}
}

export function getSublistRows(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  meta: Node,
  vertex?: Node,
) {
  if (!vertex) return [];
  // This should check for inward edges too
  const type = getToEdge(meta, vertex);
  return (
    getChildVertexesLocal(graph, setGraph, [`${type}`], [vertex]).vertexes || []
  ).sort((a, b) => a.P.pos - b.P.pos);
}

export function getSublistRowsForType(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  type: string,
  vertex: Node,
) {
  return (
    getChildVertexesLocal(graph, setGraph, [`${type}`], [vertex]).vertexes || []
  ).sort((a, b) => a.P.pos - b.P.pos);
}

export function setValueGlobal(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  txnId: number,
  attribute: Node,
  vertex: Node,
  data: any,
) {
  // after commit, we can not use same txnId();
  isUpdatingInput = true;
  mergeVertexProperties(graph, setGraph, txnId, vertex.id, {
    [attribute.P[IdAttr]]: data,
  });
  isUpdatingInput = false;
  // we directly save the dataType on vertex:
  setGraph("vertexes", vertex.id, "D", {
    [attribute.P[IdAttr]]: attribute.P["dataType"],
  });

  onChangeHandler(graph, setGraph, txnId, vertex, vertex, attribute);
  // if (isRealTime) commitTxn(txnId, ws);
}

export class Record {
  dbConn: DBConnection;
  graph: Store<IGraph>;
  setGraph: SetStoreFunction<IGraph>;
  txnId: number;
  readonly isRealTime: boolean;
  vertex: Node;
  meta?: Node;
  metaVertex: Node;

  constructor({
    dbConn,
    graph,
    setGraph,
    meta,
  }: {
    dbConn: DBConnection;
    graph: Store<IGraph>;
    setGraph: SetStoreFunction<IGraph>;
    meta?: Node;
  }) {
    this.txnId = getNewTxnId();
    this.isRealTime = false;
    this.dbConn = dbConn;
    this.graph = graph;
    this.setGraph = setGraph;
    this.meta = meta;
  }

  // create
  create = (
    label: string,
    properties?: { [key: string]: any },
  ): { error: string | boolean; vertex?: Node } => {
    if (!label) {
      // if (!form[IdAttr]) {
      return { error: "Label not found" };
    }
    if (this.isRealTime) {
      this.txnId = getNewTxnId();
    }
    const newVertexObj = newVertex(getNewGraphId(), [label], properties || {});
    // TODO: Do Create Transformation for the vertex
    const addNewVertexResult = addNewVertex(
      this.graph,
      this.setGraph,
      this.txnId,
      newVertexObj,
    );
    if (addNewVertexResult.error) {
      return addNewVertexResult;
    }
    // if (this.isRealTime) commitTxn(this.txnId, this.ws);
    this.vertex = this.graph.vertexes[newVertexObj.id];
    return {
      error: false,
      vertex: this.vertex,
    };
  };

  load = (id: number): { error: string | boolean; vertex?: Node } => {
    if (!this.graph.vertexes[id]) {
      return { error: "vertex not found" };
    }
    this.vertex = this.graph.vertexes[id];

    return {
      error: false,
      vertex: this.vertex,
    };
  };

  createMeta = (form: FormMetaData) => {
    const { attributes, ...custom } = form;

    // save attributes to vertexes
    const metaTxnId = getNewTxnId();
    if (this.meta) {
      this.metaVertex = this.meta;
    } else {
      const metaMainVertex = newVertex(getNewGraphId(), ["Temp"], custom);
      const { error } = addNewVertex(
        this.graph,
        this.setGraph,
        metaTxnId,
        metaMainVertex,
      );
      if (error) {
        console.error(error);
        return;
      }
      this.metaVertex = this.graph.vertexes[metaMainVertex.id];
    }

    addMetaVertexes(
      this.graph,
      this.setGraph,
      metaTxnId,
      this.metaVertex,
      attributes,
    );
    onCleanup(() => {
      revertTransaction(metaTxnId);
    });
    onCleanup(() => {
      if (!this.meta) {
        // TODO: Remove all the meta
      }
    });
  };

  commitTxn = () => {
    // TODO: currently we can only run this function once.
    // we need to set seperate txnId once commited. Fix this.
    // commitTxn(this.txnId, this.ws);
  };

  submitForm = () => {
    // we cant have validationGroup when doing code. can we register components on the fly to enable validations?
    // const result = validationGroup.validate();
    // if (result.isValid) {
    //  // !!!TODO!!! Handle Error Received From server when commit
    //  if (!this.isRealTime) {
    //   // commitTxn(this.txnId, this.ws);
    //  }
    // } else {
    //  console.error("please fix all errors");
    // }
    // return result.isValid;
  };
  cancelForm = () => {
    revertTransaction(this.txnId);
  };
  setValue = (
    graph: Store<IGraph>,
    setGraph: SetStoreFunction<IGraph>,
    attribute: Node,
    vertex: Node,
    data: any,
  ) => {
    setValueGlobal(graph, setGraph, this.txnId, attribute, vertex, data);
  };

  // TODO: Is this method valid? does it delete nested Rows set by this form?, check code written in NavDesigner component to clear the form.
  deleteAllRows = (edgeType: string) => {
    const vertexes =
      getChildVertexesLocal(
        this.graph,
        this.setGraph,
        [edgeType],
        [this.vertex],
      ).vertexes || [];
    for (const row of vertexes) {
      deleteRowLocal(this.graph, this.setGraph, this.txnId, row);
    }
  };

  // setFieldValue
  // getFieldValue
  //['getMacros', 'getMacro', 'executeMacro', 'id', 'type', 'isDynamic', 'isReadOnly', 'isNew', 'getMessageService', 'save', 'toJSON', 'toString', 'removeField', 'getFields', 'getSublist', 'getSublists', 'getSublistFields', 'getValue', 'setValue', 'getText', 'setText', 'getField', 'getSublistField', 'getLineCount', 'insertLine', 'removeLine', 'moveLine', 'findSublistLineWithValue', 'cancelLine', 'commitLine', 'selectLine', 'selectNewLine', 'getCurrentSublistValue', 'getSublistValue', 'setCurrentSublistValue', 'getCurrentSublistText', 'getSublistText', 'setCurrentSublistText', 'getCurrentSublistIndex', 'hasSubrecord', 'getSubrecord', 'removeSubrecord', 'hasSublistSubrecord', 'hasCurrentSublistSubrecord', 'getCurrentSublistSubrecord', 'removeCurrentSublistSubrecord', 'getCurrentSublistField', 'setMatrixHeaderValue', 'getMatrixHeaderValue', 'getMatrixSublistValue', 'setMatrixSublistValue', 'setCurrentMatrixSublistValue', 'getCurrentMatrixSublistValue', 'getMatrixHeaderField', 'getMatrixSublistField', 'findMatrixSublistLineWithValue', 'getMatrixHeaderCount', 'on', 'off']

  // "fields": [{ "name": "tobeprinted", "value": "F" }, {
  //   "name": "tobefaxed",
  //   "value": "F",
  //   "firechange": true
  //  }
  replaceFieldValues = (properties: { [key: string]: any }) => {
    replaceVertexProperties(
      this.graph,
      this.setGraph,
      this.txnId,
      this.vertex.id,
      properties,
    );
  };
  mergeFieldValues = (properties: { [key: string]: any }) => {
    mergeVertexProperties(
      this.graph,
      this.setGraph,
      this.txnId,
      this.vertex.id,
      properties,
    );
  };

  getSublist = (name: string) => {
    // return Sublist class, it will return sublist config. calling .getColumn('id') on it will return Column class
  };

  // Returns all the names of all the sublists.
  getSublists = (): string[] => [];

  // record.Record
  // Cancels the currently selected line on a sublist.
  cancelLine = (options: any) => {};

  // record.Record
  // Commits the currently selected line on a sublist.
  commitLine = (options: any) => {};

  // record.Record
  // Inserts a sublist line.
  insertLine = (options: {
    sublistId: string;
    line: number;
    ignoreRecalc: boolean;
  }) => {};

  // record.Record
  // Removes a sublist line.
  removeLine = (options: any) => {};

  // record.Record
  // Selects an existing line in a sublist.
  selectLine = (options: any) => {};

  // record.Record
  // selectNewLine = addNewLine + selectLine
  // Selects a new line at the end of a sublist.
  selectNewLine = (options: {
    sublistId: string;
    properties: { [key: string]: any };
  }) => {
    const newMeta = newRow(
      this.graph,
      this.setGraph,
      this.txnId,
      this.vertex,
      options.sublistId,
      options.sublistId,
      options.properties,
    );
  };

  // variables: oldValue, newValue

  addNewRowUI = (
    meta: Node,
    parentVertex: Node,
    properties: { [key: string]: any },
  ) => {
    return addNewRow(
      this.graph,
      this.setGraph,
      this.txnId,
      meta,
      parentVertex,
      properties,
      this.isRealTime,
      this.ws,
    );
  };

  getSublistRowsForType = (
    graph: Store<IGraph>,
    setGraph: SetStoreFunction<IGraph>,
    type: string,
    vertex: Node,
  ) => {
    return getSublistRowsForType(graph, setGraph, type, vertex);
  };
  getSublistRows = (
    graph: Store<IGraph>,
    setGraph: SetStoreFunction<IGraph>,
    meta: Node,
    vertex: Node,
  ) => {
    return getSublistRows(graph, setGraph, meta, vertex);
  };

  groupByTabsAndGroup = () => {
    const mainAttributes = getChildVertexesLocal(
      this.graph,
      this.setGraph,
      ["MetaAttr"],
      [this.metaVertex],
    ); //.sort((a, b) => a.P.pos - b.P.pos);

    const groupByTabs = groupBy(
      mainAttributes.vertexes!,
      (item) => item.P.tab!,
    ) as unknown as {
      [tab: string]: Node[];
    };

    const groupByTabsAndGroup = {} as {
      [tab: string]: { [group: string]: Node[] };
    };
    for (const tab in groupByTabs) {
      groupByTabsAndGroup[tab] = groupBy(
        groupByTabs[tab]!,
        (item) => item.P.group!,
      ) as unknown as {
        [group: string]: Node[];
      };
    }
    return groupByTabsAndGroup;
  };

  getMetaAttributes = (meta: Node) =>
    getChildVertexesLocal(this.graph, this.setGraph, ["MetaAttr"], [meta])
      .vertexes || [];
}

// 'type' or 'label' can be overwritten in the meta.
export const addNewRow = (
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  txnId: number,
  meta: Node,
  parentVertex: Node,
  properties: { [key: string]: any },
  isRealTime: boolean,
  Ws: ServerEventsDispatcher,
) => {
  // if (isRealTime) {
  //  txnId = getNewTxnId();
  // }
  const type = getToEdge(meta, parentVertex);
  const label = getValueFromVertexOrKey(meta.P.props || {}, "label");

  const newRowResult = newRow(
    graph,
    setGraph,
    txnId,
    parentVertex,
    label,
    type,
    properties,
  );
  // if (isRealTime) commitTxn(txnId, Ws);
  return newRowResult;
};

export interface IFormContext {
  cleanUpConfig: { [key: string]: any };
  record: Record;
}

export const FormContext = createContext({} as IFormContext);
export const PageContext = createContext({} as { [key: string]: any });

export function rowMetaInitialize(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  joinVertex: Node,
  meta: Node,
  tableColumnsTemplate: Node[],
) {
  const rowMetaAttrInst = getChildVertexLocal(
    graph,
    setGraph,
    ["AttrInst"],
    joinVertex,
  );
  if (rowMetaAttrInst.error) {
    const rows = {} as { [key: Id]: Id };
    const metaTxnId = getNewTxnId();
    batch(() => {
      const metaInstanceResult = newRow(
        graph,
        setGraph,
        metaTxnId,
        joinVertex,
        "AttrInst",
      );
      if (metaInstanceResult.error) {
        console.error("Error creating a row for attribute instance");
      }
      mergeVertexProperties(
        graph,
        setGraph,
        metaTxnId,
        metaInstanceResult.vertexId!,
        {
          templateId: meta.id,
        },
      );

      for (const attrColumn of tableColumnsTemplate) {
        const AttrRowResult = newRow(
          graph,
          setGraph,
          metaTxnId,
          graph.vertexes[metaInstanceResult.vertexId!],
          "MetaAttr",
        );
        if (AttrRowResult.error) {
          console.error(AttrRowResult.error);
        }
        const P = klona(attrColumn.P);
        P.templateId = attrColumn.id;

        if (!P.component) {
          const component = getCollAttrCompLocal(graph, setGraph, attrColumn)
            ?.P[IdAttr];
          if (component) P.component = component;
        }
        mergeVertexProperties(
          graph,
          setGraph,
          metaTxnId,
          AttrRowResult.vertexId!,
          P,
        );
        // @ts-ignore
        rows[attrColumn.id] = AttrRowResult.vertexId!;
      }
      mergeVertexProperties(
        graph,
        setGraph,
        metaTxnId,
        metaInstanceResult.vertexId!,
        { rows, metaTxnId },
      );
    });
    onCleanup(() => {
      // remove all AttrInst vertex.
      // TODO: This is breaking when new row is added, its interesting to fix this.
      // console.log('called', metaTxnId)
      // revertTransaction(metaTxnId);
    });
    return metaTxnId;
  } else {
    const rows = klona(rowMetaAttrInst.vertex!.P.rows);
    const metaTxnId = rowMetaAttrInst.vertex!.P.metaTxnId;
    batch(() => {
      for (const attrColumn of tableColumnsTemplate) {
        if (rows[attrColumn.id]) {
          continue;
        }
        const AttrRowResult = newRow(
          graph,
          setGraph,
          metaTxnId,
          graph.vertexes[rowMetaAttrInst.vertex!.id],
          "MetaAttr",
        );
        if (AttrRowResult.error) {
          console.error(AttrRowResult.error);
        }
        const P = klona(attrColumn.P);
        P.templateId = attrColumn.id;

        if (!P.component) {
          const component = getCollAttrCompLocal(graph, setGraph, attrColumn)
            ?.P[IdAttr];
          if (component) P.component = component;
        }
        mergeVertexProperties(
          graph,
          setGraph,
          metaTxnId,
          AttrRowResult.vertexId!,
          P,
        );
        rows[attrColumn.id] = AttrRowResult.vertexId!;
      }
      mergeVertexProperties(
        graph,
        setGraph,
        metaTxnId,
        rowMetaAttrInst.vertex!.id,
        { rows },
      );
    });
    onCleanup(() => {
      // remove all AttrInst vertex.
      // TODO: This is breaking when new row is added, its interesting to fix this.
      // console.log('called', metaTxnId)
      // revertTransaction(metaTxnId);
    });
    return metaTxnId;
  }
}

export const getFormMetaData = async (dbConn: DBConnection, formId: string) => {
  let form =
    AttrsTableData[formId] ||
    (AdminAttrKeys.includes(formId) && AttrsAdminTableData[formId]);

  if (!form) {
    const formResult = await getFormApiFromForm(dbConn, formId);
    if (formResult.error) return formResult;
    form = formResult.form!;
  }
  return { error: false, form };
};

export function getStringComponentLocal(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  attrDataTypeVertex?: Node,
) {
  if (!attrDataTypeVertex) {
    attrDataTypeVertex = findVertexByLabelAndUniqueId(
      graph,
      "DataType",
      "name",
      "String",
    );
    if (!attrDataTypeVertex) {
      return;
    }
  }
  return getChildVertexLocal(graph, setGraph, ["$0Default"], attrDataTypeVertex)
    .vertex;
}

export async function getStringComponent(
  dbConn: DBConnection,
  attrDataTypeVertex?: Node,
) {
  if (!attrDataTypeVertex) {
    const attrDataTypeVertexResult = await findVertexMGCall(
      dbConn,
      "DataType",
      "name",
      "String",
    );
    if (attrDataTypeVertexResult.error) {
      return;
    }
    attrDataTypeVertex = attrDataTypeVertexResult.vertex!;
  }
  return (await getChildVertex(dbConn, ["$0Default"], attrDataTypeVertex))
    .vertex;
}

export function getCollAttrCompLocal(
  graph: Store<IGraph>,
  setGraph: SetStoreFunction<IGraph>,
  attrVertex: Node,
): Node | undefined {
  const attrComp = getChildVertexLocal(
    graph,
    setGraph,
    ["$0Comp"],
    attrVertex,
  ).vertex;
  if (attrComp) return attrComp;

  let attrDataTypeVertex = getChildVertexLocal(
    graph,
    setGraph,
    ["$0DataType"],
    attrVertex,
  ).vertex;
  return getStringComponentLocal(graph, setGraph, attrDataTypeVertex);
}

export async function getCollAttrComp(
  dbConn: DBConnection,
  attrVertex: Node,
): Promise<Node | undefined> {
  const attrComp = (await getChildVertex(dbConn, ["$0Comp"], attrVertex))
    .vertex;
  if (attrComp) return attrComp;

  let attrDataTypeVertex = (
    await getChildVertex(dbConn, ["$0DataType"], attrVertex)
  ).vertex;
  return getStringComponent(dbConn, attrDataTypeVertex);
}
