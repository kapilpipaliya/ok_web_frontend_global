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
  untrack,
} from "solid-js";

import { CSSPropertiesEditorWrapper } from "~/components/css_properties/CSSPropertiesEditorWrapper";
import { TabsWithUnderline } from "~/components/css_properties/SimpleTabs";
import { genericInputComponents } from "~/components/form/genericInputComponents";
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

import { useDesignerLayoutStore } from "../../../LayoutContext";
import { PROPERTIES } from "../constant";
import { ValidationConfig } from "../validations/ValidationConfig";
import { Content } from "./Content";
import { HighlightSetValueContent } from "./HighlightSetValueContent";
import { Label } from "./Label";
import { SelectPageField } from "./SelectPageField";
import { SelectRuleField } from "./SelectRuleField";
import { UniqueNameField } from "./UniqueNameField";

function modifyMetaVertexExpr(metaVertex: Vertex) {
  return {
    ...metaVertex,
    P: {
      ...metaVertex.P,
      displayName: `${metaVertex.P.displayName ?? metaVertex.P.name} Expr`,
      name: `${metaVertex.P.name}`,
    },
  };
}

interface FormGroupPropertiesProps {
  metaAttributes: Vertex[];
  selectedLayout: Vertex;
  setValue(meta: Vertex, data: any): void;
  txnId: number;
}

export function FormGroupProperties(props: Readonly<FormGroupPropertiesProps>) {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();

  const vertexIds = createVertexIds();

  createVertices(vertexIds, graph, setGraph);

  const metaTxnId = graph.newTxnId;
  const propAttributes = createMemo(() => {
    const form = FormMetaData.Comp;
    const propAttribute = form.attributes.find(
      (attr) => attr.name === "Prop",
    )!;
    const valueAttribute = propAttribute.attributes!.find(
      (attr) => attr.name === "value",
    )!;
    return props.metaAttributes.map(vertex => {
      const vertexId = graph.newVertexId;
      untrack(() => {
        addNewVertex(metaTxnId, newVertex(vertexId, ["MetaTemp"], {
          ...vertex.P,
          // Adding componentName and meta from the FormMetaData
          componentName: valueAttribute.componentName,
          meta: valueAttribute.meta,
        }), graph, setGraph);
      })
      return graph.vertexes[vertexId];
    });
  });
  onCleanup(() => {
    revertTransaction(metaTxnId, graph);
  });

  function moveClassToLast(vertices: Vertex[]) {
    const otherVertices = vertices.filter(
      (vertex) =>
        ![
          "calculatedValue",
          "class",
          "defaultValue",
          "disabled",
          "hidden",
          "label",
          "labelClass",
          "name",
          "required",
        ].includes(vertex.P.name)
    );
    const componentName = graph.vertexes[layoutStore.selectedComponent].P.name;
    const isForm = layoutStore.formData?.formData.L[0] === "Form";
    const isFormField = isForm && genericInputComponents.includes(componentName);

    const nonCssVertices = otherVertices.filter(vertex => !vertex.P.name.endsWith("Class"));

    return [
      graph.vertexes[vertexIds.name],
      ...(isForm ? [graph.vertexes[vertexIds.thankYouPage]] : []),
      graph.vertexes[vertexIds.label],
      ...(isFormField ? [graph.vertexes[vertexIds.defaultValue]] : []),
      graph.vertexes[vertexIds.calculatedValue],
      graph.vertexes[vertexIds.required],
      graph.vertexes[vertexIds.hidden],
      graph.vertexes[vertexIds.disabled],
      ...nonCssVertices,

    ];
  }

  onCleanup(() => {
    cleanupVertices(vertexIds, graph, setGraph);
  });

  const Classes = () => {
    const componentName = graph.vertexes[layoutStore.selectedComponent].P.name;
    const isForm = layoutStore.formData?.formData.L[0] === "Form";
    const isFormField = isForm && genericInputComponents.includes(componentName);
    const classVertices = props.metaAttributes.filter(vertex => vertex.P.name.endsWith("Class"));
    const metaAttributes = [
      graph.vertexes[vertexIds.class],
      ...(isFormField ? [graph.vertexes[vertexIds.labelClass]] : []),
      ...classVertices,
    ];

    const [selectedIndex, setSelectedIndex] = createSignal(0);
    const handleTabClick = (index: number) => {
      setSelectedIndex(index);
    };

    return <>
      <TabsWithUnderline displayValueKey="::'P.displayName'||::'P.name'||::'P.id'||::'label'" onTabClick={handleTabClick} selectedIndex={selectedIndex()} tabs={metaAttributes as unknown as { name: string }[]} />
      <Show keyed when={selectedIndex() + 1}>
        <CSSPropertiesEditorWrapper
          data={props.selectedLayout}
          meta={metaAttributes[selectedIndex()]}
          setValue={(data) => props.setValue(metaAttributes[selectedIndex()], data)}
          txnId={props.txnId}
        />
      </Show></>
  }

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

      <For each={moveClassToLast(propAttributes())}>
        {(metaVertex) => {
          const metaProps = getPropsFromMetaExpression(
            graph,
            setGraph,
            metaVertex,
            metaVertex
          );
          mergeVertexProperties(metaTxnId, metaVertex.id, graph, setGraph, metaProps);
          const componentName = createMemo(() =>
            getComponentForCollRow(metaVertex, metaVertex, graph, setGraph)
          );

          return (
            <div>
              <Switch>
                <Match when={metaVertex.P.name === "name"}>
                  <UniqueNameField
                    meta={metaVertex}
                    metaVertex={metaVertex}
                    selectedLayout={props.selectedLayout}
                    setValue={props.setValue}
                    txnId={props.txnId}
                  />
                </Match>
                <Match when={metaVertex.P.name === "thankYouPage"}>
                  <SelectPageField
                    meta={metaVertex}
                    metaVertex={metaVertex}
                    selectedLayout={props.selectedLayout}
                    setValue={props.setValue}
                    txnId={props.txnId}
                  />
                </Match>
                <Match when={metaVertex.P.name === "required" || metaVertex.P.name === "hidden" || metaVertex.P.name === "disabled" || metaVertex.P.name === "calculatedValue"}>
                  <SelectRuleField
                    metaVertex={metaVertex}
                    selectedLayout={props.selectedLayout}
                    txnId={props.txnId}
                  />
                </Match>
                <Match when={componentName() === "Table"}>
                  <h3>
                    <Label metaVertex={metaVertex} />
                  </h3>
                  <Content
                    componentName={componentName}
                    meta={metaVertex}
                    selectedLayout={props.selectedLayout}
                    setValue={props.setValue}
                    txnId={props.txnId}
                  />
                </Match>
                <Match when={props.selectedLayout}>
                  <HighlightSetValueContent
                    componentName={componentName}
                    meta={metaVertex}
                    metaVertex={metaVertex}
                    selectedLayout={props.selectedLayout}
                    setValue={props.setValue}
                    txnId={props.txnId}
                  />

                  <SelectRuleField
                    metaVertex={modifyMetaVertexExpr(metaVertex)}
                    selectedLayout={props.selectedLayout}
                    txnId={props.txnId}
                  />
                </Match>
              </Switch>
            </div>
          );
        }}
      </For>
      <Classes />


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
    required: `requiredVertex${createUniqueId()}`,
    thankYouPage: `thankYouPageVertex${createUniqueId()}`
  };
}

function createVertices(vertexIds: ReturnType<typeof createVertexIds>, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>,) {
  addNewVertex(0, newVertex(vertexIds.name, ["MetaTemp"], createVertexMeta("Unique Name", "name", { class: PROPERTIES.Css.TextBox, componentName: "TextBox" })), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.label, ["MetaTemp"], createVertexMeta("Label", "label", { class: PROPERTIES.Css.TextBox, componentName: "TextBox" })), graph, setGraph);
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

function cleanupVertices(vertexIds: ReturnType<typeof createVertexIds>, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) {
  Object.values(vertexIds).forEach(id => deleteVertex(0, id, graph, setGraph));
}

