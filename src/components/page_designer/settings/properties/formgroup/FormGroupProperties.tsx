import type { SetStoreFunction } from "solid-js/store";

import { createWritableMemo } from "@solid-primitives/memo";
import {
  For,
  Match,
  Switch,
  createMemo,
  createUniqueId,
  onCleanup,
} from "solid-js";

import { CSSPropertiesEditor } from "~/components/css_properties/CSSPropertiesEditor";
import { genericInputComponents } from "~/components/form/genericInputComponents";
import {
  Tab,
  TabContainer,
  TabList,
  Tabs,
} from "~/components/solid_blocks/tabs/tabs";
import { getComponentForCollRow } from "~/lib/graph/get/sync/getComponentForCollRow";
import { getPropsFromMetaExpression } from "~/lib/graph/get/sync/getPropsFromMetaExpression";
import { type GraphInterface, type Vertex, useGraph } from "~/lib/graph/graph";
import {
  addNewVertex,
  deleteVertex,
  newVertex,
} from "~/lib/graph/mutate/vertex";
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

  function moveClassToLast(vertices: Vertex[]) {
    const otherVertices = vertices.filter(
      (vertex) =>
        ![
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

    return <Tabs class="p:10px">
      <TabList>
        <For each={metaAttributes}>
          {(tab) => {
            return <Tab >{tab.P.displayName}</Tab>
          }}
        </For>
      </TabList>

      <For each={metaAttributes}>
        {(metaVertex) => {
          return <TabContainer>
            <CSSPropertiesEditor
              data={props.selectedLayout}
              meta={metaVertex}
              setValue={(data) => props.setValue(metaVertex, data)}
              txnId={props.txnId}
            />
          </TabContainer>
        }}
      </For>
    </Tabs>
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

      <For each={moveClassToLast(props.metaAttributes)}>
        {(metaVertex) => {
          const [meta, setMeta] = useMetaMemo(metaVertex);
          const component = createMemo(() =>
            getComponentForCollRow(meta(), meta(), graph, setGraph)
          );
          const metaProps = getPropsFromMetaExpression(
            graph,
            setGraph,
            meta(),
            meta()
          );
          const P = { ...meta().P, ...metaProps };
          const v = { ...metaVertex, P };
          setMeta(v);

          return (
            <div>
              <Switch>
                <Match when={metaVertex.P.name === "name"}>
                  <UniqueNameField
                    meta={meta}
                    metaVertex={metaVertex}
                    selectedLayout={props.selectedLayout}
                    setValue={props.setValue}
                    txnId={props.txnId}
                  />
                </Match>
                <Match when={metaVertex.P.name === "thankYouPage"}>
                  <SelectPageField
                    meta={meta}
                    metaVertex={metaVertex}
                    selectedLayout={props.selectedLayout}
                    setValue={props.setValue}
                    txnId={props.txnId}
                  />
                </Match>
                <Match when={metaVertex.P.name === "required" || metaVertex.P.name === "hidden" || metaVertex.P.name === "disabled"}>
                  <SelectRuleField
                    meta={meta}
                    metaVertex={metaVertex}
                    selectedLayout={props.selectedLayout}
                    setValue={props.setValue}
                    txnId={props.txnId}
                  />
                </Match>
                <Match when={component() === "Table"}>
                  <h3>
                    <Label metaVertex={metaVertex} />
                  </h3>
                  <Content
                    component={component}
                    meta={meta}
                    selectedLayout={props.selectedLayout}
                    setValue={props.setValue}
                    txnId={props.txnId}
                  />
                </Match>
                <Match when={props.selectedLayout}>
                  <HighlightSetValueContent
                    component={component}
                    meta={meta}
                    metaVertex={metaVertex}
                    selectedLayout={props.selectedLayout}
                    setValue={props.setValue}
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
  addNewVertex(0, newVertex(vertexIds.name, ["MetaTemp"], createVertexMeta("Unique Name", "name", { class: PROPERTIES.Css.TextBox, component: "TextBox" })), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.label, ["MetaTemp"], createVertexMeta("Label", "label", { class: PROPERTIES.Css.TextBox, component: "TextBox" })), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.class, ["MetaTemp"], createVertexMeta("Class", "class")), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.labelClass, ["MetaTemp"], createVertexMeta("Label Class", "labelClass")), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.defaultValue, ["MetaTemp"], createVertexMeta("Default Value", "defaultValue")), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.required, ["MetaTemp"], createVertexMeta("Required Rule", "required")), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.hidden, ["MetaTemp"], createVertexMeta("Hidden Rule", "hidden")), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.disabled, ["MetaTemp"], createVertexMeta("Disabled Rule", "disabled")), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.thankYouPage, ["MetaTemp"], createVertexMeta("Thank You Page", "thankYouPage")), graph, setGraph);
}

function createVertexMeta(displayName: string, name: string, other: Record<string, any> = {}) {
  return { displayName, name, ...other };
}

function cleanupVertices(vertexIds: ReturnType<typeof createVertexIds>, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) {
  Object.values(vertexIds).forEach(id => deleteVertex(0, id, graph, setGraph));
}

function useMetaMemo(metaVertex: Vertex) {
  return createWritableMemo(() => {
    if ([
      "class",
      "defaultValue",
      "disabled",
      "hidden",
      "label",
      "labelClass",
      "name",
      "required",
      "thankYouPage"
    ].includes(metaVertex.P.name)) {
      return { ...metaVertex };
    }
    const form = FormMetaData.Comp;
    const propAttribute = form.attributes.find(
      (attr) => attr.name === "Prop",
    )!;
    const valueAttribute = propAttribute.attributes!.find(
      (attr) => attr.name === "value",
    )!;
    const P = {
      ...metaVertex.P,
      // Adding component and meta from the FormMetaData
      component: valueAttribute.component,
      meta: valueAttribute.meta,
    };
    return { ...metaVertex, P };
  });
}
