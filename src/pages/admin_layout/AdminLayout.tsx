import { A, useLocation, useNavigate } from "@solidjs/router";
import { type JSX, Show, createEffect, createSignal, onMount } from "solid-js";

import { DropdownMenu } from "~/components/DropdownMenu";
import { useToast } from "~/components/Toast";
import { ZIndex } from "~/components/ZIndex";
import { signOutCall } from "~/lib/api/api_functions";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { APP_BASE_URL } from "~/lib/constants";
import { PageContext, useLoading } from "~/lib/contexts";
import { useGraph } from "~/lib/graph/graph";
import {
  addNewVertex,
  mergeVertexProperties,
  newVertex,
} from "~/lib/graph/mutate/vertex";
import { isPageDesignerPath } from "~/lib/utils";
import { Navbar } from "~/pages/admin_layout/Navbar";

export function AdminLayout(props: Readonly<{ children?: JSX.Element }>) {
  const border = "|solid|rgb(212,219,231)";

  const [graph, setGraph] = useGraph();
  const navBarVertexId = graph.newVertexId;
  addNewVertex(
    0,
    newVertex(navBarVertexId, ["MainNavBarTitle"], { class: `bb:1${border}` }),
    graph,
    setGraph,
  );
  const location = useLocation();
  // on form and page designer hide the sidebar
  const handleUrlChange = () => {
    const path = location.pathname;
    setGraph("isSideBarOpen", !isPageDesignerPath(path));
  };

  createEffect(() => {
    handleUrlChange(); // Call the function initially
    return location.pathname; // Track changes in pathname
  });

  return (
    <div
      class="flex {scrollbar-width:thin} flex:column overflow:auto"
      classList={{
        "flex-grow:1": graph.isSideBarOpen || graph.isSubSideBarOpen,
      }}
    >
      <PageContext.Provider
        value={{
          events: {
            setTitle: (title: string) =>
              mergeVertexProperties(0, navBarVertexId, graph, setGraph, { title }),
          },
        }}
      >
        <Show
          when={
            location.pathname.includes("/admin/") &&
            !isPageDesignerPath(location.pathname)
          }
        >
          <Navbar
            meta={graph.vertexes[navBarVertexId]}
            right={<DropdownMenuDisplay />}
            showCloseDrawerBtn={location.pathname.includes("/admin/")}
            toggleSidebar={() => {
              setGraph("isSideBarOpen", (prev) => !prev);
            }}
          />
        </Show>
        {props.children}
      </PageContext.Provider>
    </div>
  );
}

const DropdownMenuDisplay = () => {
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



  return (
    <>
      <button
        class={
          "flex ai:center bg:rgb(229,234,253) bg:rgb(190,211,238,.7):hover height:40px p:.2rem|.3rem r:50% width:40px"
        }
        id="dropdown-toggle"
        onClick={handleOpen}
        ref={btnEl}
        style={`background-size:cover;border: none; cursor: pointer;background-color:rgb(237,237,255);background-image: url(${graph.member?.properties?.profileImage ||
          "https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png"
          })`}
      />
      <Show when={isOpen()}>
        <ZIndex>
          <DropdownMenu
            class="r:5"
            onClickOutside={() => setIsOpen(false)}
            parentRef={btnEl}
            placement="bottom-end"
          >
            <ul
              class="@fade|.3s"
              classList={{
                "list-style-type:none p:0 m:0 position:relative": true,
              }}
            >
              <li class={"flex mb:5px p:10px"}>
                <div
                  class="h:45 r:50% w:45"
                  style={`background-size:cover;background-image: url(${graph.member?.properties?.profileImage ||
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
                        classList={{
                          "text-decoration:none color:#333 d:flex ai:center p:5px|7px": true,
                        }}
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
                        classList={{
                          "text-decoration:none color:#333 flex ai:center p:5px|7px": true,
                        }}
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
                        classList={{
                          "text-decoration:none color:#333 flex ai:center p:10px|7px": true,
                        }}
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
                      classList={{
                        "text-decoration:none color:#333 flex ai:center p:5px|7px": true,
                      }}
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
                      classList={{
                        "text-decoration:none color:#333 flex ai:center p:5px|7px": true,
                      }}
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
          </DropdownMenu>
        </ZIndex>
      </Show>
    </>
  );
};
