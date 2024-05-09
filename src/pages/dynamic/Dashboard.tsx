import { A, useLocation, useNavigate } from "@solidjs/router";
// import {get, set} from "idb-keyval";
import { createEffect, createSignal, JSX, Show, useContext } from "solid-js";
import { getNewGraphId, GraphContext } from "~/lib/graph/graph";
import Dismiss from "solid-dismiss";
import { Navbar } from "~/components/layout/Navbar";
import { APP_BASE_URL, PageContext } from "~/lib/Utils";
import {
  addNewVertex,
  mergeVertexProperties,
  newVertex,
} from "~/lib/graph/mutate/vertex";
import "~/css/base.css";
import "~/css/modal.css";
import { getUser } from "~/lib/auth/auth";
import { LoadingContext } from "~/lib/contexts";
import { useToast } from "~/components/custom/Toast";
import Sidebar from "~/components/layout/Sidebar";
import { signOutCall } from "~/components/api/api_functions";

const border = "|solid|rgb(212,219,231)";
const [isSideBarOpen, setSideBarOpen] = createSignal(true);

export const Dashboard = (props: { children?: JSX.Element }) => {
  const [graph, setGraph] = useContext(GraphContext)!;
  const vertexId = getNewGraphId();
  addNewVertex(
    0,
    newVertex(vertexId, ["MainNavBarTitle"], { class: `bb:1${border}` }),
    graph,
    setGraph,
  );

  const location = useLocation();
  const [isShowDrawer, setIsShowDrawer] = createSignal(true);
  const [isLoginPage, setIsLoginPage] = createSignal(
    location.pathname.includes("/auth/login"),
  );
  const [signUpPage, setSignUpPage] = createSignal(
    location.pathname.includes("/auth/signup"),
  );

  createEffect(() => {
    const path = location.pathname;

    setIsLoginPage(path.includes("/auth/login"));
    setSignUpPage(path.includes("/auth/signup"));
    setIsShowDrawer(
      !(
        path.includes("/auth/login") ||
        path.includes("/auth/signup") ||
        path.includes("/admin/Page/")
      ),
    );
  });
  const [isSidebarOpen, setSidebarOpen] = createSignal(true);

  const appStyle = {
    display: "flex",
    height: "100vh",
  };

  const mainContentStyle = {
    "flex-grow": 1,
    "scrollbar-width": "thin",
    overflow: "auto",
    display: "flex",
    "flex-direction": "column",
  };

  return (
    <div style={appStyle}>
      <Show when={isSideBarOpen() && isShowDrawer()}>
        <Sidebar
          isSideBarOpen={isSideBarOpen()}
          toggleSidebar={() => {
            setSideBarOpen((prev) => !prev);
          }}
        />
      </Show>
      <div style={mainContentStyle as any}>
        <PageContext.Provider
          value={{
            events: {
              setSideBarOpen,
              setTitle: (title: string) =>
                mergeVertexProperties(0, vertexId, graph, setGraph, { title }),
            },
          }}
        >
          <Show when={!isLoginPage() && !signUpPage()}>
            <Navbar
              showCloseDrawerBtn={isShowDrawer()}
              toggleSidebar={() => {
                setSideBarOpen((prev) => !prev);
              }}
              right={<DropdownMenu />}
              meta={graph.vertexes[vertexId]}
            />
          </Show>
          <Show when={graph.initialSynced}>
            <div class="p:10">{props.children}</div>
          </Show>
        </PageContext.Provider>
      </div>
    </div>
  );
};

const DropdownMenu = () => {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [loadingSite, setLoadingSite] = useContext(LoadingContext);
  const navigate = useNavigate();
  const { showLoadingToast } = useToast();
  const [isOpen, setIsOpen] = createSignal(false);
  let btnEl: any;
  let dropdownContainerEl: any;
  const handleOpen = () => {
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
  };
  getUser().then((value) => {
    setGraph("member", value);
  });

  createEffect(() => {
    if (isOpen()) {
      const { bottom, left, width } = btnEl.getBoundingClientRect();
      const { scrollX, scrollY } = window;

      dropdownContainerEl.style.position = "absolute";
      dropdownContainerEl.style.top = bottom + scrollY + "px";
      dropdownContainerEl.style.left = left + scrollX + "px";
      dropdownContainerEl.style.width = width + "px";
      dropdownContainerEl.style.zIndex = "100";
    }
  });

  return (
    <>
      <button
        id="dropdown-toggle"
        ref={btnEl}
        onClick={handleOpen}
        class={
          "flex ai:center bg:rgb(229,234,253) bg:rgb(190,211,238,.7):hover p:.2rem|.3rem r:50%"
        }
        style="border: none; cursor: pointer;background-color:rgb(237,237,255)"
      >
        <img
          src="https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png"
          alt="profile"
          style="width: 40px; height: 40px;"
        />
      </button>
      <Dismiss
        menuButton={btnEl}
        open={isOpen}
        setOpen={setIsOpen}
        mount="body"
        overlay
        cursorKeys
        ref={dropdownContainerEl}
      >
        <div
          style={`position: absolute; top: calc(100% + 5px); background-color: #fff; border: 1px solid #ccc; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); opacity: ${
            isOpen() ? 1 : 0
          }; pointer-events: ${
            isOpen() ? "auto" : "none"
          }; transition: opacity 0.2s ease-in-out;width:max-content; right: -15px`} // Adjust width here
        >
          <div
            style="position:fixed; top:0; left:0; bottom:0; right:0; background:#01093138; z-index:-1;"
            onClick={handleClose}
          ></div>
          <ul
            class="@fade|.3s"
            style="list-style-type: none; padding: 0; margin: 0; position:relative;"
          >
            <li style="margin-bottom: 5px; padding: 10px; " class={"flex p:13"}>
              <img
                src="https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png"
                alt="profile"
                style="height: 45px;"
              />
              <div class={"ml:10 mr:1rem"}>
                <div class={"text-align:start f:15 font-weight:bold"}>
                  <Show
                    when={!graph.member?.properties?.username}
                    fallback={graph.member?.properties?.username ?? "anonymous"}
                  >
                    {"Guest User"}
                  </Show>
                </div>
                <div class={"text-align:start f:13"}>
                  <Show
                    when={!graph.member?.properties?.email}
                    fallback={
                      graph.member?.properties?.email ?? "anonymous@gmail.com"
                    }
                  >
                    {"guest@gmail.com"}
                  </Show>
                </div>
              </div>
            </li>
            <hr class={"color:rgb(223,223,223)"} />

            <Show
              when={!graph.member?.properties?.email}
              fallback={
                <div>
                  <li style="margin-top: 5px; " class={"m:5|10"}>
                    <A
                      href={`${APP_BASE_URL}/setting`}
                      onclick={() => {
                        setIsOpen(false);
                      }}
                      class="bg:rgb(241,241,241):hover r:5|5|5|5"
                      style="text-decoration: none; color: #333; display: flex; align-items: center; padding: 5px 7px;"
                    >
                      Account Setting
                    </A>
                  </li>
                  <li style="margin-top: 5px; " class={"m:5|10"}>
                    <A
                      href={`${APP_BASE_URL}/setting`}
                      onclick={() => {
                        setIsOpen(false);
                      }}
                      class="bg:rgb(241,241,241):hover r:5|5|5|5"
                      style="text-decoration: none; color: #333; display: flex; align-items: center; padding: 5px 7px;"
                    >
                      Help
                    </A>
                  </li>
                  <hr class={"color:rgb(223,223,223)"} />

                  {/*<hr style="color:lightgrey" class={'mt:.5rem'}/>*/}
                  <li style="margin-top: 5px; " class={"m:5|10"}>
                    <a
                      onclick={async () => {
                        setIsOpen(false);
                        setLoadingSite(true);
                        await showLoadingToast({
                          promise: signOutCall(),
                          loadMessage: "Logging Out...",
                          successMessage: "Log Out Successfully",
                          onSuccess: (value) => {
                            if (value != null && value.message !== null) {
                              navigate(`/auth/login`);
                            }
                          },
                        });
                        setLoadingSite(false);
                      }}
                      class="r:5|5|5|5 cursor:default"
                      style="text-decoration: none; color: #333; display: flex; align-items: center; padding: 10px 7px;"
                    >
                      Sign Out
                    </a>
                  </li>
                </div>
              }
            >
              <div>
                <li style="margin-top: 5px; " class={"m:5|10"}>
                  <A
                    href={`/auth/login`}
                    replace={true}
                    onclick={() => {
                      setIsOpen(false);
                    }}
                    class="bg:rgb(241,241,241):hover r:5|5|5|5"
                    style="text-decoration: none; color: #333; display: flex; align-items: center; padding: 5px 7px;"
                  >
                    Log In
                  </A>
                </li>
                <li style="margin-top: 5px; " class={"m:5|10"}>
                  <A
                    href={`/auth/signup`}
                    replace={true}
                    onclick={() => {
                      setIsOpen(false);
                    }}
                    class="bg:rgb(241,241,241):hover r:5|5|5|5"
                    style="text-decoration: none; color: #333; display: flex; align-items: center; padding: 5px 7px;"
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
