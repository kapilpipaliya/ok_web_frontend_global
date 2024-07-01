import { Show, createMemo, For, Match, Switch, useContext, createUniqueId, onCleanup, type Accessor } from "solid-js";
import { GraphContext, IdAttr, type Vertex } from "~/lib/graph/graph";
import { toTitle } from "case-switcher-js";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { CSSPropertiesEditor } from "~/components/css_properties/CSSPropertiesEditor";
import { Icon } from "@iconify-icon/solid";
import { getComponentForCollRow } from "~/components/form/getComponentForCollRow";
import { ValidationConfig } from "../ValidationConfig";
import { addNewVertex, deleteVertex, mergeVertexProperties, newVertex } from "~/lib/graph/mutate/vertex";
import { isUniqueIdUsed } from "~/lib/drag_drop/getChildrenAttrs";
import { getPropsFromMetaExpression } from "~/lib/graph/get/sync/getProps";
import { FormMetaData } from "~/lib/formMetaData";
import { createWritableMemo } from "@solid-primitives/memo";
import { useDesignerLayoutStore } from "../../LayoutContext";
import { PROPERTIES } from "./constant";

interface FormGroupPropertiesProps {
  metaAttributes: Vertex[];
  txnId: number;
  selectedLayout: Vertex;
  setValue(meta: Vertex, data: any): void;
}

export function FormGroupProperties(props: Readonly<FormGroupPropertiesProps>) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [layoutStore] = useDesignerLayoutStore();

  const nameVertexId = `nameVertex${createUniqueId()}`;
  const classVertexId = `classVertex${createUniqueId()}`;
  const defaultValueVertexId = `defaultValueVertex${createUniqueId()}`;

  addNewVertex(0, newVertex(nameVertexId, ["MetaTemp"], { name: 'name', displayName: 'Unique Name', class: PROPERTIES.Css.TextBox, component: "TextBox" }), graph, setGraph);
  addNewVertex(0, newVertex(classVertexId, ["MetaTemp"], { name: 'class', displayName: 'Class' }), graph, setGraph);
  addNewVertex(0, newVertex(defaultValueVertexId, ["MetaTemp"], { name: 'defaultValue', displayName: 'Default Value' }), graph, setGraph);

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

  const Content = (p: { meta: Accessor<Vertex>, component: Accessor<string> }) => (
    <DynamicComponent
      component={p.component()}
      meta={p.meta()}
      data={props.selectedLayout}
      setValue={(data) => props.setValue(p.meta(), data)}
      txnId={props.txnId}
      isRealTime={false}
    />
  );

  const DefaultValueContent = (p: { meta: Accessor<Vertex> }) => (
    <DynamicComponent
      component={graph.vertexes[layoutStore.selectedComponent].P.name}
      meta={graph.vertexes[layoutStore.selectedComponent]}
      data={props.selectedLayout}
      setValue={(data) => props.setValue(p.meta(), data)}
      txnId={props.txnId}
      isRealTime={false}
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

  const UniqueNameField = (p: { metaVertex: Vertex, id: string, meta: Accessor<Vertex> }) => (
    <div class={`flex gap:2 mt:6 justify-content:space-between ai:center ${props.selectedLayout?.P[p.metaVertex.P[IdAttr]] !== undefined && props.selectedLayout?.P[p.metaVertex.P[IdAttr]] !== null ? 'b:2px|solid|#008000 p:2|3 r:5 bt:none bb:none' : ''}`}>
      <span class="flex:.5 f:15" id={p.id}>
        <Label metaVertex={p.metaVertex} />
      </span>
      <span class="flex:1 f:15">
        <DynamicComponent
          component={"TextBox"}
          meta={p.meta()}
          data={props.selectedLayout}
          setValue={(data: string) => setUniqueNameValue(p.metaVertex, data)}
          txnId={0}
          isRealTime={false}
        />
      </span>
    </div>
  );

  const HighlightSetValue = (p: { metaVertex: Vertex, id: string, meta: Accessor<Vertex>, component: Accessor<string> }) => (
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
            <Content meta={p.meta} component={p.component} />
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
            icon="mdi:close"
            data-testid="clearIcon"
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
          meta={{ P: { name: "validation" } } as unknown as Vertex}
          data={props.selectedLayout}
          componentMeta={graph.vertexes[layoutStore.selectedComponent]}
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
              meta: valueAttribute.meta,
              component: valueAttribute.component
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
                  <UniqueNameField metaVertex={metaVertex} id={id} meta={meta} />
                </Match>
                <Match when={metaVertex.P.name === "class"}>
                  <CSSPropertiesEditor
                    component={component()}
                    meta={metaVertex}
                    data={props.selectedLayout}
                    setValue={(data) => props.setValue(metaVertex, data)}
                    txnId={props.txnId}
                  />
                </Match>
                <Match when={component() === "Table"}>
                  <h3><Label metaVertex={metaVertex} /></h3>
                  <Content meta={meta} component={component} />
                </Match>
                <Match when={props.selectedLayout}>
                  <HighlightSetValue metaVertex={metaVertex} id={id} meta={meta} component={component} />
                </Match>
              </Switch>
            </div>
          );
        }}
      </For>
    </>
  );
}
