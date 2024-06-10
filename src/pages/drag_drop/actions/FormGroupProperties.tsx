import { Show, createMemo, For, Match, Switch, useContext } from "solid-js";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import { GraphContext, IdAttr, type Vertex } from "~/lib/graph/graph";
import { getComponentForCollRow } from "~/components/form/FormGroup";
import { toTitle } from "case-switcher-js";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { ClassDesignTab } from "~/components/css_properties/PropertiesTabs";
import { Icon } from "@iconify-icon/solid";

interface FormGroupPropertiesProps {
  metaAttributes: Vertex[];
  txnId: number;
  selectedLayout: Vertex;

  setValue(meta: Vertex, data: any): void;
}

export function FormGroupProperties(props: FormGroupPropertiesProps) {
  // @ts-ignore
  const { Ws } = useContext(WsContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  function moveClassToLast(vertices: any) {
    const classVertex = vertices.filter((vertex: any) => vertex.P.name === 'class');
    const otherVertices = vertices.filter((vertex: any) => vertex.P.name !== 'class');
    return otherVertices.concat(classVertex);
  }
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

      <For each={moveClassToLast(props.metaAttributes)}>
        {(metaVertex) => {
          const id = `${props.selectedLayout.id + metaVertex.P[IdAttr]}Label`;
          const component = createMemo(() =>
            getComponentForCollRow(
              metaVertex,
              props.selectedLayout,
              graph,
              setGraph,
            ),
          );
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
              meta={metaVertex}
              data={props.selectedLayout}
              setValue={(data) => props.setValue(metaVertex, data)}
              // disabled={props.d}
              txnId={props.txnId}
              isRealTime={false}
            />
          );

          return (
            <Switch>
              <Match when={metaVertex.P.name === "class"}>
                <ClassDesignTab
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
                    <span class="flex:.25">
                      <Icon
                        class="clickable"
                        icon="mdi:close"
                        data-testid="clearIcon"
                        onClick={() => props.setValue(metaVertex, null)}
                      />
                    </span>
                  </Show>
                </div>
              </Match>
            </Switch>
          );
        }}
      </For>
    </>
  );
}