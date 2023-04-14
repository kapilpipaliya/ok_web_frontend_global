import { createSignal } from "solid-js";
import { Navbar } from "./components/Navbar";


import { navItems, homeGalleryData, todayData } from "./data";
import { GallerySection } from "./components/GallerySection";
import List from "devextreme/ui/list";
import { Link } from "@solidjs/router";
import { Icon } from "@iconify-icon/solid";

import { ActionCards } from "./components/ActionCards";
import { TodaysEnergizerSection } from "./components/TodaysEnergizerSection";
import { newVertex } from "../../lib/Vertex";
import { DrawerComponent } from "../../components/core/Drawer";
import { Vertex } from "../../lib/graph";

export default function Home() {
  const navTemplate = function (e: Element) {
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
                <div class={itemIndex==0 ? "flex flex:column jc:center gap:9 px:6" : "flex ai:center gap:10 px:6"}>
                  {itemIndex == 0 ? (
                    <>
                      <Icon icon={itemData.icon} width={30} style={{color: "#999"}} />
                      <Link
                        href={itemData.link}
                        class="text-decoration:none color:red font-weight:400"
                      >
                        {itemData.text}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Icon icon={itemData.icon} width={17} />
                      <Link
                        href="src/pages/home/home#"
                        class="text-decoration:none color:#111 font-weight:400"
                      >
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
            elementAttr: { class: "dx-theme-background-color" },
          });
        }}
      />
    );
  };

  const [isSideBarOpen, setSideBarOpen] = createSignal(false);

  // Meta
  const navbarMeta = newVertex(0, ["Meta"], {
    id: "navbar",
    props: {
      position: "right",
      openedStateMode: "overlap",
      closeOnOutsideClick: true,
      revealMode: "expand",
      maxSize: 250,
    },
  });

  const galleryMeta = newVertex(0, ["Meta"], {
    id: "gallery",
    props: { width: "100%", stretchImages: true },
  });

  const todayEnergizerMeta = newVertex(0, ["Meta"], {
    id: "todayEnergizer",
    props: {},
  });

  // Data
  const navbarData = newVertex(0, ["Vertex"], { navbar: navItems });

  const galleryData = newVertex(0, ["Vertex"], { gallery: homeGalleryData });

  const drawerData = newVertex(0, ["Vertex"], {})

  const actionCardsData = newVertex(0, ["Vertex"], {})

  const todaysEnergizerData = newVertex(0, ["Vertex"], { title: "Today's Energizer", todayEnergizer: todayData })

  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return (
    <div class="">
      <DrawerComponent
        isSideBarOpen={isSideBarOpen}
        setSideBarOpen={setSideBarOpen}
        template={navTemplate}
        meta={navbarMeta}
        data={drawerData}
        setValue={setValue}
      >
        <Navbar
          isSideBarOpen={isSideBarOpen}
          setSideBarOpen={setSideBarOpen}
          meta={navbarMeta}
          data={navbarData}
          setValue={setValue}
        />

        <div class="p:15 bg:#f7f7f7">
          <ActionCards meta={galleryMeta} data={actionCardsData} setValue={setValue} />

          <GallerySection meta={galleryMeta} data={galleryData} setValue={setValue} />

          {/* <TodaysEnergizerSection meta={todayEnergizerMeta} data={todaysEnergizerData} setValue={setValue} /> */}
        </div>
      </DrawerComponent>
    </div>
  );
}
