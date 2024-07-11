import { A, useLocation, useNavigate } from "@solidjs/router";
import Dismiss from "solid-dismiss";
// import {get, set} from "idb-keyval";
import {
  type JSX,
  Show,
  createEffect,
  createSignal,
  onMount,
  
} from "solid-js";

import { useToast } from "~/components/Toast";
import "~/css/modal.css";
import { signOutCall } from "~/lib/api/api_functions";
import { API } from "~/lib/api/endpoints";
import {getAPI} from "~/lib/api/getApi";
import { APP_BASE_URL } from "~/lib/constants";
import { PageContext, useLoading } from "~/lib/contexts";
import { useGraph } from "~/lib/graph/graph";
import {
  addNewVertex,
  mergeVertexProperties,
  newVertex,
} from "~/lib/graph/mutate/vertex";
import { isPageDesignerPath } from "~/lib/utils";
import { Navbar } from "~/pages/dashboard/Navbar";

export function MainDashboard(props: Readonly<{ children?: JSX.Element }>) {
  const border = "|solid|rgb(212,219,231)";

  const [graph, setGraph] = useGraph();
  const vertexId = graph.newVertexId;
  addNewVertex(
    0,
    newVertex(vertexId, ["MainNavBarTitle"], { class: `bb:1${border}` }),
    graph,
    setGraph,
  );
  const location = useLocation();
  // on form and page designer hide the sidebar
  const handleUrlChange = () => {
    const path = location.pathname;
    setGraph(
      "isSideBarOpen",
      !(isPageDesignerPath(path)),
    );
  };

  createEffect(() => {
    handleUrlChange(); // Call the function initially
    return location.pathname; // Track changes in pathname
  });


  return (
    <div class="scrollbar-width:thin flex flex-grow:1 flex:column overflow:auto">
      <PageContext.Provider
        value={{
          events: {
            setTitle: (title: string) =>
              mergeVertexProperties(0, vertexId, graph, setGraph, { title }),
          },
        }}
      >
        <Show when={location.pathname.includes("/admin/") && !isPageDesignerPath(location.pathname)}>
          <Navbar
            meta={graph.vertexes[vertexId]}
            right={<DropdownMenu />}
            showCloseDrawerBtn={location.pathname.includes("/admin/")}
            toggleSidebar={() => {
              setGraph("isSideBarOpen", (prev) => !prev);
            }}
          />
        </Show>
        <div
          class={" scrollbar-width:thin overflow-y:auto  p:4|10"}
          classList={{ "height:93vh": graph.isSideBarOpen }}
        >
          {props.children}
        </div>
      </PageContext.Provider>
    </div>
  );
}

const DropdownMenu = () => {
  const [graph, setGraph] = useGraph();
  const [loadingSite, setLoadingSite] = useLoading();
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();
  const [isOpen, setIsOpen] = createSignal(false);
  let btnEl: any;
  let dropdownContainerEl: any;
  const handleOpen = () => {
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
  };
  onMount(() => {
    // if we not use onMount, when we refresh the page,
    // on server side we get error: TypeError: Failed to parse URL from /api/get_user
    // and server redirect to login page.
    getAPI(API.getUserUrl)
      .then((data) => {
        if (data) {
          setGraph("member", data);
        }
      })
      .catch((err: any) => {
        if (err.message) {
          navigate("/auth/login");
        }
      });
  });

  createEffect(() => {
    if (isOpen()) {
      const { bottom, left, width } = btnEl.getBoundingClientRect();
      const { scrollX, scrollY } = window;

      dropdownContainerEl.style.position = "absolute";
      dropdownContainerEl.style.top = `${bottom + scrollY}px`;
      dropdownContainerEl.style.left = `${left + scrollX}px`;
      dropdownContainerEl.style.width = `${width}px`;
      dropdownContainerEl.style.zIndex = "100";
    }
  });

  return (
    <>
      <button
        class={
          "flex ai:center bg:rgb(229,234,253) bg:rgb(190,211,238,.7):hover height:40px p:.2rem|.3rem r:50% width:40px"
        }
        id="dropdown-toggle"
        onClick={handleOpen}
        ref={btnEl}
        style={`background-size:cover;border: none; cursor: pointer;background-color:rgb(237,237,255);background-image: url(${
          graph.member?.properties?.profileImage ||
          "https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png"
        })`}
      />
      <Dismiss
        cursorKeys
        menuButton={btnEl}
        mount="body"
        open={isOpen}
        overlay
        ref={dropdownContainerEl}
        setOpen={setIsOpen}
      >
        <div
          class="bg:white border:1px|solid|#ccc position:absolute r:5px right:-15px shadow:0|2px|5px|rgba(0,0,0,0.1) top:calc(100%+5px) transition:opacity|0.2s|ease-in-out width:max-content z-index:100"
          classList={{ "opacity:0 pointer-events:none": !isOpen(), "opacity:1 pointer-events:auto": isOpen() }}
        >
          <div
            class="fixed bg:#01093138 bottom:0 left:0 right:0 top:0 z-index:-1"
            onClick={handleClose}
          />
          <ul
            class="@fade|.3s"
            classList={{ "list-style-type:none p:0 m:0 position:relative": true }}
          >
            <li class={"flex mb:5px p:10px"}>
              <div
                class="h:45 r:50% w:45"
                style={`background-size:cover;background-image: url(${
                  graph.member?.properties?.profileImage ||
                  "https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png"
                })`}
              />
              <div class={"ml:10 mr:1rem"}>
                <div class={"f:15 font-weight:bold text-align:start"}>
                  <Show
                    fallback={graph.member?.properties?.username ?? "anonymous"}
                    when={!graph.member?.properties?.username}
                  >
                    {"Guest User"}
                  </Show>
                </div>
                <div class={"f:13 text-align:start"}>
                  <Show
                    fallback={
                      graph.member?.properties?.email ?? "anonymous@gmail.com"
                    }
                    when={!graph.member?.properties?.email}
                  >
                    {"guest@gmail.com"}
                  </Show>
                </div>
              </div>
            </li>
            <hr class={"color:rgb(223,223,223)"} />

            <Show
              fallback={
                <div>
                  <li class={"m:5|10 mt:5px"}>
                    <A
                      class="bg:rgb(241,241,241):hover r:5|5|5|5"
                      classList={{ "text-decoration:none color:#333 d:flex ai:center p:5px|7px": true }}
                      href={`${APP_BASE_URL}/setting`}
                      onclick={() => {
                        setIsOpen(false);
                      }}
                    >
                      Account Setting
                    </A>
                  </li>
                  <li class={"m:5|10 mt:5px"}>
                    <A
                      class="bg:rgb(241,241,241):hover r:5|5|5|5"
                      classList={{ "text-decoration:none color:#333 flex ai:center p:5px|7px": true }}
                      href={"/contact-us"}
                      onclick={() => {
                        setIsOpen(false);
                      }}
                    >
                      Help
                    </A>
                  </li>
                  <hr class={"color:rgb(223,223,223)"} />

                  <li class={"m:5|10 mt:5px"}>
                    <a
                      class="cursor:default r:5|5|5|5"
                      classList={{ "text-decoration:none color:#333 flex ai:center p:10px|7px": true }}
                      onclick={async () => {
                        setIsOpen(false);
                        setLoadingSite(true);
                        await showLoadingToast({
                          loadMessage: "Logging Out...",
                          onSuccess: (value) => {
                            if (value != null && value.message !== null) {
                              navigate("/auth/login");
                            }
                          },
                          promise: signOutCall(),
                          successMessage: "Log Out Successfully",
                        });
                        setLoadingSite(false);
                      }}
                    >
                      Sign Out
                    </a>
                  </li>
                </div>
              }
              when={!graph.member?.properties?.email}
            >
              <div>
                <li class={"m:5|10 mt:5px"}>
                  <A
                    class="bg:rgb(241,241,241):hover r:5|5|5|5"
                    classList={{ "text-decoration:none color:#333 flex ai:center p:5px|7px": true }}
                    href={"/auth/login"}
                    onclick={() => {
                      setIsOpen(false);
                    }}
                    replace={true}
                  >
                    Log In
                  </A>
                </li>
                <li class={"m:5|10 mt:5px"}>
                  <A
                    class="bg:rgb(241,241,241):hover r:5|5|5|5"
                    classList={{ "text-decoration:none color:#333 flex ai:center p:5px|7px": true }}
                    href={"/auth/signup"}
                    onclick={() => {
                      setIsOpen(false);
                    }}
                    replace={true}
                  >
                    Sign Up
                  </A>
                </li>
              </div>
            </Show>
          </ul>
        </div>
      </Dismiss>
    </>
  );
};
