import { JSX, createMemo, createUniqueId, For, onCleanup, splitProps, useContext } from "solid-js";
import { Link, useNavigate } from "@solidjs/router";
import {
  commitTxn,
  getNewGraphId,
  getNewTxnId,
  graph,
  Id, IdAttr,
  Vertex
} from "../lib/graph";
import { removeUndefinedProperties } from "../utils/functions";

import { DynamicFormSequence, DynamicFormSequenceProps } from "./dynamicForm";
import { AlertMessageContext } from "../appState";
import { Alert } from "../Type";
import { WsContext, WSEvent } from "./ws_events_dispatcher";
import { SelectInputField, setParentValue, setSelectionValue } from "./input/SelectInputField";
import { AttrsTableData } from "./api";
import csvtojson from "csvtojson";
import {
  addNewVertex,
  findVertexByLabelAndUniqueId,
  mergeVertexProperties,
  newVertex,
  replaceVertexProperties,
} from "../lib/Vertex";
import { A, D } from "@mobily/ts-belt";
import { deleteRow, newRow } from "./input/TableInputField";
import { klona } from "klona";
import { getChildVertex, getChildVertexes, getOptionLabel, getParentVertex, getToEdge } from "../lib/Traverse";
import { ButtonField } from "./core/Button";
import { ValidationRule } from "devextreme/common";

// TODO make default component property applied to
export const AllForms = () => {
  const allForms = () => graph.vertexLabelIdMap["Form"]?.map((formVertex) => graph.vertexes[formVertex]) || [];

  return (
    <div class="">
      <For<Vertex[]> each={allForms()}>{(form) => <Link href={`/${form.properties[IdAttr]}/new`}>{form.properties[IdAttr]}</Link>}</For>
    </div>
  );
};

export interface FieldAttribute {
  name: string;
  tab?: string;
  group?: string;
  dataType?: string;
  meta?: string;
  component: string;
  displayName?: string;
  props?: {
    [key: string]: any;
    validationRules?: Array<ValidationRule>;
  };
  // postSubmit?: (formValues: IFormGroup, formGroup: IFormGroup, tableItemFormGroup: IFormGroup, values: FormResult)=>void
  attributes?: FieldAttribute[];
}

export interface FormMetaData {
  name: string; // required to create new vertex
  title: string;
  attributes: FieldAttribute[];
  local?: boolean;
  // postSubmit?: (data: any) => any
}

export function getCollAttrs(
  vertexCollAttr: Vertex,
  vertexFormAttr?: Vertex,
): { error: boolean; attr?: FieldAttribute } {
  const attr = Object.assign(
    {},
    removeUndefinedProperties(vertexCollAttr.properties, false, 10),
    vertexFormAttr ? removeUndefinedProperties(vertexFormAttr.properties, false, 10) : {},
  );

  // find components for all levels
  const collAttrComp = getChildVertex(["$0Comp"], vertexCollAttr).vertex;
  const formAttrComp = vertexFormAttr
    ? getChildVertex(["$0Comp"], vertexFormAttr).vertex || collAttrComp
    : collAttrComp;

  // set dataType to attr
  const dataType = getChildVertex(["$0DataType"], vertexCollAttr);
  if (dataType.error) {
    if (!formAttrComp) {
      console.warn("data Type not found");
      return { error: true };
    }
    const dataTypeFromComp = getParentVertex(["DataTypeComp"], formAttrComp);
    if (dataTypeFromComp.error) {
      console.warn("data Type not found from Component");
      return { error: true };
    }
    attr.dataType = dataTypeFromComp.vertex!.properties[IdAttr];
  } else {
    attr.dataType = dataType.vertex!.properties[IdAttr];
  }

  // set props to attr
  let formProps = vertexFormAttr
    ? (getChildVertexes(["$0Prop"], [vertexFormAttr]).vertexes || []).reduce((acc, curr) => {
        const key = getOptionLabel(curr, "->$0Key:properties.key");
        if (key) {
          acc[key] = curr.properties.value;
        }
        return acc;
      }, {} as { [key: string]: any })
    : {};

  if (formAttrComp === collAttrComp) {
    const collProps = (getChildVertexes(["$0Prop"], [vertexCollAttr]).vertexes || []).reduce((acc, curr) => {
      const key = getOptionLabel(curr, "->$0Key:properties.key");
      if (key) {
        acc[key] = curr.properties.value;
      }
      return acc;
    }, {} as { [key: string]: any });
    formProps = Object.assign(
      {},
      removeUndefinedProperties(collProps, false, 10),
      removeUndefinedProperties(formProps, false, 10),
    );
  }

  // merge default component props
  const comp = formAttrComp;
  if (!comp) {
    console.warn("Component not configured");
    return { error: true };
  }

  const compProps = (getChildVertexes(["CompProp"], [comp]).vertexes || []).reduce((acc, curr) => {
    if (curr.properties.key) {
      acc[curr.properties.key] = curr.properties.value;
    }
    return acc;
  }, {} as { [key: string]: any });
  formProps = Object.assign({}, removeUndefinedProperties(compProps, false, 10), formProps);

  const parentVertexResult = getParentVertex(["CompChild"], comp);
  if (!parentVertexResult.error) {
    const parentCompProps = (getChildVertexes(["CompProp"], [parentVertexResult.vertex!]).vertexes || []).reduce(
      (acc, curr) => {
        if (curr.properties.key) {
          acc[curr.properties.key] = curr.properties.value;
        }
        return acc;
      },
      {} as { [key: string]: any },
    );
    formProps = Object.assign({}, removeUndefinedProperties(parentCompProps, false, 10), formProps);
    attr.component = parentVertexResult.vertex!.properties[IdAttr];
  } else {
    attr.component = comp.properties[IdAttr];
  }
  attr.props = formProps;
  return { error: false, attr };
}

export const getProps = (vertexFormAttr: Vertex): { error: boolean; attr?: FieldAttribute } => {
  const vertexCollAttrResult = getChildVertex(["$0Attr"], vertexFormAttr);
  if (vertexCollAttrResult.error) return { error: true };
  const vertexCollAttr = vertexCollAttrResult.vertex!;
  return getCollAttrs(vertexCollAttr, vertexFormAttr);
};

const getCollectionOneLevelAttrs = (collVertex: Vertex): { error: string; attrs?: FieldAttribute[] } => {
  const vertexCollAttrResult = getChildVertexes(["$0Attr"], [collVertex]);
  if (vertexCollAttrResult.error) {
    return { error: "No Attributes in a Coll" };
  }
  const collAttrs = vertexCollAttrResult.vertexes!.sort((a, b) => a.properties.pos - b.properties.pos);
  let attrs: FieldAttribute[] = [];

  for (const vertexCollAttr of collAttrs) {
    const addPropsResult = getCollAttrs(vertexCollAttr);
    if (addPropsResult.error) continue;
    attrs.push(addPropsResult.attr!);
  }
  return { error: "", attrs };
};
export const getFormApiFromForm = (formId: string): { error: string; form?: FormMetaData } => {
  const form = graph.vertexes[formId] || findVertexByLabelAndUniqueId("Form", IdAttr, formId);
  if (!form) {
    const coll = findVertexByLabelAndUniqueId("Coll", IdAttr, formId);
    if (!coll) {
      return { error: "form and coll not found" };
    }
    let attrs: FieldAttribute[];
    const attrsResult = getCollectionOneLevelAttrs(coll);
    if (attrsResult.error) {
      return { error: attrsResult.error };
    }
    attrs = attrsResult.attrs!;

    // calculate children
    const collChildren = (getChildVertexes(["$0Child"], [coll]).vertexes || []).sort(
      (a, b) => a.properties.pos - b.properties.pos,
    );

    const childAttrs = [] as FieldAttribute[];

    for (const vertexChild of collChildren) {
      const childCollVertex = getChildVertex(["$0Coll"], vertexChild).vertex;
      if (!childCollVertex) continue;

      let tableAttrs: FieldAttribute[];
      const attrsResult = getCollectionOneLevelAttrs(vertexChild);
      if (attrsResult.error) {
        return { error: attrsResult.error };
      }
      tableAttrs = attrsResult.attrs!;
      // @ts-ignore
      tableAttrs = tableAttrs.sort((a, b) => a.pos - b.pos);

      // table properties:
      const collChildProps = (getChildVertexes(["$0Prop"], [vertexChild]).vertexes || []).reduce((acc, curr) => {
        const key = getOptionLabel(curr, "->$0Key:properties.key");
        if (key) {
          acc[key] = curr.properties.value;
        }
        return acc;
      }, {} as { [key: string]: any });

      childAttrs.push({
        attributes: tableAttrs,
        component: "Table",
        [IdAttr]: vertexChild.properties[IdAttr] || childCollVertex.properties[IdAttr],
        props: collChildProps,
      });
    }

    return {
      error: "",
      form: {
        attributes: [...attrs, ...childAttrs],
        [IdAttr]: coll.properties[IdAttr],
        title: coll.properties.title,
        local: coll.properties.local,
        // collection used in Grid, its same like id key
        // @ts-ignore
        collection: coll.properties[IdAttr],
      },
    };
  }

  const formCollResult = getParentVertex(["CollForm"], form);
  if (formCollResult.error) {
    return { error: "Please Configure Collection in a Form" };
  }
  const formColl = formCollResult.vertex!;

  const formAttrsResult = getChildVertexes(["FormAttr"], [form]);
  if (formAttrsResult.error) {
    return { error: "No Attributes in a Form" };
  }
  const formAttrs = formAttrsResult.vertexes!.sort((a, b) => a.properties.pos - b.properties.pos);

  let attrs: FieldAttribute[] = [];

  for (const vertexFormAttr of formAttrs) {
    const addPropsResult = getProps(vertexFormAttr);
    if (addPropsResult.error) continue;
    attrs.push(addPropsResult.attr!);
  }
  // @ts-ignore
  // attrs = attrs.sort((a, b) => a.pos - b.pos); // why this is required?

  const formChildren = (getChildVertexes(["FormChild"], [form]).vertexes || []).sort(
    (a, b) => a.properties.pos - b.properties.pos,
  );

  const childAttrs = [] as FieldAttribute[];

  for (const vertexFormChild of formChildren) {
    const formChildAttrs = (getChildVertexes(["FormChildAttr"], [vertexFormChild]).vertexes || []).sort(
      (a, b) => a.properties.pos - b.properties.pos,
    );

    let tableAttrs: FieldAttribute[] = [];
    for (const vertexFormChildAttr of formChildAttrs) {
      const addPropsResult = getProps(vertexFormChildAttr);
      if (addPropsResult.error) continue;
      tableAttrs.push(addPropsResult.attr!);
    }
    // @ts-ignore
    tableAttrs = tableAttrs.sort((a, b) => a.pos - b.pos);

    const collChild = getChildVertex(["$0Coll"], vertexFormChild);
    if (collChild.error) {
      continue;
    }

    const collChildColl = getChildVertex(["CollChildColl"], collChild.vertex!);
    if (collChildColl.error) {
      continue;
    }
    // currently we save table property on Collection only, not overwrite by form layout
    const collChildProps = (getChildVertexes(["$0Prop"], [collChild.vertex!]).vertexes || []).reduce((acc, curr) => {
      const key = getOptionLabel(curr, "->$0Key:properties.key");
      if (key) {
        acc[key] = curr.properties.value;
      }
      return acc;
    }, {} as { [key: string]: any });

    childAttrs.push({
      attributes: tableAttrs,
      component: "Table",
      [IdAttr]: collChild.vertex!.properties[IdAttr] || collChildColl.vertex!.properties[IdAttr],
      props: collChildProps,
    });
  }

  return {
    error: "",
    form: {
      attributes: [...attrs, ...childAttrs],
      [IdAttr]: formColl.properties[IdAttr],
      title: form.properties.title,
      local: form.properties.local,
      // collection used in Grid, its same like id key
      // @ts-ignore
      collection: formColl.properties[IdAttr],
    },
  };
};

interface AbstractSingleFormProps extends Omit<DynamicFormSequenceProps, "form" | "id"> {
  formId: string;
  id: string | number;
}

export const AbstractSingleForm = (props: AbstractSingleFormProps) => {
  // TODO: add validation on form that AttrsTableData keys should not available.
  let form = AttrsTableData[props.formId];

  if (!form) {
    const formResult = getFormApiFromForm(props.formId);
    if (formResult.error) return formResult.error;
    form = formResult.form!;
  }
  console.log(form);
  const [p, customProps] = splitProps(props, ["formId", "id"]);

  const id = createMemo(() => (p.id === "new" ? undefined : parseInt(p.id as string)));
  return (
    <div class="">
      <DynamicFormSequence form={form!} id={id() as Id} {...customProps} config={props.config || {}} />
    </div>
  );
};

export const Login = (props: {}) => {
  const { setAlert } = useContext(AlertMessageContext);
  const { Ws } = useContext(WsContext);
  const navigate = useNavigate();
  const event = ["post", "login", 0] as WSEvent;
  Ws.bind(event, (data) => {
    if (data.error) {
      setAlert((prev) => [
        ...prev,
        {
          id: createUniqueId(),
          state: Alert.Error,
          message: data.error,
        },
      ]);
    } else {
      navigate("/");
    }
  });
  onCleanup(() => Ws.unbind(event));

  const config = {} as { vertex: Vertex };
  const onLoginClick = () => {
    const email = config.vertex.properties.email as string;
    const password = config.vertex.properties.password as string;
    Ws.trigger([[event, { body: { email, password } }]]);
    // revertTransaction(txnId)
  };

  return (
    <>
      <AbstractSingleForm
        formId={"LogIn"}
        id="new"
        config={config}
        // TODO: add dry option
      />
      <ButtonField
        meta={
          {
            properties: {
              [IdAttr]: "meta",
              props: { stylingMode: "contained", width: "120", type: "success" },
            },
          } as unknown as Vertex
        }
        data={{ properties: { meta: "Login" } } as unknown as Vertex}
        onClick={onLoginClick}
      />
    </>
  );
};
export const Logout = (props: {}) => {
  const { setAlert } = useContext(AlertMessageContext);
  const { Ws } = useContext(WsContext);
  const navigate = useNavigate();
  const event = ["post", "logout", 0] as WSEvent;

  Ws.bind(event, (data) => {
    if (data.error) {
      setAlert((prev) => [...prev, { id: createUniqueId(), state: Alert.Error, message: data.error }]);
    } else {
      Ws.isLoggedIn(false);
      navigate("/");
    }
  });
  Ws.trigger([[event, {}]]);
  onCleanup(() => Ws.unbind(event));
  return <>Logging out...</>;
};

export const SignUp = (props: {}) => {
  const { setAlert } = useContext(AlertMessageContext);
  const { Ws } = useContext(WsContext);
  const navigate = useNavigate();
  const event = ["post", "register", 0] as WSEvent;
  Ws.bind(event, (data) => {
    if (data.error) {
      setAlert((prev) => [...prev, { id: createUniqueId(), state: Alert.Error, message: data.error }]);
    } else {
      navigate("/");
    }
  });
  onCleanup(() => Ws.unbind(event));
  // TODO:
  // 1. Save button text
  // 2. disable save button when submitting
  // 3. validations
  // 4. clear form on success
  // 5. make password not visible

  const config = {} as { vertex: Vertex };
  const onSignupClick = () => {
    const email = config.vertex.properties.email as string;
    const password = config.vertex.properties.password as string;
    Ws.trigger([[event, { body: { email, password } }]]);
    // revertTransaction(txnId);
  };

  return (
    <>
      <AbstractSingleForm
        formId={"SignUp"}
        id="new"
        config={config}
        // TODO: add dry option
      />
      <ButtonField
        meta={
          {
            properties: {
              [IdAttr]: "meta",
              props: { stylingMode: "contained", width: "120", type: "success" },
            },
          } as unknown as Vertex
        }
        data={{ properties: { meta: "SignUp" } } as unknown as Vertex}
        onClick={onSignupClick}
      />
    </>
  );
};

const isEmpty = (object: { [key: string]: any }) => !Object.values(object).some((x) => x !== null && x !== "");

function findOrCreateNewVertex(txnId: number, label: string, lookupId: string, lookUpUniqueValue: string) {
  let existingVertex = (graph.vertexLabelIdMap[label] || [])
    .map((vertexId) => graph.vertexes[vertexId])
    .find((vertex) => vertex.properties[lookupId] === lookUpUniqueValue);
  if (!existingVertex) {
    const vertexId = getNewGraphId();
    addNewVertex(txnId, newVertex(vertexId, [label], { [lookupId]: lookUpUniqueValue }));
    existingVertex = graph.vertexes[vertexId];
  }
  return existingVertex;
}

export const SimpleImport = (props: {}) => {
  // const { setAlert } = useContext(AlertMessageContext);
  // const navigate = useNavigate();
  const { Ws } = useContext(WsContext);
  const config = {} as { vertex: Vertex };

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

  const onDataDirectoryImportClick = () => {
    const csvResult = config.vertex.properties.csv as string;
    const label = config.vertex.properties.label as string;
    const dry = config.vertex.properties.dry as boolean;
    const lookup = config.vertex.properties.lookup as string;
    const lookupId = config.vertex.properties.lookupId as string;
    const lookupChild = config.vertex.properties.lookupChild as string;
    if (!label) {
      alert('label cant be blank');
      return;
    }

    const txnId = getNewTxnId();

    const converter = csvtojson({
      trim: true,
      // checkColumn: true,
      delimiter: [",", "\t"],
    });

    const metaData = getChildVertexes(["$0Meta"], [config.vertex]);
    if (metaData.error) {
      return;
    }
    const normalizeMeta = metaData.vertexes!.map((metaVertex) => {
      const column = metaVertex.properties.column as string;
      // attribute may not exist before, in that case write ID
      let attrId = metaVertex.properties.attrId;
      if (!attrId) {
        const attributeVertex = getChildVertex(["$0Attr"], metaVertex);
        if (!attributeVertex.error) {
          attrId = attributeVertex.vertex?.properties[IdAttr];
        }
      }

      let collId = metaVertex.properties.collId || IdAttr;

      // collection may not exist before, in that case write Label
      let collLabel = metaVertex.properties.collLabel;

      if (!attrId && !collLabel && !metaVertex.properties.skip) {
        alert("attrId or collLabel is required");
      }
      const collVertex = getChildVertex(["$0Coll"], metaVertex);
      if (!collVertex.error) {
        collLabel = collVertex.vertex?.properties[collId];
      }
      return {
        column,
        attrId,
        collLabel,
        collId,
        inward: metaVertex.properties.inward,
        func: metaVertex.properties.func,
        edge: metaVertex.properties.edge,
        skip: metaVertex.properties.skip,
        skipRow: metaVertex.properties.skipRow?.split?.("\n") || [],
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
          const existingVertex = (graph.vertexLabelIdMap[meta.collLabel] || [])
            .map((vertexId) => graph.vertexes[vertexId])
            .find((vertex) => vertex.properties[meta.collId] === value);
          if (!existingVertex) {
            addNewVertex(
              txnId,
              newVertex(getNewGraphId(), [meta.collLabel], {
                [meta.collId]: value,
              }),
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
          const type = getToEdge({ properties: { [IdAttr]: labelName } } as Vertex, mainVertex);
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
                componentString,
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
                  properties: { [IdAttr]: selectMeta.collLabel },
                } as unknown as Vertex,
                componentVertex.id,
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
                    properties: { [IdAttr]: selectMeta.collLabel },
                  } as unknown as Vertex,
                  lookup.id,
                );
              }
            }
          } else if (selectMeta.inward) {
            setParentValue(
              txnId,
              vertex,
              {
                properties: { props: { parentLabel: selectMeta.collLabel, childLabel: selectMeta.edge } },
              } as unknown as Vertex,
              v()!.id,
            );
          } else {
            setSelectionValue(
              txnId,
              vertex,
              {
                properties: { [IdAttr]: selectMeta.edge || selectMeta.collLabel },
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

  return (
    <>
      <SelectInputField
        data={{ properties: {} } as Vertex}
        meta={
          {
            properties: {
              [IdAttr]: "import",
              props: {
                stringValue: true,
                displayExpr: "name",
                collection:
                  '[{"name": "dataType"},{"name": "component"},{"name": "dataTypeDefault"},{"name": "lookup"},{"name": "attribute"}]',
              },
            },
          } as unknown as Vertex
        }
        setValue={(attr, data) => {
          const txnId = getNewTxnId();
          const dry = true;
          const vertexes = getChildVertexes(["SimpleImportMeta"], [config.vertex]).vertexes || [];
          for (const row of vertexes) {
            deleteRow(row, false, true, 0, Ws);
          }
          switch (data) {
            case "component": {
              replaceVertexProperties(txnId, config.vertex.id, {
                label: "Comp",
                dry,
              });
              const newMeta1 = newRow(txnId, config.vertex, "SimpleImportMeta");
              // to store parent components.
              replaceVertexProperties(txnId, newMeta1.vertexId!, {
                column: "parent",
                collLabel: "Comp",
                collId: IdAttr,
                edge: "Child",
                inward: true,
              });
              const newMeta2 = newRow(txnId, config.vertex, "SimpleImportMeta");
              // to store parent components.
              replaceVertexProperties(txnId, newMeta2.vertexId!, {
                column: "category",
                collLabel: "CompCategory",
                collId: IdAttr,
                inward: true,
              });
              const newMeta3 = newRow(txnId, config.vertex, "SimpleImportMeta");
              // to store parent components.
              replaceVertexProperties(txnId, newMeta3.vertexId!, {
                column: "dataType",
                collLabel: "DataType",
                collId: IdAttr,
                inward: true,
              });

              break;
            }
            case "dataType": {
              replaceVertexProperties(txnId, config.vertex.id, {
                label: "DataType",
                dry,
              });
              break;
            }
            case "dataTypeDefault": {
              replaceVertexProperties(txnId, config.vertex.id, {
                label: "DataType",
                dry,
              });
              const newMeta1 = newRow(txnId, config.vertex, "SimpleImportMeta");
              replaceVertexProperties(txnId, newMeta1.vertexId!, {
                column: "default",
                collLabel: "Comp",
                edge: "default",
                collId: IdAttr,
              });
              break;
            }
            case "lookup": {
              replaceVertexProperties(txnId, config.vertex.id, {
                label: "Coll",
                lookup: "LookupName",
                lookupId: IdAttr,
                dry,
              });
              const newMeta1 = newRow(txnId, config.vertex, "SimpleImportMeta");
              replaceVertexProperties(txnId, newMeta1.vertexId!, {
                column: "StandardLookupValue",
                attrId: IdAttr,
              });
              const newMeta2 = newRow(txnId, config.vertex, "SimpleImportMeta");
              replaceVertexProperties(txnId, newMeta2.vertexId!, {
                column: "Definition",
                attrId: "description",
              });
              break;
            }
            case "attribute": {
              replaceVertexProperties(txnId, config.vertex.id, {
                label: "Coll",
                lookup: "ResourceName",
                lookupChild: "Attr",
                lookupId: IdAttr,
                dry,
              });
              const newMeta1 = newRow(txnId, config.vertex, "SimpleImportMeta");
              replaceVertexProperties(txnId, newMeta1.vertexId!, {
                column: "StandardName",
                attrId: IdAttr,
              });
              const newMeta2 = newRow(txnId, config.vertex, "SimpleImportMeta");
              replaceVertexProperties(txnId, newMeta2.vertexId!, {
                column: "DisplayName",
                attrId: "displayName",
              });
              const newMeta3 = newRow(txnId, config.vertex, "SimpleImportMeta");
              replaceVertexProperties(txnId, newMeta3.vertexId!, {
                column: "Definition",
                attrId: "definition",
              });

              const newMeta4 = newRow(txnId, config.vertex, "SimpleImportMeta");
              replaceVertexProperties(txnId, newMeta4.vertexId!, {
                column: "SimpleDataType",
                collLabel: "Comp",
                collId: IdAttr,
                func: "component",
              });
              // TODO: Point Groups to Group Tab
              // const newMeta5 = newRow(txnId, config.vertex, "SimpleImportMeta");
              // replaceVertexProperties(txnId, newMeta5.vertexId!, {
              //   column: "Groups",
              //   // think how to make this work?
              //   // collLabel: "CollGroup",
              //   // collId: IdAttr,
              //   // inward: true
              //   skip: true
              // });

              replaceVertexProperties(txnId, newRow(txnId, config.vertex, "SimpleImportMeta").vertexId!, {
                column: "SourceResource",
                skip: true,
              });
              replaceVertexProperties(txnId, newRow(txnId, config.vertex, "SimpleImportMeta").vertexId!, {
                column: "SugMaxLength",
                skip: true,
              });
              replaceVertexProperties(txnId, newRow(txnId, config.vertex, "SimpleImportMeta").vertexId!, {
                column: "SugMaxPrecision",
                skip: true,
              });
              replaceVertexProperties(txnId, newRow(txnId, config.vertex, "SimpleImportMeta").vertexId!, {
                column: "Synonyms",
                skip: true,
              });
              replaceVertexProperties(txnId, newRow(txnId, config.vertex, "SimpleImportMeta").vertexId!, {
                column: "FrenchCanadianDisplayName",
                skip: true,
              });
              replaceVertexProperties(txnId, newRow(txnId, config.vertex, "SimpleImportMeta").vertexId!, {
                column: "LookupStatus",
                skip: true,
              });
              replaceVertexProperties(txnId, newRow(txnId, config.vertex, "SimpleImportMeta").vertexId!, {
                column: "LookupName",
                skip: true,
              });
              replaceVertexProperties(txnId, newRow(txnId, config.vertex, "SimpleImportMeta").vertexId!, {
                column: "RepeatingElement",
                skip: true,
              });
              replaceVertexProperties(txnId, newRow(txnId, config.vertex, "SimpleImportMeta").vertexId!, {
                column: "payload",
                skip: true,
              });
              replaceVertexProperties(txnId, newRow(txnId, config.vertex, "SimpleImportMeta").vertexId!, {
                column: "TargetResourceKey",
                skip: true,
              });
              replaceVertexProperties(txnId, newRow(txnId, config.vertex, "SimpleImportMeta").vertexId!, {
                column: "SourceResourceKey",
                skip: true,
              });
              replaceVertexProperties(txnId, newRow(txnId, config.vertex, "SimpleImportMeta").vertexId!, {
                column: "BEDES",
                skip: true,
              });
              break;
            }
            default: {
            }
          }
        }}
      />
      <AbstractSingleForm id={"new"} formId={"SimpleImport"} config={config} />

      <div></div>

      <ButtonField
        meta={
          {
            properties: {
              [IdAttr]: "meta",
              props: { stylingMode: "contained", width: "120", type: "success" },
            },
          } as unknown as Vertex
        }
        data={{ properties: { meta: "Import" } } as unknown as Vertex}
        onClick={onDataDirectoryImportClick}
      />
    </>
  );
};
export const addMetaVertexes = (txnId: number, vertex: Vertex, attributes: FieldAttribute[]) => {
  for (const attribute of attributes) {
    // if (attribute?.props?.skip) {
    //   continue;
    // }

    const addAttributeResult = newRow(txnId, vertex, "MetaAttr");
    if (addAttributeResult.error) {
      alert(addAttributeResult.error);
    }
    // todo discard transaction

    const attr = klona(attribute);
    if (!attr.tab) attr.tab = "main";
    if (!attr.group) attr.group = "main";
    // if(attribute.component === "Table") attribute.group = attribute.id;

    mergeVertexProperties(txnId, addAttributeResult.vertexId!, attr);

    if (attribute.component === "Table" && attribute.attributes) {
      addMetaVertexes(txnId, graph.vertexes[addAttributeResult.vertexId!], attribute.attributes);
    }
    // todo discard transaction
  }
};
