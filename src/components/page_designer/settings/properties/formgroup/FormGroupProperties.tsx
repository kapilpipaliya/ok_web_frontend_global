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
import { cloneVertexWithEdges } from "~/lib/graph/get/sync/cloneVertexWithEdges";
import { getComponentForCollRow } from "~/lib/graph/get/sync/getComponentForCollRow";
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

import { textFieldInputMeta } from "../../../../constants/textFieldInput";
import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../../LayoutContext";
import { PROPERTIES } from "../constant";
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
      displayName: `${meta.P.displayName ?? meta.P.name} Expr`,
      name: `${meta.P.name}`,
    },
  };
}

interface FormGroupPropertiesProps {
  metaAttributes: Vertex[];
  onChange(meta: Vertex, data: any): void;
  selectedLayout: Vertex;
  txnId: number;
}

export function FormGroupProperties(props: Readonly<FormGroupPropertiesProps>) {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();

  const vertexIds = createVertexIds();
  const metaTxnId = graph.newTxnId;
  createVertices(vertexIds, metaTxnId, graph, setGraph);
  const propAttributes = createMemo(() =>
    createPropAttributes(props.metaAttributes, metaTxnId, graph, setGraph)
  );

  onCleanup(() => {
    revertTransaction(metaTxnId, graph);
  });

  return (
    <>
      <div class="">
        <ValidationConfig
          componentMeta={graph.vertexes[layoutStore.selectedComponent]}
          data={props.selectedLayout}
          meta={{ P: { name: "validation" } } as unknown as Vertex}
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
    calculatedValue: `calculatedValueVertex${createUniqueId()}`,
    class: `classVertex${createUniqueId()}`,
    defaultValue: `defaultValueVertex${createUniqueId()}`,
    disabled: `disabledVertex${createUniqueId()}`,
    errorClass: `errorClassVertex${createUniqueId()}`,
    hidden: `hiddenVertex${createUniqueId()}`,
    label: `labelVertex${createUniqueId()}`,
    labelClass: `labelClassVertex${createUniqueId()}`,
    name: `nameVertex${createUniqueId()}`,
    perm: `permissionVertex${createUniqueId()}`,
    required: `requiredVertex${createUniqueId()}`,
    thankYouPage: `thankYouPageVertex${createUniqueId()}`,
  };
}

function createVertices(
  vertexIds: ReturnType<typeof createVertexIds>,
  txnId: number,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>
) {
  const vertices: ({
    attributes?: FieldAttribute[];
  } & Omit<Vertex, "IN" | "L" | "OUT">)[] = [
      {
        attributes: [
          textFieldInputMeta
        ],
        id: vertexIds.name,
        P: {
          class: PROPERTIES.Css.TextField,
          componentName: "TextField",
          displayName: "Unique Name",
          name: "name",
        },
      },
      {
        attributes: [
          textFieldInputMeta
        ],
        id: vertexIds.label,
        P: {
          class: PROPERTIES.Css.TextField,
          componentName: "TextField",
          displayName: "Label",
          name: "label",
        },
      },
      {
        id: vertexIds.perm,
        P: { displayName: "Permission", name: "perm" },
      },
      {
        id: vertexIds.calculatedValue,
        P: { displayName: "Calculated Value Expr", name: "calculatedValue" },
      },
      {
        id: vertexIds.class,
        P: { displayName: "Class", name: "class" },
      },
      {
        id: vertexIds.labelClass,
        P: { displayName: "Label Class", name: "labelClass" },
      },
      {
        id: vertexIds.errorClass,
        P: { displayName: "Error Class", name: "errorClass" },
      },
      {
        id: vertexIds.defaultValue,
        P: { displayName: "Default Value", name: "defaultValue" },
      },
      {
        id: vertexIds.required,
        P: { displayName: "Required Expr", name: "required" },
      },
      {
        id: vertexIds.hidden,
        P: { displayName: "Hidden Expr", name: "hidden" },
      },
      {
        id: vertexIds.disabled,
        P: { displayName: "Disabled Expr", name: "disabled" },
      },
      {
        id: vertexIds.thankYouPage,
        P: { displayName: "Thank You Page", name: "thankYouPage" },
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
        vertex.attributes
      );
    }
  });
}

function createPropAttributes(
  metaAttributes: Vertex[],
  txnId: number,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>
) {
  return metaAttributes.map((vertex) => {
    const form = FormMetaData.Comp;
    const propAttribute = form.attributes.find((attr) => attr.name === "Prop")!;
    const valueAttribute = propAttribute.attributes!.find(
      (attr) => attr.name === "value"
    )!;
    return cloneVertexWithEdges(
      txnId,
      vertex,
      {
        componentName: valueAttribute.componentName,
        meta: valueAttribute.meta,
      },
      graph,
      setGraph
    );
  });
}

function moveClassToLast(
  vertices: Vertex[],
  vertexIds: ReturnType<typeof createVertexIds>,
  graph: GraphInterface,
  layoutStore: PageLayoutObject
) {
  const otherVertices = vertices.filter(
    (vertex) => !Object.keys(vertexIds).includes(vertex.P.name)
  );
  const componentName = graph.vertexes[layoutStore.selectedComponent].P.name;
  const isForm = layoutStore.formStore[0]?.formData.L[0] === "Form";
  const isFormField = isForm && genericInputComponents.includes(componentName);

  const nonCssVertices = otherVertices.filter(
    (vertex) => !vertex.P.name.endsWith("Class")
  );

  return [
    graph.vertexes[vertexIds.name],
    ...(isForm && componentName === "Form"
      ? [graph.vertexes[vertexIds.thankYouPage]]
      : []),
    graph.vertexes[vertexIds.label],
    graph.vertexes[vertexIds.perm],
    // Default value can be only entered when it is in Form Builder
    ...(isFormField ? [graph.vertexes[vertexIds.defaultValue]] : []),
    graph.vertexes[vertexIds.calculatedValue],
    graph.vertexes[vertexIds.required],
    graph.vertexes[vertexIds.hidden],
    graph.vertexes[vertexIds.disabled],
    ...nonCssVertices,
  ];
}

interface PropertyFieldProps {
  meta: Vertex;
  metaTxnId: number;
  onChange: (meta: Vertex, data: any) => void;
  selectedLayout: Vertex;
  txnId: number;
}

function PropertyField(props: Readonly<PropertyFieldProps>) {
  const [graph, setGraph] = useGraph();
  const componentName = createMemo(() =>
    getComponentForCollRow(props.meta, props.meta, graph, setGraph)
  );
  const metaProps = getPropsFromMetaExpression(
    graph,
    setGraph,
    props.meta,
    props.meta
  );
  mergeVertexProperties(
    props.metaTxnId,
    props.meta.id,
    graph,
    setGraph,
    metaProps
  );

  return (
    <div>
      <Switch>
        <Match when={props.meta.P.name === "name"}>
          <UniqueNameField
            meta={props.meta}
            onChange={props.onChange}
            selectedLayout={props.selectedLayout}
            txnId={props.txnId}
          />
        </Match>
        <Match when={props.meta.P.name === "thankYouPage"}>
          <SelectPageField
            meta={props.meta}
            onChange={props.onChange}
            selectedLayout={props.selectedLayout}
            txnId={props.txnId}
          />
        </Match>
        <Match
          when={
            props.meta.P.name === "required" ||
            props.meta.P.name === "hidden" ||
            props.meta.P.name === "disabled" ||
            props.meta.P.name === "calculatedValue"
          }
        >
          <SelectRuleField
            meta={props.meta}
            selectedLayout={props.selectedLayout}
            txnId={props.txnId}
          />
        </Match>
        <Match when={props.meta.P.name === "perm"}>
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
