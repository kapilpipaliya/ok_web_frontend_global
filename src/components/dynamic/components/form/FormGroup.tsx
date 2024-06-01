import { toTitle } from "case-switcher-js";
import { For, Match, Switch, createMemo } from "solid-js";
import type { Store, SetStoreFunction } from "solid-js/store";
import { type Vertex, type GraphInterface, IdAttr } from "~/lib/graph/graph";
import { DynamicComponent } from "../DynamicComponent";
import { getCollAttrComp } from "~/lib/graph/get/sync/graph_functions";
import { getSelectionOptions } from "~/lib/graph/get/sync/traverse";

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
export function FormGroup(props: FormGroupProps) {
    return (
        <For each={props.metaAttributes}>
            {(metaVertex) => {
                const id = `${props.vertex.id + metaVertex.P[IdAttr] + "Label"}`;
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
                        isShowAdd={true}
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
                        <Match when={component() === "Table2"}>
                            {/* <h3><Label/></h3> */}
                            <Content />
                        </Match>

                        <Match when={component() === "CollectionOption"}>
                            <Content />
                        </Match>

                        <Match when={true}>
                            <div class="grid-cols:2 " style={{ "padding-top": "5px" }}>
                                <div id={id}>
                                    {props.labelPrefix as string} <Label />
                                </div>
                            </div>
                            <div>
                                <Content />
                            </div>
                        </Match>
                    </Switch>
                );
            }}
        </For>
    );
}


export function getComponentForCollRow(
    metaVertex: Vertex,
    data: Vertex,
    graph: Store<GraphInterface>,
    setGraph: SetStoreFunction<GraphInterface>,
) {
    if (!metaVertex.P.component) {
        return getCollAttrComp(metaVertex, graph)?.P[IdAttr];
    } else if (metaVertex.P.component.includes("-")) {
        return getSelectionOptions(graph, setGraph, [data], metaVertex.P.component)
            .vertexes;
    } else {
        return metaVertex.P.component as string;
    }
}
