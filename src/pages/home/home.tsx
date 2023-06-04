import { createSignal, untrack, useContext } from "solid-js";
import { Properties as dxDrawerProperties } from "devextreme/ui/drawer";

import { navItems } from "./data";

import List from "devextreme/ui/list";
import { Link } from "@solidjs/router";
import { Icon } from "@iconify-icon/solid";

import { graph, Vertex } from "../../lib/graph";
import { PageItemRender } from "../../components/input/GenaricField";
import { PageContext, Record } from "../../lib/Record";
import { WsContext } from "../../components/ws_events_dispatcher";
import { Properties as dxGalleryProperties } from "devextreme/ui/gallery";

export default function Home() {
 const navTemplate = function(e: Element) {

  return (
   <div
    ref={(el) => {
     new List(el, {
      itemTemplate: (itemData: any, itemIndex: any, itemElement: any) => {
       const itemParent = itemElement.parentElement;
       if (itemIndex == 0) {
        console.log(itemElement);
        itemParent.style.marginTop = "10px";
        itemParent.style.paddingBottom = "8px";
        itemParent.style.borderBottom = "1px solid #ddd";
       } else {
        itemParent.style.borderTop = "none";
        itemParent.style.marginBottom = "5px";
        itemParent.style.marginTop = "5px";
       }

       return (
        <div
         class={itemIndex == 0 ? "flex flex:column jc:center gap:9 px:6" : "flex ai:center gap:10 px:6"}>
         {itemIndex == 0 ? (
          <>
           <Icon icon={itemData.icon} width={30} style={{ color: "#999" }} />
           <Link href={itemData.link}
                 class="text-decoration:none color:red font-weight:400">
            {itemData.text}
           </Link>
          </>
         ) : (
          <>
           <Icon icon={itemData.icon} width={17} />
           <Link href="src/pages/home/home#"
                 class="text-decoration:none color:#111 font-weight:400">
            {itemData.text}
           </Link>
          </>
         )}
        </div>
       );
      },
      dataSource: navItems,
      hoverStateEnabled: false,
      activeStateEnabled: false,
      focusStateEnabled: false,
      elementAttr: { class: "dx-theme-background-color" }
     });
    }}
   />
  );
 };

 const [isSideBarOpen, setSideBarOpen] = createSignal(false);

 const { Ws } = useContext(WsContext);
 const record = new Record({ ws: Ws });
 record.create("Demo");

 const drawer = record.addNewRowUI({P: {name: "Child"}} as unknown as Vertex, record.vertex, {
   component: "Drawer",
   props: {
    opened: untrack(isSideBarOpen),
    position: "right",
    openedStateMode: "overlap",
    closeOnOutsideClick: true,
    revealMode: "expand",
    maxSize: 250,
    template: navTemplate
   } as dxDrawerProperties,
  });
 const navBar = record.addNewRowUI({P: {name: "Child"}} as unknown as Vertex, graph.vertexes[drawer.vertexId!], {
   component: "NavBar", props: { title: "AVF APP", menuPosition: "right" }
  })
 const box = record.addNewRowUI({P: {name: "Child"}} as unknown as Vertex, graph.vertexes[drawer.vertexId!], {
   component: "Box", props: { class: "p:15 bg:#f7f7f7" }
  })

 const actionCard = record.addNewRowUI({P: {name: "Child"}} as unknown as Vertex, graph.vertexes[box.vertexId!], {
   component: "ActionCard",
  })
 const gallery = record.addNewRowUI({P: {name: "Child"}} as unknown as Vertex, graph.vertexes[box.vertexId!], {
   component: "Gallery",
   props: {
    width: "100%",
    height: 500,
    stretchImages: true,
    dataSource: [
     "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person2.png",
     "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person1.png",
     "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person3.png",
     "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person4.png",
    ]} as  dxGalleryProperties
  })

 return (
  <PageContext.Provider value={{ events: { isSideBarOpen, setSideBarOpen } }}>
   <PageItemRender metaVertex={record.vertex}/>
  </PageContext.Provider>
 );
}
