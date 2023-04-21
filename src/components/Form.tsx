import {
  createMemo,
  createUniqueId,
  For,
  onCleanup,
  splitProps,
  useContext
} from "solid-js";
import { Link, useNavigate } from "@solidjs/router";
import {
  commitTxn,
  getNewGraphId,
  getNewTxnId,
  graph,
  Vertex
} from "../lib/graph";
import { removeUndefinedProperties } from "../utils/functions";

import { DynamicFormSequence, DynamicFormSequenceProps } from "./dynamicForm";
import { AlertMessageContext } from "../appState";
import { Alert } from "../Type";
import { WsContext, WSEvent } from "./ws_events_dispatcher";
import {
  SelectInputField,
  setParentValue,
  setSelectionValue
} from "./input/SelectInputField";
import { AttrsTableData } from "./api";
import csvtojson from "csvtojson";
import {
  addNewVertex,
  findVertexByLabelAndUniqueId,
  mergeVertexProperties,
  newVertex,
  replaceVertexProperties
} from "../lib/Vertex";
import { A, D } from "@mobily/ts-belt";
import { deleteRow, newRow } from "./input/TableInputField";
import { klona } from "klona";
import {
  getChildVertex,
  getChildVertexes,
  getOptionLabel,
  getParentVertex
} from "../lib/Traverse";
import { ButtonField } from "./core/Button";
import { ValidationRule } from "devextreme/common";

// TODO make default component property applied to
export const AllForms = () => {
  const allForms = () => graph.vertexLabelIdMap["Form"]?.map((formVertex) => graph.vertexes[formVertex]) || [];

  return (
    <div class="">
      <For each={allForms()}>{(form) => <Link href={`/${form.properties.id}/new`}>{form.properties.id}</Link>}</For>
    </div>
  );
};

export interface FieldAttribute {
  id: string;
  tab?: string;
  group?: string;
  dataType?: string;
  meta?: string;
  component: string;
  title?: string;
  props?: {
    [key: string]: any
    validationRules?: Array<ValidationRule>
  };
  // postSubmit?: (formValues: IFormGroup, formGroup: IFormGroup, tableItemFormGroup: IFormGroup, values: FormResult)=>void
  attributes?: FieldAttribute[];
}

export interface FormMetaData {
  id: string; // required to create new vertex
  title: string;
  attributes: FieldAttribute[];
  local?: boolean;
  // postSubmit?: (data: any) => any
}

export function getCollAttrs(vertexCollAttr: Vertex, vertexFormAttr?: Vertex): { error: boolean; attr?: FieldAttribute } {
  const vertexAttrResult = getChildVertex(["CollAttrAttr"], vertexCollAttr);
  if (vertexAttrResult.error) return { error: true };
  const vertexAttr = vertexAttrResult.vertex!;
  const attr = Object.assign(
   {},
   removeUndefinedProperties(vertexAttr.properties, false, 10),
   removeUndefinedProperties(vertexCollAttr.properties, false, 10),
   vertexFormAttr ? removeUndefinedProperties(vertexFormAttr.properties, false, 10) : {}
  );

  // find components for all levels
  const vertexDefaultComp = getChildVertex(["AttrDataType", "DataTypeDefault"], vertexAttr);
  const attrComp = getChildVertex(["AttrComp"], vertexAttr).vertex || vertexDefaultComp.vertex;
  const collAttrComp = getChildVertex(["CollAttrComp"], vertexCollAttr).vertex || attrComp;
  const formAttrComp = vertexFormAttr ? (getChildVertex(["$0Comp"], vertexFormAttr).vertex || collAttrComp) : collAttrComp;

  // set dataType to attr
  const dataType = getChildVertex(["AttrDataType"], vertexAttr);
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
    attr.dataType = dataTypeFromComp.vertex!.properties.id;
  } else {
    attr.dataType = dataType.vertex!.properties.id;
  }

  // set props to attr
  let formProps = vertexFormAttr ? ((getChildVertexes(["$Prop"], [vertexFormAttr]).vertexes || []).reduce((acc, curr) => {
    const key = getOptionLabel(curr, "->$Key:properties.key");
    if (key) {
      acc[key] = curr.properties.value;
    }
    return acc;
  }, {} as { [key: string]: any })) : {};

  if (formAttrComp === collAttrComp) {
    const collProps = (getChildVertexes(["$Prop"], [vertexCollAttr]).vertexes || []).reduce((acc, curr) => {
      const key = getOptionLabel(curr, "->$0Key:properties.key");
      if (key) {
        acc[key] = curr.properties.value;
      }
      return acc;
    }, {} as { [key: string]: any });
    formProps = Object.assign(
     {},
     removeUndefinedProperties(collProps, false, 10),
     removeUndefinedProperties(formProps, false, 10)
    );
  }

  if (formAttrComp === attrComp) {
    const attrProps = (getChildVertexes(["AttrProp"], [vertexAttr]).vertexes || []).reduce((acc, curr) => {
      const key = getOptionLabel(curr, "->AttrPropKey:properties.key");
      if (key) {
        acc[key] = curr.properties.value;
      }
      return acc;
    }, {} as { [key: string]: any });
    formProps = Object.assign(
     {},
     removeUndefinedProperties(attrProps, false, 10),
     removeUndefinedProperties(formProps, false, 10)
    );
  }

  // merge default component props
  const comp = formAttrComp === attrComp ? attrComp : formAttrComp;
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
     {} as { [key: string]: any }
    );
    formProps = Object.assign({}, removeUndefinedProperties(parentCompProps, false, 10), formProps);
    attr.component = parentVertexResult.vertex!.properties.id;
  } else {
    attr.component = comp.properties.id;
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

const getCollectionOneLevelAttrs = (collVertex: Vertex): {error: string, attrs?: FieldAttribute[]} => {
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
  return { error: '', attrs };
}
export const getFormApiFromForm = (formId: string): { error: string; form?: FormMetaData } => {
  const form = graph.vertexes[formId] || findVertexByLabelAndUniqueId("Form", "id", formId);
  if (!form) {
    const coll = findVertexByLabelAndUniqueId("Coll", "id", formId);
    if (!coll) {
      return {error: "form and coll not found"};
    }
    let attrs: FieldAttribute[];
    const attrsResult = getCollectionOneLevelAttrs(coll);
    if (attrsResult.error) {
      return {error: attrsResult.error};
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
      const attrsResult= getCollectionOneLevelAttrs(vertexChild);
      if (attrsResult.error) {
        return {error: attrsResult.error};
      }
      tableAttrs = attrsResult.attrs!;
      // @ts-ignore
      tableAttrs = tableAttrs.sort((a, b) => a.pos - b.pos);


      // table properties:
      const collChildProps = (
       getChildVertexes(["$0Prop"], [vertexChild]).vertexes || []
      ).reduce((acc, curr) => {
        const key = getOptionLabel(curr, "->$0Key:properties.key");
        if (key) {
          acc[key] = curr.properties.value;
        }
        return acc;
      }, {} as { [key: string]: any });

      childAttrs.push({
        attributes: tableAttrs,
        component: "TableField",
        id: vertexChild.properties.id || childCollVertex.properties.id,
        props: collChildProps,
      });
    }

    return {
      error: "",
      form: {
        attributes: [...attrs, ...childAttrs],
        id: coll.properties.id,
        title: coll.properties.title,
        local: coll.properties.local,
        // collection used in Grid, its same like id key
        // @ts-ignore
        collection: coll.properties.id,
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
    const collChildProps = (
      getChildVertexes(["$0Prop"], [collChild.vertex!]).vertexes || []
    ).reduce((acc, curr) => {
      const key = getOptionLabel(curr, "->$0Key:properties.key");
      if (key) {
        acc[key] = curr.properties.value;
      }
      return acc;
    }, {} as { [key: string]: any });

    childAttrs.push({
      attributes: tableAttrs,
      component: "TableField",
      id: collChild.vertex!.properties.id || collChildColl.vertex!.properties.id,
      props: collChildProps,
    });
  }

  return {
    error: "",
    form: {
      attributes: [...attrs, ...childAttrs],
      id: formColl.properties.id,
      title: form.properties.title,
      local: form.properties.local,
      // collection used in Grid, its same like id key
      // @ts-ignore
      collection: formColl.properties.id,
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
      <DynamicFormSequence form={form!} id={id()} {...customProps} config={props.config || {}} />
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
       meta={{
         properties: {
           id: "meta",
           props: { stylingMode: "contained", width: "120", type: "success" }
         }
       } as unknown as Vertex}
       data={{ properties: { meta: "Login" } } as unknown as Vertex}
       onClick={onLoginClick} />
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
       meta={{
         properties: {
           id: "meta",
           props: { stylingMode: "contained", width: "120", type: "success" }
         }
       } as unknown as Vertex}
       data={{ properties: { meta: "SignUp" } } as unknown as Vertex}
       onClick={onSignupClick} />
    </>
  );
};

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
        return "CheckBoxField";
      case "Collection":
        return "";
      case "Date":
        return "DateBoxField";
      case "Number": {
        if (row.SugMaxPrecision) {
          return "IntField";
        } else {
          return "FloatField";
        }
      }
      case "Resource":
        return "SelectBoxField";
      case "String":
        return "TexBoxField";
      case "String List, Multi":
        return "TagBoxField";
      case "String List, Single":
        return "SelectBoxField";
      case "Timestamp":
        return "DateTimeBoxField";
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

    const txnId = getNewTxnId();
    // const firstLine = csvResult.split("\n", 1)[0];

    const converter = csvtojson({
      trim: true,
      // checkColumn: true,
      delimiter: [",", "\t"]
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
          attrId = attributeVertex.vertex?.properties.id;
        }
      }

      let collId = metaVertex.properties.collId || "id";

      // collection may not exist before, in that case write Label
      let collLabel = metaVertex.properties.collLabel;
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
      } as Column;
    });

    const processRows = (rowData: { [key: string]: any }[], labelName: string) => {
      const selectMetas = normalizeMeta.filter((meta) => meta.collLabel);
      const nonSelectMetas = normalizeMeta.filter((meta) => !meta.collLabel);
      const selectColumnIds = selectMetas.map((meta) => meta.column);
      selectMetas.forEach((meta) => {
        if (meta.skip) return;
        // get unique ID and insert if not exist.
        const uniqueValues = A.groupBy(rowData, (row) => row[meta.column]);
        Object.keys(uniqueValues).forEach((value) => {
          if (!value) return;
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
      });

      rowData.forEach((row) => {
        const selectColumnValues = D.selectKeys(row, selectColumnIds);
        // remove lookup value
        const rowObj = D.deleteKeys(row, selectColumnIds);
        // rename object mapping.
        for (const meta of nonSelectMetas) {
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

        // insert current row and all lookup as children
        const vertexId = getNewGraphId();
        addNewVertex(txnId, newVertex(vertexId, [labelName], rowObj));

        for (const selectMeta of selectMetas) {
          const value = selectColumnValues[selectMeta.column];
          if (!value) continue;
          const vertex = graph.vertexes[vertexId];

          const v = () => findVertexByLabelAndUniqueId(selectMeta.collLabel, selectMeta.collId, value);
          if (selectMeta.func) {
            if (selectMeta.func === "dataType") {
              const component = findVertexByLabelAndUniqueId(
                selectMeta.collLabel,
                selectMeta.collId,
                resoDataTypeToComponents(value, row),
              );
              if (component) {
                setSelectionValue(
                  txnId,
                  vertex,
                  {
                    properties: { id: selectMeta.collLabel },
                  } as unknown as Vertex,
                  component.id,
                );
              }
            } else if (selectMeta.func === "lookup") {
              const lookup = findVertexByLabelAndUniqueId(selectMeta.collLabel, selectMeta.collId, value);
              if (lookup) {
                // edge and child vertex has same label
                const lookupChild = newRow(txnId, graph.vertexes[vertexId], selectMeta.collLabel);
                const rowVertex = graph.vertexes[lookupChild.vertexId!];
                setSelectionValue(
                  txnId,
                  rowVertex,
                  {
                    properties: { id: selectMeta.collLabel },
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
                properties: { props: {parentLabel: selectMeta.collLabel, childLabel: selectMeta.edge }},
              } as unknown as Vertex,
              v()!.id,
            );
          } else {
            setSelectionValue(
              txnId,
              vertex,
              {
                properties: { id: selectMeta.edge || selectMeta.collLabel },
              } as unknown as Vertex,
              v()!.id,
            );
          }
        }
      });
    };

    const rows = [] as { [key: string]: any }[];

    converter
      .fromString(csvResult as string)
      .on("data", (data) => {
        //data is a buffer object
        const jsonStr = data.toString("utf8");
        const json = JSON.parse(jsonStr);
        // addNewVertex(txnId, newVertex(getNewGraphId(), [label], json));
        rows.push(json);
      })
      .on("end", () => {
        if (lookup && lookupId) {
          // get unique ID and insert if not exist.
          const uniqueValues = A.groupBy(rows, (row) => row[lookup]);
          Object.keys(uniqueValues).forEach((value) => {
            if (!value) {
              console.warn("skipped inserting empty lookups");
              return;
            }
            // find and if not exist then only add new vertex
            const existingVertex = (graph.vertexLabelIdMap[label] || [])
              .map((vertexId) => graph.vertexes[vertexId])
              .find((vertex) => vertex.properties[lookupId] === value);
            if (!existingVertex) {
              addNewVertex(txnId, newVertex(getNewGraphId(), [label], { [lookupId]: value }));
            }

            const rows = uniqueValues[value]!;
            // when lookup we enter one collection and all other data as its child data
            // @ts-ignore
            processRows(rows, value);
          });
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
              id: "import",
              props: {
                stringValue: true,
                displayExpr: "id",
                collection: '[{"id": "dataType"},{"id": "component"},{"id": "lookup"},{"id": "attribute"}]',
              },
            },
          } as unknown as Vertex
        }
        setValue={(attr, data) => {
          const txnId = getNewTxnId();
          const dry = true;
          const vertexes = (getChildVertexes(["SimpleImportMeta"], [config.vertex]).vertexes || []);
          for (const row of vertexes) {
            deleteRow(row, false, true, 0,Ws);
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
                collId: "id",
                edge: "Child",
                inward: true,
              });
              const newMeta2 = newRow(txnId, config.vertex, "SimpleImportMeta");
              // to store parent components.
              replaceVertexProperties(txnId, newMeta2.vertexId!, {
                column: "dataType",
                collLabel: "DataType",
                collId: "id",
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
            case "lookup": {
              replaceVertexProperties(txnId, config.vertex.id, {
                label: "Coll",
                lookup: "LookupName",
                lookupId: "id",
                dry,
              });
              const newMeta1 = newRow(txnId, config.vertex, "SimpleImportMeta");
              replaceVertexProperties(txnId, newMeta1.vertexId!, {
                column: "StandardLookupValue",
                attrId: "id",
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
                label: "Attr",
                dry,
              });
              const newMeta1 = newRow(txnId, config.vertex, "SimpleImportMeta");
              replaceVertexProperties(txnId, newMeta1.vertexId!, {
                column: "StandardName",
                attrId: "id",
              });
              const newMeta2 = newRow(txnId, config.vertex, "SimpleImportMeta");
              replaceVertexProperties(txnId, newMeta2.vertexId!, {
                column: "DisplayName",
                attrId: "title",
              });
              const newMeta3 = newRow(txnId, config.vertex, "SimpleImportMeta");
              replaceVertexProperties(txnId, newMeta3.vertexId!, {
                column: "Definition",
                attrId: "description",
              });
              const newMeta4 = newRow(txnId, config.vertex, "SimpleImportMeta");
              replaceVertexProperties(txnId, newMeta4.vertexId!, {
                column: "SimpleDataType",
                collLabel: "DataType",
                collId: "id",
                func: "dataType",
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
       meta={{
         properties: {
           id: "meta",
           props: { stylingMode: "contained", width: "120", type: "success" }
         }
       } as unknown as Vertex}
       data={{ properties: { meta: "Import" } } as unknown as Vertex}
       onClick={onDataDirectoryImportClick} />

    </>
  );
};
export const addMetaVertexes = (txnId: number, vertex: Vertex, attributes: FieldAttribute[]) => {
  for (const attribute of attributes) {
    if (attribute?.props?.skip) {
      continue;
    }

    const addAttributeResult = newRow(txnId, vertex, "MetaAttr");
    if (addAttributeResult.error) {
      alert(addAttributeResult.error);
    }
    // todo discard transaction

    const attr = klona(attribute);
    if (!attr.tab) attr.tab = "main";
    if (!attr.group) attr.group = "main";
    // if(attribute.component === "TableField") attribute.group = attribute.id;

    mergeVertexProperties(txnId, addAttributeResult.vertexId!, attr);

    if (attribute.component === "TableField" && attribute.attributes) {
      addMetaVertexes(txnId, graph.vertexes[addAttributeResult.vertexId!], attribute.attributes);
    }
    // todo discard transaction
  }
};