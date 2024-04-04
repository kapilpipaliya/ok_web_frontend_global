import {Icon} from "@iconify-icon/solid";
import {useLocation} from "@solidjs/router";
import {Show, createEffect, createMemo, createSignal, createUniqueId, untrack, useContext} from "solid-js";
import {getSublistRows, getSublistRowsForType, Record} from "../lib/Utils";
import { getChildVertex } from "../lib/Utils";
import {findVertexByLabelAndUniqueId} from "../lib/Vertex";
import {AttrsAdminTableData} from "../lib/apiAdmin";
import {Vertex} from "../lib/graph";
import treeViewFilter from "../lib/treeViewFilter";
import {WsContext} from "../utils/ws_events_dispatcher";
import {LoaderNew, LoaderSimple} from "./LoaderSimple";
import SidebarElement from "./SidebarElement";
import logo from "../../assets/logo/RGB_logo_web.jpg";
import './css/sideBarSearch.css'; // Import the CSS file


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
    const location = useLocation();
    const pathname = createMemo(() => location.pathname);

    const [searchTerm, setSearchTerm] = createSignal("");
    const [openIds, setOpenIds] = createSignal<string[]>([]);
    const [isSearchMode, setIsSearchMode] = createSignal(false);
    const [searchData, setSearchData] = createSignal<navbarDataI[]>([]);
    const {Ws} = useContext(WsContext);

    const navData = createMemo(() => {
        const nav = findVertexByLabelAndUniqueId("Nav", "name", "main");
        if (!nav) return;

        const record = new Record({ws: Ws});
        record.load(nav.id);
        untrack(() => record.createMeta(AttrsAdminTableData["Nav"]));
        return renderNavTreeFromGraph(record, props.isSideBarOpen);
    });

    createEffect(() => {
        const nav = navData();
        if (!nav || nav.length === 0) return;
        const loadPath = pathname();

        const result: navbarDataI[] = treeViewFilter(nav, (node: navbarDataI) => loadPath === node.href);
        setOpenIds((prev) => [...prev, ...getIds(result)]);
    });

    function handleSearch(input: string) {
        setSearchTerm(input);

        const searchName = input.trim().toLowerCase();
        setIsSearchMode(searchName.length > 0);

        if (searchName.length === 0) return;

        const res = navData();
        if (!res) return;
        const result: navbarDataI[] = treeViewFilter(res, (node: navbarDataI) =>
            node.name.toLowerCase().includes(searchName),
        );

        setSearchData(result);
    }

    createEffect(() => {
        const res = navData();
        if (!res) return;

        if (isSearchMode()) {
            const ids = res
                .map((e) => {
                    if (e.expanded !== undefined) return e.id;
                    return null;
                })
                .filter((e) => e) as string[];
            setOpenIds(ids);
            return;
        }
        resetSearch();
    });

    function resetSearch() {
        setIsSearchMode(false);
        setSearchData([]);
        setSearchTerm("");
    }

    return (
        <div class="position:fixed top:0 left:0 border-right:1 h:full bg:white overflow-y:auto w:220 r:0|10|10|0" style={{"box-shadow":"-15px 0px 31px rgba(0,0,0,0.75)","border-right":"1px solid lightgray"}}>
            <img src={logo} height={30} alt={'logo'} style={{'padding': '10px'}}/>
            <nav class="flex bg:white 0px 0px 10px 10px">
                <div class="group">
                    <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
                        <g>
                            <path
                                d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                        </g>
                    </svg>
                    <input placeholder="Search..." type="search" class="inputSearch f:14" value={searchTerm()} onInput={(e) => {
                        handleSearch(e.target.value);
                    }}/>
                </div>
            </nav>

            <Show
                when={navData()}
                fallback={
                    <div class="flex jc:center ai:center h:70%">
                        <LoaderNew class="h:30 w:30 align-self:center"/>
                    </div>
                }
            >
                <ul>
                    <SidebarElement
                        openIds={openIds()}
                        setOpenIds={setOpenIds}
                        resetSearch={resetSearch}
                        navbarData={isSearchMode() ? searchData() : navData() ?? []}
                        isSearchMode={isSearchMode()}
                    />
                </ul>
            </Show>
        </div>
    );
}

export default Sidebar;

const renderNavTreeFromGraph = (record: Record, showNav: boolean) => {
    // !!!TODO!!!: This code can we written in the code itself
    const getChildren = (meta: Vertex, vertex: Vertex) => {
        // rome-ignore lint/suspicious/noExplicitAny: <explanation>
        const result = [] as any[];

        const metaVertexes = getSublistRowsForType("MetaAttr", meta);
        const attrMeta = metaVertexes.find((meta) => meta.P.name === "Attr");

        if (!attrMeta) return result;

        const children = getSublistRows(attrMeta, vertex);

        for (const child of children) {
            const name = child.P.name;
            const func = child.P.func;
            const expanded = child.P.expanded;
            // rome-ignore lint/suspicious/noExplicitAny: <explanation>
            const navItem = {} as any;

            if (func === "Table") {
                const collVertex = getChildVertex(["$0Coll"], child).vertex;
                // TODO: Check Permission
                if (collVertex) {
                    // TODO: Check Permission
                    // add to result if its allowed
                    navItem.name = name;
                    navItem.href = `/admin/${collVertex.P.name}`;
                } else {
                    const formVertex = getChildVertex(["$0Form"], child).vertex;
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
