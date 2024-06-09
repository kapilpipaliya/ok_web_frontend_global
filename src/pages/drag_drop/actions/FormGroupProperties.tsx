import {createMemo, For, Match, Switch, useContext} from "solid-js";
import {WsContext} from "~/lib/websocket/ws_events_dispatcher";
import {GraphContext, IdAttr, type Vertex} from "~/lib/graph/graph";
import {getComponentForCollRow} from "~/components/form/FormGroup";
import {toTitle} from "case-switcher-js";
import {DynamicComponent} from "~/components/form/DynamicComponent";
import {ClassDesignTab} from "~/components/css_properties/PropertiesTabs";

interface FormGroupPropertiesProps {
  metaAttributes: Vertex[];
  vertex: Vertex;
  txnId: number;
  selectedLayout: Vertex;

  setValue(meta: Vertex, data: any): void;
}

export function FormGroupProperties(props: FormGroupPropertiesProps) {
  // @ts-ignore
  const {Ws} = useContext(WsContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  return (
    <>
      {/*<div class="dx-field">*/}
      {/*  <div class="dx-field-label">*/}
      {/*    Data*/}
      {/*  </div>*/}
      {/*  <div class="dx-field-value flex gap:2 justify-content:space-between">*/}
      {/*    <GenericInputField*/}
      {/*        data={props.vertex}*/}
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
      <table class="min-w:100%">
        <tbody>
        <For each={props.metaAttributes}>
          {(metaVertex) => {
            const id = `${props.vertex.id + metaVertex.P[IdAttr]}Label`;
            const component = createMemo(() =>
              getComponentForCollRow(
                metaVertex,
                props.vertex,
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
                data={props.vertex}
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
                    data={props.vertex}
                    setValue={(data) => props.setValue(metaVertex, data)}
                    txnId={props.txnId}
                  />
                </Match>
                <Match when={component() === "Table"}>
                  <h3>
                    <Label/>
                  </h3>
                  <Content/>
                </Match>
                <Match when={component() === "CollectionOption"}>
                  <Content/>
                </Match>
                <Match when={props.selectedLayout}>
                  <tr>
                    <td class="pr:2" id={id}>
                      <Label/>
                    </td>
                    <td class="justify-content:end">
                      <Content/>
                      {/* Select Rules: */}
                      {/*<SelectInputField*/}
                      {/* component={"SelectBox"}*/}
                      {/* data={{ P: {} } as Vertex}*/}
                      {/* meta={*/}
                      {/*   {*/}
                      {/*     P: {*/}
                      {/*       [IdAttr]: "import",*/}
                      {/*       props: {*/}
                      {/*         displayExpr: "$P.name",*/}
                      {/*         collection: `ids:'${props.selectedLayout.id}'->Rules`*/}
                      {/*       },*/}
                      {/*     },*/}
                      {/*   } as unknown as Vertex*/}
                      {/* }*/}
                      {/* setValue={(attr,vertex, data) => 0}*/}
                      {/*/>*/}
                    </td>
                  </tr>
                </Match>
              </Switch>
            );
          }}
        </For>
        </tbody>
      </table>
    </>
  );
}