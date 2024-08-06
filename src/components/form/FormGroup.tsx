import type { SetStoreFunction, Store } from "solid-js/store";

import { toTitle } from "case-switcher-js";
import { createMemo, For, Match, Switch } from "solid-js";

import { getComponentForCollRow } from "~/lib/graph/get/sync/getComponentForCollRow";
import { type GraphInterface, IdAttr, type Vertex } from "~/lib/graph/graph";

import { DynamicComponent } from "./DynamicComponent";

interface FormGroupProps {
  graph: Store<GraphInterface>;
  isLoginRegister?: string;
  metaAttributes: Vertex[];
  setGraph: SetStoreFunction<GraphInterface>;
  txnId: number;
  vertex: Vertex;
}

// group of the fields
export function FormGroup(props: Readonly<FormGroupProps>) {
  return (
    <For each={props.metaAttributes}>
      {(metaVertex) => {
        const id = `${props.vertex.id}${metaVertex.P[IdAttr]}Label`;
        const componentName = createMemo(() =>
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
            componentName={componentName()}
            data={props.vertex}
            // TODO: Remove this when permissions are working For inbuilt forms.
            isNoPermissionCheck={true}
            isRealTime={false}
            isTableInside={true}
            meta={metaVertex}
            // setValue={props.setValue}
            title={toTitle(
              metaVertex.P.displayName ||
                metaVertex.P[IdAttr] ||
                metaVertex.P.key ||
                "",
            )}
            // disabled={props.d}
            txnId={props.txnId}
          />
        );
        // TODO: Make permissions working.
        // const permissions = metaVertex.P.metaId
        //   ? getPermissions(props.graph.vertexes[metaVertex.P.metaId])
        //   : getPermissions(metaVertex);

        return (
          <Switch>
            <Match when={componentName() === "DynamicTable"}>
              {/* <h3><Label/></h3> */}
              <Content />
            </Match>

            <Match when={true}>
              <div class="align-content:center">
                <div class="grid-cols:2 pt:5px">
                  <div id={id}>
                    <Label />
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
