import { useLocation } from "@solidjs/router";
import { Show, createEffect, createMemo, createSignal, createUniqueId, untrack, useContext } from "solid-js";
import { getSublistRows, getSublistRowsForType, Record } from "../lib/Utils";
import { getChildVertex } from "../lib/Utils";
import { findVertexByLabelAndUniqueId } from "../lib/Vertex";
import { AttrsAdminTableData } from "../lib/apiAdmin";
import { GraphContext, GraphInterface, Vertex } from "../lib/graph";
import treeViewFilter from "../lib/treeViewFilter";
import { WsContext } from "../utils/ws_events_dispatcher";
import { LoaderNew } from "./LoaderSimple";
import SidebarElement from "./SidebarElement";
import logo from "../../assets/logo/RGB_logo_web.jpg";
import './css/sideBarSearch.css';
import { Store } from "solid-js/store"; // Import the CSS file


export interface navbarDataI {
    children: navbarDataI[];
    expanded: boolean;
    href: string;
    id: string;
    name: string;
}

function getIds(data: navbarDataI[], ids: string[] = []) {
    for (const e of data) {
        if (e.expanded !== undefined) ids.push(e.id);
        getIds(e.children, ids);
    }
    return ids;
}

function Sidebar(props: { isSideBarOpen: boolean }) {
    const [graph, setGraph] = useContext(GraphContext)!;
    const { Ws } = useContext(WsContext);

    const navData = createMemo(() => {
        const nav = findVertexByLabelAndUniqueId("Nav", "name", "Navigation", graph);
        if (!nav) return;

        const record = new Record({ ws: Ws });
        record.load(graph, nav.id);
        untrack(() => record.createMeta(AttrsAdminTableData["Nav"], graph, setGraph));

        return renderNavTreeFromGraph(record, props.isSideBarOpen, graph);
    });

    const sidebarStyle = {
        width: '300px',
        background: '#f4f4f4',
        transition: 'transform 0.3s ease-in-out',
        transform: props.isSideBarOpen ? 'translateX(0)' : 'translateX(-100%)',
        "box-shadow": "-15px 0px 31px rgb(95,156,249)",
        "border-right": "1px solid lightgray"
    };
    return (
        <div class="r:0|10|10|0 " style={sidebarStyle}>


            <Show
                when={navData()}
                fallback={
                    <div class="flex jc:center ai:center h:70%">
                        <LoaderNew class="h:30 w:30 align-self:center" />
                    </div>
                }
            >
                <ul>
                    <SidebarElement
                        navbarData={navData() ?? []}
                    />
                </ul>
            </Show>
        </div>
    );
}

export default Sidebar;

export const renderNavTreeFromGraph = (record: Record, showNav: boolean, graph: Store<GraphInterface>) => {
    // !!!TODO!!!: This code can we written in the code itself
    const getChildren = (meta: Vertex, vertex: Vertex) => {
        // rome-ignore lint/suspicious/noExplicitAny: <explanation>
        const result = [] as any[];

        const metaVertexes = getSublistRowsForType(graph, "MetaAttr", meta);
        const attrMeta = metaVertexes.find((meta) => meta.P.name === "Attr");

        if (!attrMeta) return result;

        const children = getSublistRows(graph, attrMeta, vertex);

        for (const child of children) {
            const name = child.P.name;
            const func = child.P.func;
            const expanded = child.P.expanded;
            // rome-ignore lint/suspicious/noExplicitAny: <explanation>
            const navItem = {} as any;

            if (func === "Table") {
                const collVertex = getChildVertex(graph, ["$0Coll"], child,).vertex;
                // TODO: Check Permission
                if (collVertex) {
                    // TODO: Check Permission
                    // add to result if its allowed
                    navItem.name = name;
                    navItem.href = `/admin/${collVertex.P.name}`;
                } else {
                    const formVertex = getChildVertex(graph, ["$0Form"], child).vertex;
                    if (formVertex) {
                        // TODO: Check Permission
                        // add to result if its allowed
                        navItem.name = name;
                        navItem.href = `/admin/${formVertex.P.name}`;
                    } else {
                        const url = ("") + child.P.url;
                        navItem.name = name;
                        navItem.href = url;
                    }
                }
            } else {
                const url = ("") + child.P.url;
                navItem.name = name;
                navItem.href = url;
            }
            navItem.expanded = expanded;
            navItem.id = createUniqueId();

            // rome-ignore lint/style/noNonNullAssertion: <explanation>
            navItem.children = getChildren(attrMeta!, child);

            result.push(navItem);
        }
        return result;
    };

    const navigation: navbarDataI[] = getChildren(record.metaVertex, record.vertex);

    return navigation;
};
