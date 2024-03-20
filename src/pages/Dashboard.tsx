import {A, useLocation, useNavigate} from "@solidjs/router";
import {get, set} from "idb-keyval";
import {createEffect, createSignal, For, JSX, lazy, onMount, Show, useContext} from "solid-js";
import {getNewGraphId, graph} from "../lib/graph";
import Dismiss from "solid-dismiss";
import {Navbar} from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {AlertMessageContext} from "../contexts/AlertMessageContext";
import { PageContext } from "../lib/Utils";
import {addNewVertex, mergeVertexProperties, newVertex} from "../lib/Vertex";
import {isLoginPage, isSignUpPage, setIsLoginPage, setSignUpPage} from "../signals/common";


const IS_SIDEBAR_OPEN_KEY = "isSideBarOpen";

const BackupRestore = lazy(() => import("./BackupRestore"));
// @ts-ignore
const GraphViewPage = lazy(() => import("./GraphViewPage"));

const border = "|solid|slate-80";
const [isSideBarOpen, setSideBarOpen] = createSignal(true);
get(IS_SIDEBAR_OPEN_KEY).then((data) => setSideBarOpen(data));

// Todo use mastercss
const AlertDisplay = () => {
    const {alerts, setAlert} = useContext(AlertMessageContext);
    return (
        <For each={alerts}>
            {(alert, index) => (
                <div
                    color={alert.state}
                    // @ts-ignore
                    isClosable={true}
                    content={alert.message}
                    duration={5000}
                    onHide={() => setAlert((prev) => prev.filter((_, i) => i !== index()))}
                />
            )}
        </For>
    );
};


// Best Template: https://www.tailwind-kit.com/templates#dashboard
export const FullDashboard = (props: { children?: JSX.Element }) => {
  const vertexId = getNewGraphId();
  addNewVertex(
    0,
    newVertex(vertexId, ["MainNavBarTitle"], { class: `bb:1${border}` })
  );

  const location = useLocation();
const [isDrawerOpen, setDrawerOpen] = createSignal(false);

const toggleDrawer = () => {
  setDrawerOpen(!isDrawerOpen());
  set(IS_SIDEBAR_OPEN_KEY, !isDrawerOpen()); // Optionally synchronize state with IndexedDB
};

  createEffect(()=>{
    if(location.pathname.includes('/nav/admin/login')){
      setIsLoginPage(true);
      // setIsLoginPage();
    }
    if (location.pathname.includes("/nav/admin/signup")) {
      setSignUpPage(true);
      // setIsLoginPage();
    }
  })

  return (
    <div class="flex">
      <Show
        when={
          isSideBarOpen() &&
          graph.initialSynced &&
          !isLoginPage() &&
          !isSignUpPage()
        }
      >
        <Sidebar isSideBarOpen={isSideBarOpen()} />
      </Show>
      <div
        class={`${
          isSideBarOpen() && !isLoginPage() && !isSignUpPage() ? "ml:200" : ""
        } flex:1 transition:margin-left|200ms|ease-in-out`}
      >
        <div class="flex flex:col flex:1">
          <PageContext.Provider
            value={{
              events: {
                setSideBarOpen,
                setTitle: (title: string) =>
                  mergeVertexProperties(0, vertexId, { title }),
              },
            }}
          >
            <Show when={!isLoginPage() && !isSignUpPage()}>
              <Navbar
                toggleSidebar={() => {
                  set(IS_SIDEBAR_OPEN_KEY, !isSideBarOpen());
                  setSideBarOpen((prev) => !prev);
                }}
                right={
                  <>
                    <div class="container">
                      <DropdownMenu isLoggedIn={graph.member?.id} />
                    </div>
                  </>
                }
                meta={graph.vertexes[vertexId]}
              />
            </Show>

            <AlertDisplay />
            <main class="p:20 bg:white">
              <Show when={graph.initialSynced}>{props.children}</Show>
            </main>
          </PageContext.Provider>
        </div>
      </div>
  </div>
  );
};

const DropdownMenu = (props: { isLoggedIn: boolean }) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const handleToggle = () => {
    setIsOpen(!isOpen());
  };

  const handleLogout = () => {
    // Perform logout actions here
    console.log("Logged out");
    setIsOpen(false); // Close dropdown after logout
  };

  return (
    <div style="position: relative; display: inline-block; z-index:100px">
      <button
        onClick={handleToggle}
        style="background: none; border: none; cursor: pointer;"
      >
        <img
          src="https://icons.veryicon.com/png/o/miscellaneous/two-color-icon-library/user-286.png"
          alt="User icon"
          style="width: 40px; height: 40px;"
        />
      </button>
      <div
        style={`position: absolute; top: calc(100% + 15px); right: 4px; background-color: #fff; border: 1px solid #ccc; border-radius: 5px; padding: 10px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); opacity: ${
          isOpen() ? 1 : 0
        }; pointer-events: ${
          isOpen() ? "auto" : "none"
        }; transition: opacity 0.3s ease-in-out; width: 150px;`} // Adjust width here
      >
        <ul style="list-style-type: none; padding: 0; margin: 0;">
          {props.isLoggedIn ? ( // Conditionally render "Log Out" link if user is logged in
            <li style="margin-bottom: 5px;">
              <a
                href="#"
                onClick={handleLogout}
                class="bg:#cccccc:hover r:5|5|5|5"
                style="text-decoration: none; color: #333; display: flex; align-items: center; justify-content: space-between; padding: 5px 10px;"
              >
                <span>Log Out</span>
              </a>
            </li>
          ) : (
            <>
              <li style="margin-bottom: 5px;">
                <A
                  href={"/login"}
                  replace={true}
                  onclick={() => {
                    setIsOpen(false);
                  }}
                  class="bg:#cccccc:hover r:5|5|5|5"
                  style="text-decoration: none; color: #333; display: flex; align-items: center; justify-content: space-between; padding: 5px 10px;"
                  // @ts-ignore
                  title={__APP_VERSION__}
                >
                  <span>Log In</span>
                </A>
              </li>
              <div style="margin:1px; border-bottom: 1px dotted #cccccc;"></div>
              <li style="margin-top: 5px;">
                <A
                  href={"/signup"}
                  onclick={() => {
                    setIsOpen(false);
                  }}
                  replace={true}
                  class="bg:#cccccc:hover r:5|5|5|5"
                  style="text  -decoration: none; color: #333; display: flex; align-items: center; justify-content: space-between; padding: 5px 10px;"
                  // @ts-ignore
                  title={__APP_VERSION__}
                >
                  <span>Sign Up</span>
                  {/* Right arrow icon */}
                </A>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};
