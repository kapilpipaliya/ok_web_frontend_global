import { Icon } from "@iconify-icon/solid";
import { createWritableMemo } from "@solid-primitives/memo";
import { toTitle } from "case-switcher-js";
import { type Accessor, For, Match, Show, Switch, createMemo, createUniqueId, onCleanup, useContext } from "solid-js";

import { CSSPropertiesEditor } from "~/components/css_properties/CSSPropertiesEditor";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { getComponentForCollRow } from "~/components/form/getComponentForCollRow";
import { isUniqueIdUsed } from "~/lib/drag_drop/getChildrenAttrs";
import { FormMetaData } from "~/lib/formMetaData";
import { getPropsFromMetaExpression } from "~/lib/graph/get/sync/getProps";
import { GraphContext, IdAttr, type Vertex } from "~/lib/graph/graph";
import { addNewVertex, deleteVertex, mergeVertexProperties, newVertex } from "~/lib/graph/mutate/vertex";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { ValidationConfig } from "../ValidationConfig";
import { PROPERTIES } from "./constant";

interface FormGroupPropertiesProps {
  metaAttributes: Vertex[];
  selectedLayout: Vertex;
  setValue(meta: Vertex, data: any): void;
  txnId: number;
}

export function FormGroupProperties(props: Readonly<FormGroupPropertiesProps>) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [layoutStore] = useDesignerLayoutStore();

  const nameVertexId = `nameVertex${createUniqueId()}`;
  const classVertexId = `classVertex${createUniqueId()}`;
  const defaultValueVertexId = `defaultValueVertex${createUniqueId()}`;

  addNewVertex(0, newVertex(nameVertexId, ["MetaTemp"], { class: PROPERTIES.Css.TextBox, component: "TextBox", displayName: 'Unique Name', name: 'name' }), graph, setGraph);
  addNewVertex(0, newVertex(classVertexId, ["MetaTemp"], { displayName: 'Class', name: 'class' }), graph, setGraph);
  addNewVertex(0, newVertex(defaultValueVertexId, ["MetaTemp"], { displayName: 'Default Value', name: 'defaultValue' }), graph, setGraph);

  function moveClassToLast(vertices: Vertex[]) {
    const otherVertices = vertices.filter(vertex => vertex.P.name !== 'name' && vertex.P.name !== 'class' && vertex.P.name !== 'defaultValue');
    return [graph.vertexes[nameVertexId], graph.vertexes[defaultValueVertexId], ...otherVertices, graph.vertexes[classVertexId]];
  }

  onCleanup(() => {
    deleteVertex(0, nameVertexId, graph, setGraph);
    deleteVertex(0, classVertexId, graph, setGraph);
    deleteVertex(0, defaultValueVertexId, graph, setGraph);
  });

  const Label = (props: { metaVertex: Vertex }) => (
    <>
      {toTitle(
        props.metaVertex.P.displayName ||
        props.metaVertex.P[IdAttr] ||
        props.metaVertex.P.key ||
        "",
      )}
    </>
  );

  const Content = (p: { component: Accessor<string>, meta: Accessor<Vertex> }) => (
    <DynamicComponent
      component={p.component()}
      data={props.selectedLayout}
      isRealTime={false}
      meta={p.meta()}
      setValue={(data) => props.setValue(p.meta(), data)}
      txnId={props.txnId}
    />
  );

  const DefaultValueContent = (p: { meta: Accessor<Vertex> }) => (
    <DynamicComponent
      component={graph.vertexes[layoutStore.selectedComponent].P.name}
      data={props.selectedLayout}
      isRealTime={false}
      meta={graph.vertexes[layoutStore.selectedComponent]}
      setValue={(data) => props.setValue(p.meta(), data)}
      txnId={props.txnId}
    />
  );

  function setUniqueNameValue(metaVertex: Vertex, data: string) {
    if (metaVertex.P.name === "name") {
      if (data.length) {
        if (isUniqueIdUsed(graph, setGraph, layoutStore.formData.formData, props.selectedLayout, data)) {
          return mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
            error: "Name is not unique",
          });
        }
        mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
          error: null,
        });
        return props.setValue(metaVertex, data);
      } else {
        return mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
          error: "Name is required",
        });
      }
    }
    mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
      error: null,
    });
    return props.setValue(metaVertex, data);
  }

  const UniqueNameField = (p: { id: string, meta: Accessor<Vertex>, metaVertex: Vertex }) => (
    <div class={`flex gap:2 mt:6 justify-content:space-between ai:center ${props.selectedLayout?.P[p.metaVertex.P[IdAttr]] !== undefined && props.selectedLayout?.P[p.metaVertex.P[IdAttr]] !== null ? 'b:2px|solid|#008000 p:2|3 r:5 bt:none bb:none' : ''}`}>
      <span class="flex:.5 f:15" id={p.id}>
        <Label metaVertex={p.metaVertex} />
      </span>
      <span class="flex:1 f:15">
        <DynamicComponent
          component={"TextBox"}
          data={props.selectedLayout}
          isRealTime={false}
          meta={p.meta()}
          setValue={(data: string) => setUniqueNameValue(p.metaVertex, data)}
          txnId={0}
        />
      </span>
    </div>
  );

  const HighlightSetValue = (p: { component: Accessor<string>, id: string, meta: Accessor<Vertex>, metaVertex: Vertex }) => (
    <div class={`flex gap:2 mt:6 justify-content:space-between ai:center ${props.selectedLayout?.P[p.metaVertex.P[IdAttr]] !== undefined && props.selectedLayout?.P[p.metaVertex.P[IdAttr]] !== null ? 'b:2px|solid|#008000 p:2|3 r:5 bt:none bb:none' : ''}`}>
      <span class="flex:.5 f:15" id={p.id}>
        <Label metaVertex={p.metaVertex} />
      </span>
      <span class="flex:1 f:15">
        <Switch>
          <Match when={p.metaVertex.P.name === "defaultValue"}>
            <DefaultValueContent meta={p.meta} />
          </Match>
          <Match when={true}>
            <Content component={p.component} meta={p.meta} />
          </Match>
        </Switch>
        {/* Select Rules: */}
        {/* <SelectInputField
          component={"SelectBox"}
          data={{ P: {} } as Vertex}
          meta={{
            P: {
              [IdAttr]: "import",
              displayExpr: "$P.name",
              collection: `ids:'${props.selectedLayout.id}'->Rules`
            },
          } as unknown as Vertex}
          setValue={(attr, vertex, data) => 0}
        /> */}
      </span>
      <Show when={props.selectedLayout?.P[p.metaVertex.P[IdAttr]] !== undefined && props.selectedLayout?.P[p.metaVertex.P[IdAttr]] !== null}>
        <span>
          <Icon
            class="cursor:pointer color:#ff0000"
            data-testid="clearIcon"
            icon="mdi:close"
            onClick={() => props.setValue(p.metaVertex, null)}
          />
        </span>
      </Show>
    </div>
  );

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
          const propAttribute = form.attributes.find(attr => attr.name === "Prop")!;
          const valueAttribute = propAttribute.attributes!.find(attr => attr.name === "value")!;
          const [meta, setMeta] = createWritableMemo(() => {
            const P = {
              ...metaVertex.P,
              component: valueAttribute.component,
              meta: valueAttribute.meta
            }
            return { ...metaVertex, P };
          });

          const component = createMemo(() =>
            getComponentForCollRow(
              meta(),
              meta(),
              graph,
              setGraph,
            ),
          );
          const metaProps = getPropsFromMetaExpression(graph, setGraph, meta(), meta());
          const P = {
            ...meta().P,
            ...metaProps
          }
          const v = { ...metaVertex, P };
          setMeta(v);

          return (
            <div>
              <Switch>
                <Match when={metaVertex.P.name === "name"}>
                  <UniqueNameField id={id} meta={meta} metaVertex={metaVertex} />
                </Match>
                <Match when={metaVertex.P.name === "class"}>
                  <CSSPropertiesEditor
                    component={component()}
                    data={props.selectedLayout}
                    meta={metaVertex}
                    setValue={(data) => props.setValue(metaVertex, data)}
                    txnId={props.txnId}
                  />
                </Match>
                <Match when={component() === "Table"}>
                  <h3><Label metaVertex={metaVertex} /></h3>
                  <Content component={component} meta={meta} />
                </Match>
                <Match when={props.selectedLayout}>
                  <HighlightSetValue component={component} id={id} meta={meta} metaVertex={metaVertex} />
                </Match>
              </Switch>
            </div>
          );
        }}
      </For>
    </>
  );
}
