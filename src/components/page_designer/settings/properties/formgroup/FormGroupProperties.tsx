import type { SetStoreFunction } from "solid-js/store";

import {
  createMemo,
  createUniqueId,
  For,
  Match,
  onCleanup,
  Switch,
} from "solid-js";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { genericInputComponents } from "~/components/form/functions/genericInputComponents";
import { uniqueNameKey } from "~/components/page_designer/constants/constant";
import { isObject } from "~/lib/data_structure/object/isObject";
import { cloneVertexWithEdges } from "~/lib/graph/get/sync/cloneVertexWithEdges";
import { getPropsFromMetaExpression } from "~/lib/graph/get/sync/getPropsFromMetaExpression";
import { type GraphInterface, useGraph, type Vertex } from "~/lib/graph/graph";
import { addMetaVertexes } from "~/lib/graph/mutate/form/createMeta";
import {
  addNewVertex,
  mergeVertexProperties,
  newVertex,
} from "~/lib/graph/mutate/vertex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { htmlTags } from "../../../../../lib/dom/htmlTags";
import { PROPERTIES } from "../../../../styled/constants/constant";
import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../../context/LayoutContext";
import { ValidationConfig } from "../validations/ValidationConfig";
import { ClassesComponent } from "./ClassesComponent";
import { HighlightSetValueContent } from "./HighlightSetValueContent";
import { Label } from "./Label";
import { SelectPermissionField } from "./permission_field/SelectPermissionField";
import { SelectRuleField } from "./rule_field/SelectRuleField";
import { SelectPageField } from "./SelectPageField";
import { UniqueNameField } from "./UniqueNameField";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";

function modifyMetaVertexExpr(meta: Vertex) {
  return {
    ...meta,
    P: {
      ...meta.P,
      displayName: `${meta.P.displayName ?? meta.P.key} Expr`,
      key: `${meta.P.key}`,
    },
  };
}

interface FormGroupPropertiesProps {
  metaAttributes: Vertex[];
  onChange(meta: Vertex, data: unknown): void;
  selectedLayout: Vertex;
  txnId: number;
}

export function FormGroupProperties(props: Readonly<FormGroupPropertiesProps>) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!];

  const vertexIds = createVertexIds();
  const metaTxnId = generateNewTxnId(graph, setGraph);
  createVertices(vertexIds, metaTxnId, graph, setGraph);
  const selectedComp = () => graph.vertexes[layoutStore().selectedComponent];
  const propAttributes = createMemo(() =>
    clonePropAttributes(props.metaAttributes, metaTxnId, graph, setGraph),
  );

  onCleanup(() => {
    revertTransaction(metaTxnId, graph, setGraph);
  });

  return (
    <>
      <div class="">
        <ValidationConfig
          componentMeta={selectedComp()}
          data={props.selectedLayout}
          meta={{ P: { key: "validation" } } as unknown as Vertex}
          onChange={props.onChange}
        />
      </div>
      <For
        each={moveClassToLast(propAttributes(), vertexIds, graph, layoutStore())}
      >
        {(meta) => (
          <PropertyField
            meta={meta}
            metaTxnId={metaTxnId}
            onChange={props.onChange}
            selectedLayout={props.selectedLayout}
            txnId={props.txnId}
          />
        )}
      </For>
      <ClassesComponent
        metaAttributes={props.metaAttributes}
        onChange={props.onChange}
        selectedLayout={props.selectedLayout}
        txnId={props.txnId}
        vertexIds={vertexIds}
      />
    </>
  );
}

export function createVertexIds() {
  return {
    as: `asVertex${createUniqueId()}`,
    attrLabel: `attrNameVertex${createUniqueId()}`,
    calculatedValue: `calculatedValueVertex${createUniqueId()}`,
    class: `classVertex${createUniqueId()}`,
    defaultValue: `defaultValueVertex${createUniqueId()}`,
    disabled: `disabledVertex${createUniqueId()}`,
    errorClass: `errorClassVertex${createUniqueId()}`,
    height: `heightVertex${createUniqueId()}`,
    hidden: `hiddenVertex${createUniqueId()}`,
    icon: `iconVertex${createUniqueId()}`,
    key: `nameVertex${createUniqueId()}`,
    perm: `permissionVertex${createUniqueId()}`,
    required: `requiredVertex${createUniqueId()}`,
    src: `srcVertex${createUniqueId()}`,
    thankYouPage: `thankYouPageVertex${createUniqueId()}`,
    width: `widthVertex${createUniqueId()}`,
  };
}

function createVertices(
  vertexIds: ReturnType<typeof createVertexIds>,
  txnId: number,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const vertices: ({
    attributes?: FieldAttribute[];
  } & Omit<Vertex, "IN" | "L" | "OUT">)[] = [
      {
        id: vertexIds.key,
        P: {
          class: PROPERTIES.Css.TextField,
          componentName: "TextInput",
          displayName: "Unique Name",
          key: uniqueNameKey,
        },
      },
      {
        id: vertexIds.as,
        P: {
          componentName: "Select",
          displayName: "As",
          key: "as",
          options: htmlTags.map((element) => ({ id: element, label: element })),
          saveValue: true,
        },
      },
      {
        id: vertexIds.perm,
        P: { displayName: "Permission", key: "perm" },
      },
      {
        id: vertexIds.calculatedValue,
        P: {
          componentName: "TextInput",
          displayName: "Calculated Value Expr",
          key: "calculatedValue",
        },
      },
      {
        id: vertexIds.class,
        P: { displayName: "Class", key: "class" },
      },
      {
        id: vertexIds.errorClass,
        P: { displayName: "Error Class", key: "errorClass" },
      },
      {
        id: vertexIds.defaultValue,
        P: { displayName: "Default Value", key: "defaultValue" },
      },
      {
        id: vertexIds.required,
        P: { displayName: "Required Expr", key: "required" },
      },
      {
        id: vertexIds.hidden,
        P: { displayName: "Hidden Expr", key: "hidden" },
      },
      {
        id: vertexIds.disabled,
        P: { displayName: "Disabled Expr", key: "disabled" },
      },
      {
        id: vertexIds.thankYouPage,
        P: { displayName: "Thank You Page", key: "thankYouPage" },
      },
      {
        id: vertexIds.src,
        P: {
          class: PROPERTIES.Css.TextField,
          componentName: "TextInput",
          displayName: "Source",
          key: "src",
        },
      },
      // New vertices for icon, width, height, and attrName
      {
        id: vertexIds.icon,
        P: {
          class: PROPERTIES.Css.TextField,
          componentName: "TextInput",
          displayName: "Icon",
          key: "icon",
        },
      },
      {
        id: vertexIds.width,
        P: {
          class: PROPERTIES.Css.TextField,
          componentName: "TextInput",
          displayName: "Width",
          key: "width",
          type: "number",
        },
      },
      {
        id: vertexIds.height,
        P: {
          class: PROPERTIES.Css.TextField,
          componentName: "TextInput",
          displayName: "Height",
          key: "height",
          type: "number",
        },
      },
      {
        id: vertexIds.attrLabel,
        P: {
          class: PROPERTIES.Css.TextField,
          componentName: "TextInput",
          displayName: "Attribute Label",
          key: "attrLabel",
        },
      },
    ];
  for (const vertex of vertices) {
    const newVertexInstance = newVertex(vertex.id, ["MetaTemp"], vertex.P);
    addNewVertex(txnId, newVertexInstance, graph, setGraph);
    if (vertex.attributes) {
      addMetaVertexes(
        graph,
        setGraph,
        txnId,
        graph.vertexes[vertex.id],
        vertex.attributes,
      );
    }
  }
}

function clonePropAttributes(
  metaAttributes: Vertex[],
  txnId: number,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  return metaAttributes.map((vertex) => {
    const form = FormMetaData.Comp;
    const _propAttribute = form.attributes.find((attr) => attr.key === "Prop")!;
    // now we simplified this so user cant enter default value
    // const valueAttribute = propAttribute.attributes!.find(
    //   (attr) => attr.key === "value",
    // )!;
    return cloneVertexWithEdges(
      txnId,
      vertex,
      {
        // componentName: valueAttribute.componentName,
        // meta: valueAttribute.meta,
      },
      graph,
      setGraph,
    );
  });
}

function moveClassToLast(
  vertices: Vertex[],
  vertexIds: ReturnType<typeof createVertexIds>,
  graph: GraphInterface,
  layoutStore: PageLayoutObject,
) {
  const otherVertices = vertices.filter(
    (vertex) => !Object.keys(vertexIds).includes(vertex.P.key),
  );
  const componentName = graph.vertexes[layoutStore.selectedComponent].P.key;
  const isForm = graph.vertexes[layoutStore.formId!]?.L[0] === "Form";
  const isFormField = isForm && genericInputComponents.includes(componentName);

  const nonCssVertices = otherVertices.filter(
    (vertex) => !vertex.P.key.endsWith("Class"),
  );

  return [
    graph.vertexes[vertexIds.attrLabel],
    graph.vertexes[vertexIds.key],
    ...(isForm && componentName === "Form"
      ? [graph.vertexes[vertexIds.thankYouPage]]
      : []),
    graph.vertexes[vertexIds.perm],
    // Default value can be only entered when it is in Form Builder
    ...(isFormField ? [graph.vertexes[vertexIds.defaultValue]] : []),
    // always displayed properties
    graph.vertexes[vertexIds.calculatedValue],
    graph.vertexes[vertexIds.as],
    graph.vertexes[vertexIds.required],
    graph.vertexes[vertexIds.hidden],
    graph.vertexes[vertexIds.disabled],
    ...(componentName === "Image" ? [graph.vertexes[vertexIds.src]] : []),
    ...(componentName === "Icon" ? [graph.vertexes[vertexIds.icon], graph.vertexes[vertexIds.width], graph.vertexes[vertexIds.height]] : []),
    ...nonCssVertices,
  ];
}

interface PropertyFieldProps {
  meta: Vertex;
  metaTxnId: number;
  onChange: (meta: Vertex, data: unknown) => void;
  selectedLayout: Vertex;
  txnId: number;
}

function PropertyField(props: Readonly<PropertyFieldProps>) {
  const [graph, setGraph] = useGraph();
  const componentName = createMemo(() => props.meta.P.type || "TextInput");
  const metaProps = getPropsFromMetaExpression(
    graph,
    setGraph,
    props.meta,
    props.meta,
  );
  if (isObject(metaProps) && Object.keys(metaProps).length > 0) {
    mergeVertexProperties(
      props.metaTxnId,
      props.meta.id,
      graph,
      setGraph,
      metaProps,
    );
  }
  return (
    <div>
      <Switch>
        <Match when={props.meta.P.key === uniqueNameKey}>
          <UniqueNameField
            meta={props.meta}
            onChange={props.onChange}
            selectedLayout={props.selectedLayout}
            txnId={props.txnId}
          />
        </Match>
        <Match when={props.meta.P.key === "thankYouPage"}>
          <SelectPageField
            meta={props.meta}
            onChange={props.onChange}
            selectedLayout={props.selectedLayout}
            txnId={props.txnId}
          />
        </Match>
        <Match
          when={
            props.meta.P.key === "required" ||
            props.meta.P.key === "hidden" ||
            props.meta.P.key === "disabled" ||
            props.meta.P.key === "calculatedValue"
          }
        >
          <SelectRuleField
            meta={props.meta}
            selectedLayout={props.selectedLayout}
            txnId={props.txnId}
          />
        </Match>
        <Match when={props.meta.P.key === "perm"}>
          <SelectPermissionField
            meta={props.meta}
            selectedLayout={props.selectedLayout}
            txnId={props.txnId}
          />
        </Match>
        <Match when={componentName() === "Table"}>
          <h3>
            <Label meta={props.meta} />
          </h3>
          <DynamicComponent
            componentName={componentName()}
            data={props.selectedLayout}
            isNoPermissionCheck={true}
            isRealTime={false}
            meta={props.meta}
            noLabel
            onChange={(data) => props.onChange(props.meta, data)}
            txnId={props.txnId}
          />
        </Match>
        <Match when={props.selectedLayout}>
          <HighlightSetValueContent
            componentName={componentName}
            meta={props.meta}
            onChange={props.onChange}
            selectedLayout={props.selectedLayout}
            txnId={props.txnId}
          />
          {/* Temporary disabled */}
          {/* <SelectRuleField
            meta={modifyMetaVertexExpr(props.meta)}
            selectedLayout={props.selectedLayout}
            txnId={props.txnId}
          /> */}
        </Match>
      </Switch>
    </div>
  );
}
