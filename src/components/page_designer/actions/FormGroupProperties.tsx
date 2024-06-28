import { Show, createMemo, For, Match, Switch, useContext, createUniqueId, onCleanup } from "solid-js";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import { GraphContext, IdAttr, type Vertex } from "~/lib/graph/graph";
import { toTitle } from "case-switcher-js";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { CSSPropertiesEditor } from "~/components/css_properties/CSSPropertiesEditor";
import { Icon } from "@iconify-icon/solid";
import { getComponentForCollRow } from "~/components/form/getComponentForCollRow";
import { ValidationConfig } from "./ValidationConfig";
import { PageConfigContext, SelectedComponentContext } from "~/lib/contexts";
import { addNewVertex, deleteVertex, mergeVertexProperties, newVertex } from "~/lib/graph/mutate/vertex";
import { isUniqueIdUsed } from "~/lib/drag_drop/getChildrenAttrs";
import {getMetaProps} from "~/lib/graph/get/sync/graph_functions";
import { FormMetaData } from "~/lib/formMetaData";
import { createWritableMemo } from "@solid-primitives/memo";


interface FormGroupPropertiesProps {
  metaAttributes: Vertex[];
  txnId: number;
  selectedLayout: Vertex;

  setValue(meta: Vertex, data: any): void;
}

export function FormGroupProperties(props: FormGroupPropertiesProps) {
  const { Ws } = useContext(WsContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  const [selectedComponent, setSelectedComponent] = useContext(SelectedComponentContext);
  const [pageConfig, __] = useContext(PageConfigContext);

  const nameVertexId = `nameVertex${createUniqueId()}`;
  const classVertexId = `classVertex${createUniqueId()}`;

  addNewVertex(0, newVertex(nameVertexId, ["MetaTemp"], { name: 'name', displayName: 'Unique Name', class: 'border:1px|solid|#ccc p:2' }), graph, setGraph);
  addNewVertex(0, newVertex(classVertexId, ["MetaTemp"], { name: 'class', displayName: 'Class' }), graph, setGraph);

  function moveClassToLast(vertices: Vertex[]) {
    // const nameVertex = vertices.filter(vertex => vertex.P.name === 'name');
    // const classVertex = vertices.filter(vertex => vertex.P.name === 'class');
    const otherVertices = vertices.filter(vertex => vertex.P.name !== 'name' && vertex.P.name !== 'class');

    return [graph.vertexes[nameVertexId], ...otherVertices, graph.vertexes[classVertexId]];
  }

  onCleanup(() => {
    deleteVertex(0, nameVertexId, graph, setGraph);
    deleteVertex(0, classVertexId, graph, setGraph);
  });

  return (
    <>

      {/*<div class="dx-field">*/}
      {/*  <div class="dx-field-label">*/}
      {/*    Data*/}
      {/*  </div>*/}
      {/*  <div class="dx-field-value flex gap:2 justify-content:space-between">*/}
      {/*    <GenericInputField*/}
      {/*        data={props.selectedLayout}*/}
      {/*        meta={*/}
      {/*          {*/}
      {/*            P: {*/}
      {/*              [IdAttr]: "data",*/}
      {/*            },*/}
      {/*          } as unknown as Vertex*/}
      {/*        }*/}
      {/*        disabled={false}*/}
      {/*        component={"TextBox"}*/}
      {/*        setValue={props.setValue}*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*</div>*/}

      <div class="">
        <ValidationConfig
          meta={{ P: { name: "validation" } } as unknown as Vertex}
          data={props.selectedLayout}
          componentMeta={graph.vertexes[selectedComponent()?.vertexId]}
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
          const metaProps = getMetaProps(graph, setGraph, meta(), meta());
          const P = {
            ...meta().P,
            ...metaProps
          }
         const v = { ...metaVertex, P };
         setMeta(v);

          const Label = () => (
            <>
              {toTitle(
                metaVertex.P.displayName ||
                metaVertex.P[IdAttr] ||
                metaVertex.P.key ||
                "",
              )}
            </>
          );
          const Content = () => (
            <DynamicComponent
              component={component()}
              meta={meta()}
              data={props.selectedLayout}
              setValue={(data) => props.setValue(meta(), data)}
              // disabled={props.d}
              txnId={props.txnId}
              isRealTime={false}
            />
          );

          const UniqueNameField = () => (
            <div class={`flex gap:2 mt:6 justify-content:space-between ai:center ${props.selectedLayout?.P[metaVertex.P[IdAttr]] !== undefined && props.selectedLayout?.P[metaVertex.P[IdAttr]] !== null ? 'b:2px|solid|#008000 p:2|3 r:5 bt:none bb:none' : ''}`}>
              <span class="flex:.5 f:15" id={id}>
                <Label />
              </span>
              <span class="flex:1 f:15">
                <DynamicComponent
                  component={component()}
                  meta={meta()}
                  data={props.selectedLayout}
                  setValue={(data: string) => {
                    if (metaVertex.P.name === "name") {
                      if (data.length) {
                        if (isUniqueIdUsed(graph, setGraph, pageConfig.formData.formData, props.selectedLayout, data)) {
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
                  }}
                  txnId={0}
                  isRealTime={false}
                />
              </span>
            </div>
          );

          return (
            <div><Switch>
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
                <h3>
                  <Label />
                </h3>
                <Content />
              </Match>
              <Match when={component() === "CollectionOption"}>
                <Content />
              </Match>
              <Match when={metaVertex.P.name === "name"}>
                <UniqueNameField />
              </Match>
              <Match when={props.selectedLayout}>
                <div class={`flex gap:2 mt:6 justify-content:space-between ai:center ${props.selectedLayout?.P[metaVertex.P[IdAttr]] !== undefined && props.selectedLayout?.P[metaVertex.P[IdAttr]] !== null ? 'b:2px|solid|#008000 p:2|3 r:5 bt:none bb:none' : ''}`}>
                  <span class="flex:.5 f:15" id={id}>
                    <Label />
                  </span>
                  <span class="flex:1 f:15">
                    <Content />
                    {/* Select Rules: */}
                    {/*<SelectInputField*/}
                    {/* component={"SelectBox"}*/}
                    {/* data={{ P: {} } as Vertex}*/}
                    {/* meta={*/}
                    {/*   {*/}
                    {/*     P: {*/}
                    {/*       [IdAttr]: "import",*/}
                    {/*         displayExpr: "$P.name",*/}
                    {/*         collection: `ids:'${props.selectedLayout.id}'->Rules`*/}
                    {/*     },*/}
                    {/*   } as unknown as Vertex*/}
                    {/* }*/}
                    {/* setValue={(attr,vertex, data) => 0}*/}
                    {/*/>*/}
                  </span>
                  <Show when={props.selectedLayout?.P[metaVertex.P[IdAttr]] !== undefined && props.selectedLayout?.P[metaVertex.P[IdAttr]] !== null}>
                    <span>
                      <Icon
                        class="cursor:pointer color:#ff0000"
                        icon="mdi:close"
                        data-testid="clearIcon"
                        onClick={() => props.setValue(metaVertex, null)}
                      />
                    </span>
                  </Show>
                </div>
              </Match>
            </Switch></div>
          );
        }}
      </For>
    </>
  );
}