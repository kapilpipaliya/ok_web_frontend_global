import type { SetStoreFunction } from "solid-js/store";

import {
  For,
  Match,
  Show,
  Switch,
  createMemo,
  createSignal,
  createUniqueId,
  onCleanup,
} from "solid-js";

import { TabsWithUnderline } from "~/components/SimpleTabs";
import { CSSPropertiesEditorWrapper } from "~/components/css_properties/CSSPropertiesEditorWrapper";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { genericInputComponents } from "~/components/form/functions/genericInputComponents";
import { cloneVertexWithEdges } from "~/lib/graph/get/sync/cloneVertexWithEdges";
import { getComponentForCollRow } from "~/lib/graph/get/sync/getComponentForCollRow";
import { getPropsFromMetaExpression } from "~/lib/graph/get/sync/getPropsFromMetaExpression";
import { type GraphInterface, type Vertex, useGraph } from "~/lib/graph/graph";
import {
  addNewVertex,
  deleteVertex,
  mergeVertexProperties,
  newVertex,
} from "~/lib/graph/mutate/vertex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { type PageLayoutObject, useDesignerLayoutStore } from "../../../LayoutContext";
import { PROPERTIES } from "../constant";
import { ValidationConfig } from "../validations/ValidationConfig";
import { HighlightSetValueContent } from "./HighlightSetValueContent";
import { Label } from "./Label";
import { SelectPageField } from "./SelectPageField";
import { UniqueNameField } from "./UniqueNameField";
import { SelectPermissionField } from "./permission_field/SelectPermissionField";
import { SelectRuleField } from "./rule_field/SelectRuleField";

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
  selectedLayout: Vertex;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue(meta: Vertex, data: any): void;
  txnId: number;
}

export function FormGroupProperties(props: Readonly<FormGroupPropertiesProps>) {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();

  const vertexIds = createVertexIds();

  createVertices(vertexIds, graph, setGraph);

  const metaTxnId = graph.newTxnId;
  const propAttributes = createMemo(() => createPropAttributes(props.metaAttributes, metaTxnId, graph, setGraph));

  onCleanup(() => revertTransaction(metaTxnId, graph));
  onCleanup(() => cleanupVertices(vertexIds, graph, setGraph));

  return (
    <>
      <div class="">
        <ValidationConfig
          componentMeta={graph.vertexes[layoutStore.selectedComponent]}
          data={props.selectedLayout}
          meta={{ P: { name: "validation" } } as unknown as Vertex}
          setValue={props.setValue}
        />
      </div>
      <For each={moveClassToLast(propAttributes(), vertexIds, graph, layoutStore)}>
        {(meta) => (
          <PropertyField
            meta={meta}
            metaTxnId={metaTxnId}
            selectedLayout={props.selectedLayout}
            setValue={props.setValue}
            txnId={props.txnId}
          />
        )}
      </For>
      <ClassesComponent
        metaAttributes={props.metaAttributes}
        selectedLayout={props.selectedLayout}
        setValue={props.setValue}
        txnId={props.txnId}
        vertexIds={vertexIds}
      />
    </>
  );
}

function createVertexIds() {
  return {
    calculatedValue: `calculatedValueVertex${createUniqueId()}`,
    class: `classVertex${createUniqueId()}`,
    defaultValue: `defaultValueVertex${createUniqueId()}`,
    disabled: `disabledVertex${createUniqueId()}`,
    hidden: `hiddenVertex${createUniqueId()}`,
    label: `labelVertex${createUniqueId()}`,
    labelClass: `labelClassVertex${createUniqueId()}`,
    name: `nameVertex${createUniqueId()}`,
    perm: `permissionVertex${createUniqueId()}`,
    required: `requiredVertex${createUniqueId()}`,
    thankYouPage: `thankYouPageVertex${createUniqueId()}`,
  };
}

function createVertices(vertexIds: ReturnType<typeof createVertexIds>, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) {
  addNewVertex(0, newVertex(vertexIds.name, ["MetaTemp"], createVertexMeta("Unique Name", "name", { class: PROPERTIES.Css.TextBox, componentName: "TextBox" })), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.label, ["MetaTemp"], createVertexMeta("Label", "label", { class: PROPERTIES.Css.TextBox, componentName: "TextBox" })), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.perm, ["MetaTemp"], createVertexMeta("Permission", "perm")), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.calculatedValue, ["MetaTemp"], createVertexMeta("Calculated Value Expr", "calculatedValue")), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.class, ["MetaTemp"], createVertexMeta("Class", "class")), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.labelClass, ["MetaTemp"], createVertexMeta("Label Class", "labelClass")), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.defaultValue, ["MetaTemp"], createVertexMeta("Default Value", "defaultValue")), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.required, ["MetaTemp"], createVertexMeta("Required Expr", "required")), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.hidden, ["MetaTemp"], createVertexMeta("Hidden Expr", "hidden")), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.disabled, ["MetaTemp"], createVertexMeta("Disabled Expr", "disabled")), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.thankYouPage, ["MetaTemp"], createVertexMeta("Thank You Page", "thankYouPage")), graph, setGraph);
}

function createVertexMeta(displayName: string, name: string, other: Record<string, any> = {}) {
  return { displayName, name, ...other };
}

function createPropAttributes(metaAttributes: Vertex[], txnId: number, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) {
  return metaAttributes.map(vertex => {
    const form = FormMetaData.Comp;
    const propAttribute = form.attributes.find(attr => attr.name === "Prop")!;
    const valueAttribute = propAttribute.attributes!.find(attr => attr.name === "value")!;
    return cloneVertexWithEdges(txnId, vertex, {
      componentName: valueAttribute.componentName,
      meta: valueAttribute.meta,
    }, graph, setGraph);
  });
}

function moveClassToLast(vertices: Vertex[], vertexIds: ReturnType<typeof createVertexIds>, graph: GraphInterface, layoutStore: PageLayoutObject) {
  const otherVertices = vertices.filter(vertex => !Object.keys(vertexIds).includes(vertex.P.name));
  const componentName = graph.vertexes[layoutStore.selectedComponent].P.name;
  const isForm = layoutStore.formData?.formData.L[0] === "Form";
  const isFormField = isForm && genericInputComponents.includes(componentName);

  const nonCssVertices = otherVertices.filter(vertex => !vertex.P.name.endsWith("Class"));

  return [
    graph.vertexes[vertexIds.name],
    ...(isForm && componentName === "Form" ? [graph.vertexes[vertexIds.thankYouPage]] : []),
    graph.vertexes[vertexIds.label],
    graph.vertexes[vertexIds.perm],
    ...(isFormField ? [graph.vertexes[vertexIds.defaultValue]] : []),
    graph.vertexes[vertexIds.calculatedValue],
    graph.vertexes[vertexIds.required],
    graph.vertexes[vertexIds.hidden],
    graph.vertexes[vertexIds.disabled],
    ...nonCssVertices,
  ];
}

function cleanupVertices(vertexIds: ReturnType<typeof createVertexIds>, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) {
  Object.values(vertexIds).forEach(id => deleteVertex(0, id, graph, setGraph));
}

interface PropertyFieldProps {
  meta: Vertex;
  metaTxnId: number;
  selectedLayout: Vertex;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: (meta: Vertex, data: any) => void;
  txnId: number;
}

function PropertyField(props: Readonly<PropertyFieldProps>) {
  const [graph, setGraph] = useGraph();
  const componentName = createMemo(() => getComponentForCollRow(props.meta, props.meta, graph, setGraph));
  const metaProps = getPropsFromMetaExpression(graph, setGraph, props.meta, props.meta);
  mergeVertexProperties(props.metaTxnId, props.meta.id, graph, setGraph, metaProps);

  return (
    <div>
      <Switch>
        <Match when={props.meta.P.name === "name"}>
          <UniqueNameField
            meta={props.meta}
            selectedLayout={props.selectedLayout}
            setValue={props.setValue}
            txnId={props.txnId}
          />
        </Match>
        <Match when={props.meta.P.name === "thankYouPage"}>
          <SelectPageField
            meta={props.meta}
            selectedLayout={props.selectedLayout}
            setValue={props.setValue}
            txnId={props.txnId}
          />
        </Match>
        <Match when={props.meta.P.name === "required" || props.meta.P.name === "hidden" || props.meta.P.name === "disabled" || props.meta.P.name === "calculatedValue"}>
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
            setValue={(data) => props.setValue(props.meta, data)}
            txnId={props.txnId}
          />
        </Match>
        <Match when={props.selectedLayout}>
          <HighlightSetValueContent
            componentName={componentName}
            meta={props.meta}
            selectedLayout={props.selectedLayout}
            setValue={props.setValue}
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

interface ClassesComponentProps {
  metaAttributes: Vertex[];
  selectedLayout: Vertex;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: (meta: Vertex, data: any) => void;
  txnId: number;
  vertexIds: ReturnType<typeof createVertexIds>;
}

function ClassesComponent(props: Readonly<ClassesComponentProps>) {
  const [graph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  const componentName = graph.vertexes[layoutStore.selectedComponent].P.name;
  // Default value can be only entered when it is in Form Builder
  const isForm = layoutStore.formData?.formData.L[0] === "Form";
  const isFormField = isForm && genericInputComponents.includes(componentName);
  const classVertices = props.metaAttributes.filter(vertex => vertex.P.name.endsWith("Class"));
  const metaClasses = [
    graph.vertexes[props.vertexIds.class],
    ...(isFormField ? [graph.vertexes[props.vertexIds.labelClass]] : []),
    ...classVertices,
  ];

  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const handleTabClick = (index: number) => setSelectedIndex(index);

  return (
    <>
      <TabsWithUnderline
        displayValueKey="::'P.displayName'||::'P.name'||::'P.id'||::'label'"
        onTabClick={handleTabClick}
        selectedIndex={selectedIndex()}
        tabs={metaClasses as unknown as { name: string }[]}
      />
      <Show keyed when={selectedIndex() + 1}>
        <CSSPropertiesEditorWrapper
          data={props.selectedLayout}
          meta={metaClasses[selectedIndex()]}
          setValue={(data) => props.setValue(metaClasses[selectedIndex()], data)}
          txnId={props.txnId}
        />
      </Show>
    </>
  );
}
