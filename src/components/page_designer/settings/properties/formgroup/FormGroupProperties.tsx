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
import { uniqueNameKey } from "~/components/page_designer/constant";
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

import { PROPERTIES } from "../../../../constants/constant";
import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../../LayoutContext";
import { ValidationConfig } from "../validations/ValidationConfig";
import { ClassesComponent } from "./ClassesComponent";
import { HighlightSetValueContent } from "./HighlightSetValueContent";
import { Label } from "./Label";
import { SelectPermissionField } from "./permission_field/SelectPermissionField";
import { SelectRuleField } from "./rule_field/SelectRuleField";
import { SelectPageField } from "./SelectPageField";
import { UniqueNameField } from "./UniqueNameField";

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
  const [layoutStore] = useDesignerLayoutStore();

  const vertexIds = createVertexIds();
  const metaTxnId = graph.newTxnId;
  createVertices(vertexIds, metaTxnId, graph, setGraph);
  const selectedComp = () => graph.vertexes[layoutStore.selectedComponent];
  const propAttributes = createMemo(() =>
    clonePropAttributes(props.metaAttributes, metaTxnId, graph, setGraph),
  );

  onCleanup(() => {
    revertTransaction(metaTxnId, graph);
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
        each={moveClassToLast(propAttributes(), vertexIds, graph, layoutStore)}
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
    calculatedValue: `calculatedValueVertex${createUniqueId()}`,
    class: `classVertex${createUniqueId()}`,
    defaultValue: `defaultValueVertex${createUniqueId()}`,
    disabled: `disabledVertex${createUniqueId()}`,
    errorClass: `errorClassVertex${createUniqueId()}`,
    hidden: `hiddenVertex${createUniqueId()}`,
    key: `nameVertex${createUniqueId()}`,
    perm: `permissionVertex${createUniqueId()}`,
    required: `requiredVertex${createUniqueId()}`,
    thankYouPage: `thankYouPageVertex${createUniqueId()}`,
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
        componentName: "SystemString",
        displayName: "Unique Name",
        key: uniqueNameKey,
      },
    },
    {
      id: vertexIds.as,
      P: { componentName: "SystemString", displayName: "As", key: "as" },
    },
    {
      id: vertexIds.perm,
      P: { displayName: "Permission", key: "perm" },
    },
    {
      id: vertexIds.calculatedValue,
      P: {
        componentName: "SystemString",
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
  ];

  vertices.forEach((vertex) => {
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
  });
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
  const isForm = layoutStore.formStore[0]?.formData.L[0] === "Form";
  const isFormField = isForm && genericInputComponents.includes(componentName);

  const nonCssVertices = otherVertices.filter(
    (vertex) => !vertex.P.key.endsWith("Class"),
  );

  return [
    graph.vertexes[vertexIds.key],
    ...(isForm && componentName === "Form"
      ? [graph.vertexes[vertexIds.thankYouPage]]
      : []),
    graph.vertexes[vertexIds.perm],
    // Default value can be only entered when it is in Form Builder
    ...(isFormField ? [graph.vertexes[vertexIds.defaultValue]] : []),
    graph.vertexes[vertexIds.calculatedValue],
    graph.vertexes[vertexIds.as],
    graph.vertexes[vertexIds.required],
    graph.vertexes[vertexIds.hidden],
    graph.vertexes[vertexIds.disabled],
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
  const componentName = createMemo(() =>
    props.meta.P.type || "TextInput",
  );
  const metaProps = getPropsFromMetaExpression(
    graph,
    setGraph,
    props.meta,
    props.meta,
  );
  mergeVertexProperties(
    props.metaTxnId,
    props.meta.id,
    graph,
    setGraph,
    metaProps,
  );

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
          <SelectRuleField
            meta={modifyMetaVertexExpr(props.meta)}
            selectedLayout={props.selectedLayout}
            txnId={props.txnId}
          />
        </Match>
      </Switch>
    </div>
  );
}
