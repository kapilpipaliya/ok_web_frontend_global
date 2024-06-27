import {toTitle} from "case-switcher-js";
import {createMemo, For, Match, Switch} from "solid-js";
import type {SetStoreFunction, Store} from "solid-js/store";
import {type GraphInterface, IdAttr, type Vertex} from "~/lib/graph/graph";
import {DynamicComponent} from "./DynamicComponent";
import {getComponentForCollRow} from "~/components/form/getComponentForCollRow";

interface FormGroupProps {
  metaAttributes: Vertex[];
  vertex: Vertex;
  labelPrefix: string;
  graph: Store<GraphInterface>;
  setGraph: SetStoreFunction<GraphInterface>;
  txnId: number;
  isLoginRegister?: string;
}

// group of the fields
export function FormGroup(props: Readonly<FormGroupProps>) {
  return (
    <For each={props.metaAttributes}>
      {(metaVertex) => {
        const id = `${props.vertex.id}${metaVertex.P[IdAttr]}Label`;
        const component = createMemo(() =>
          getComponentForCollRow(
            metaVertex,
            props.vertex,
            props.graph,
            props.setGraph,
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
            isTableInside={true}
            title={toTitle(
              metaVertex.P.displayName ||
                metaVertex.P[IdAttr] ||
                metaVertex.P.key ||
                "",
            )}
            data={props.vertex}
            // setValue={props.setValue}
            // disabled={props.d}
            txnId={props.txnId}
            isRealTime={false}
          />
        );
        // TODO: Make permissions working.
        // const permissions = metaVertex.P.metaId
        //   ? getPermissions(props.graph.vertexes[metaVertex.P.metaId])
        //   : getPermissions(metaVertex);

        return (
          <Switch>
            <Match when={component() === "DynamicTable"}>
              {/* <h3><Label/></h3> */}
              <Content />
            </Match>

            <Match when={true}>
              <div class="align-content:center">
                <div class="grid-cols:2 " style={{ "padding-top": "5px" }}>
                  <div id={id}>
                    {props.labelPrefix} <Label />
                  </div>
                </div>
                <div>
                  <Content />
                </div>
              </div>
            </Match>
          </Switch>
        );
      }}
    </For>
  );
}

