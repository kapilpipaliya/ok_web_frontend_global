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
import { getComponentForCollRow } from "~/lib/graph/get/sync/getComponentForCollRow";
import { getPropsFromMetaExpression } from "~/lib/graph/get/sync/getProps";
import { IdAttr, type Vertex, useGraph } from "~/lib/graph/graph";
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

  const nameVertexId = `nameVertex${createUniqueId()}`;
  const classVertexId = `classVertex${createUniqueId()}`;
  const defaultValueVertexId = `defaultValueVertex${createUniqueId()}`;
  const hiddenVertexId = `hiddenVertex${createUniqueId()}`;
  const disabledVertexId = `disabledVertex${createUniqueId()}`;

  addNewVertex(
    0,
    newVertex(nameVertexId, ["MetaTemp"], {
      class: PROPERTIES.Css.TextBox,
      component: "TextBox",
      displayName: "Unique Name",
      name: "name",
    }),
    graph,
    setGraph,
  );
  addNewVertex(
    0,
    newVertex(classVertexId, ["MetaTemp"], {
      displayName: "Class",
      name: "class",
    }),
    graph,
    setGraph,
  );


  addNewVertex(
    0,
    newVertex(defaultValueVertexId, ["MetaTemp"], {
      displayName: "Default Value",
      name: "defaultValue",
    }),
    graph,
    setGraph,
  );

  
  addNewVertex(
    0,
    newVertex(hiddenVertexId, ["MetaTemp"], {
      displayName: "Hidden",
      name: "hidden",
    }),
    graph,
    setGraph,
  );
  addNewVertex(
    0,
    newVertex(disabledVertexId, ["MetaTemp"], {
      displayName: "Disabled",
      name: "disabled",
    }),
    graph,
    setGraph,
  );

  function moveClassToLast(vertices: Vertex[]) {
    const otherVertices = vertices.filter(
      (vertex) =>
        vertex.P.name !== "name" &&
        vertex.P.name !== "class" &&
        vertex.P.name !== "defaultValue" &&
        vertex.P.name !== "hidden" &&
        vertex.P.name !== "disabled",
    );
    const componentName = graph.vertexes[layoutStore.selectedComponent].P.name;
    const isAddDefaultValue = componentName !== "Form" && genericInputComponents.includes(componentName);
    return [
      graph.vertexes[nameVertexId],
      ...(isAddDefaultValue ? [graph.vertexes[defaultValueVertexId]] : []),
      graph.vertexes[hiddenVertexId],
      graph.vertexes[disabledVertexId],
      ...otherVertices,
      graph.vertexes[classVertexId],
    ];
  }

  onCleanup(() => {
    deleteVertex(0, nameVertexId, graph, setGraph);
    deleteVertex(0, classVertexId, graph, setGraph);
    deleteVertex(0, defaultValueVertexId, graph, setGraph);
    deleteVertex(0, hiddenVertexId, graph, setGraph);
    deleteVertex(0, disabledVertexId, graph, setGraph);
  });

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
          const id = `${props.selectedLayout.id + metaVertex.P[IdAttr]}Label`;
          const form = FormMetaData.Comp;
          const propAttribute = form.attributes.find(
            (attr) => attr.name === "Prop",
          )!;
          const valueAttribute = propAttribute.attributes!.find(
            (attr) => attr.name === "value",
          )!;
          const [meta, setMeta] = createWritableMemo(() => {
            if (
              metaVertex.P.name === "hidden" ||
              metaVertex.P.name === "disabled" ||
              metaVertex.P.name === "name" ||
              metaVertex.P.name === "class" ||
              metaVertex.P.name === "defaultValue"
            ) {
              return { ...metaVertex };
            }
            const P = {
              ...metaVertex.P,
              // Adding component and meta from the FormMetaData
              component: valueAttribute.component,
              meta: valueAttribute.meta,
            };
            return { ...metaVertex, P };
          });

          const component = createMemo(() =>
            getComponentForCollRow(meta(), meta(), graph, setGraph),
          );
          const metaProps = getPropsFromMetaExpression(
            graph,
            setGraph,
            meta(),
            meta(),
          );
          const P = {
            ...meta().P,
            ...metaProps,
          };
          const v = { ...metaVertex, P };
          setMeta(v);

          return (
            <div>
              <Switch>
                <Match when={metaVertex.P.name === "name"}>
                  <UniqueNameField
                    id={id}
                    meta={meta}
                    metaVertex={metaVertex}
                    selectedLayout={props.selectedLayout}
                    setValue={props.setValue}
                    txnId={props.txnId}
                  />
                </Match>
                <Match when={metaVertex.P.name === "hidden" || metaVertex.P.name === "disabled"}>
                  <SelectRuleField
                    id={id}
                    meta={meta}
                    metaVertex={metaVertex}
                    selectedLayout={props.selectedLayout}
                    setValue={props.setValue}
                    txnId={props.txnId}
                  />
                </Match>
                <Match when={metaVertex.P.name === "class"}>
                  <CSSPropertiesEditor
                    data={props.selectedLayout}
                    meta={metaVertex}
                    setValue={(data) => props.setValue(metaVertex, data)}
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
                    id={id}
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
    </>
  );
}
