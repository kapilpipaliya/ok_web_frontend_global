import { Icon } from "@iconify-icon/solid";
import { createMemo, createSignal, createUniqueId, untrack, useContext } from "solid-js";
import { Record } from "../lib/Record";
import { getChildVertex } from "../lib/Traverse";
import { findVertexByLabelAndUniqueId } from "../lib/Vertex";
import { AttrsAdminTableData } from "../lib/apiAdmin";
import { Vertex } from "../lib/graph";
import { showNav } from "../pages/Dashboard";
import { WsContext } from "../utils/ws_events_dispatcher";
import SidebarElement from "./SidebarElement";

export interface navbarDataI {
  children: navbarDataI[];
  expanded: boolean;
  href: string;
  id: string;
  name: string;
}

function Sidebar(props: { isVisible: boolean }) {
  let searchInputRef: HTMLInputElement;
  const [isSearchMode, setIsSearchMode] = createSignal(false);
  const [searchData, setSearchData] = createSignal<navbarDataI[]>([]);
  const { Ws } = useContext(WsContext);

  const navData = createMemo(() => {
    const nav = findVertexByLabelAndUniqueId("Nav", "name", "main");
    if (!nav) {
      console.log("no Nav Found");
      return;
    }
    const record = new Record({ ws: Ws });
    record.load(nav.id);
    untrack(() => record.createMeta(AttrsAdminTableData["Nav"]));
    return renderNavTreeFromGraph(record);
  });

  const searchDataDict = createMemo(() => {
    const data = navData();
    if (!data) return;

    const searchDict: { [key: string]: navbarDataI[] } = {};

    function createSearchIndex(data: navbarDataI[]) {
      data.forEach((e) => {
        const key = e.name.toLowerCase();
        if (searchDict[key]) {
        } else {
          searchDict[key] = [];
        }
        searchDict[key].push(e);
        if (e.children) {
          createSearchIndex(e.children);
        }
      });
    }

    createSearchIndex(data);

    return searchDict;
  });

  const searchKeys = createMemo(() => {
    const data = searchDataDict();
    if (!data) return;

    return Object.keys(data);
  });

  function handleSearch(searchTerm: string) {
    searchTerm = searchTerm.trim().toLowerCase();
    setIsSearchMode(searchTerm.length > 0);

    if (searchTerm.length === 0) return;
    const data = searchDataDict();
    const keys = searchKeys();
    if (!keys || !data) return;

    const filteredKeys = keys.filter((e) => e.toLowerCase().startsWith(searchTerm.toLowerCase()));

    const result = filteredKeys.map((e) => data[e]);
    setSearchData(result.flat());
  }

  function resetSearch() {
    setIsSearchMode(false);
    setSearchData([]);
    searchInputRef.value = "";
  }
  return (
    <div
      class={`border-right:1 min-vh overflow-y:auto ${props.isVisible ? "w:200" : "w:0"}`}
      style={{ transition: "width .3s ease-in-out" }}
    >
      <nav class="flex bg:white position:relative">
        <div class="position:absolute top:7 left:8 font:20">
          <Icon icon="ic:baseline-search" />
        </div>
        <input
          ref={searchInputRef!}
          class="p:7.5 min-w:full pl:2rem"
          type="text"
          onInput={(e) => {
            handleSearch(e.target.value);
          }}
        />
      </nav>
      <ul>
        <SidebarElement resetSearch={resetSearch} navbarData={isSearchMode() ? searchData() : navData() ?? []} />
      </ul>
    </div>
  );
}

export default Sidebar;

const renderNavTreeFromGraph = (record: Record) => {
  // !!!TODO!!!: This code can we written in the code itself
  const getChildren = (meta: Vertex, vertex: Vertex) => {
    const result = [] as any[];

    const metaVertexes = record.getSublistRowsForType("MetaAttr", meta);
    const attrMeta = metaVertexes.find((meta) => meta.P.name === "Attr");

    if (!attrMeta) return result;

    const children = record.getSublistRows(attrMeta, vertex);

    for (const child of children) {
      const name = child.P.name;
      const func = child.P.func;
      const expanded = child.P.expanded;
      const navItem = {} as any;

      if (func === "Table") {
        const collVertex = getChildVertex(["$0Coll"], child).vertex;
        // TODO: Check Permission
        if (collVertex) {
          // TODO: Check Permission
          // add to result if its allowed
          navItem.name = name;
          navItem.href = (showNav() ? "/nav" : "") + `/admin/${collVertex.P.name}`;
        } else {
          const formVertex = getChildVertex(["$0Form"], child).vertex;
          if (formVertex) {
            // TODO: Check Permission
            // add to result if its allowed
            navItem.name = name;
            navItem.href = `${showNav() ? "/nav" : ""}/admin/${formVertex.P.name}`;
          } else {
            const url = (showNav() ? "/nav" : "") + child.P.url;
            navItem.name = name;
            navItem.href = url;
          }
        }
      } else {
        const url = (showNav() ? "/nav" : "") + child.P.url;
        navItem.name = name;
        navItem.href = url;
      }
      navItem.expanded = expanded;
      navItem.id = createUniqueId();

      navItem.children = getChildren(attrMeta!, child);

      result.push(navItem);
    }
    return result;
  };

  const navigation: navbarDataI[] = getChildren(record.metaVertex, record.vertex);

  return navigation;
};
