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

interface AdminLayoutProps {
  children?: JSX.Element;
}

export function AdminLayout(props: AdminLayoutProps): JSX.Element {
  const [graph, setGraph] = useGraph();
  const location = useLocation();
  const navBarVertexId = graph.newVertexId;

  // Add new vertex for the navbar
  addNewVertex(
    0,
    newVertex(navBarVertexId, ["MainNavBarTitle"], { class: `bb:1|solid|rgb(212,219,231)` }),
    graph,
    setGraph
  );

  // Handle URL change for sidebar visibility
  const handleUrlChange = () => {
    setGraph("isSideBarOpen", !isPageDesignerPath(location.pathname));
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
        <Show when={location.pathname.includes("/admin/") && !isPageDesignerPath(location.pathname)}>
          <Navbar
            meta={graph.vertexes[navBarVertexId]}
            right={<DropdownMenuDisplay />}
            showCloseDrawerBtn={location.pathname.includes("/admin/")}
            toggleSidebar={() => setGraph("isSideBarOpen", (prev) => !prev)}
          />
        </Show>
        {props.children}
      </PageContext.Provider>
    </div>
  );
}

function DropdownMenuDisplay(): JSX.Element {
  const [graph, setGraph] = useGraph();
  const [loadingSite, setLoadingSite] = useLoading();
  const navigate = useNavigate();
  const { showLoadingToast } = useToast();
  const [isOpen, setIsOpen] = createSignal(false);
  let btnEl: HTMLButtonElement;

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  // Fetch user data on mount
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

  const profileImage =
    graph.member?.properties?.profileImage ||
    "https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png";

  return (
    <>
      <button
        class="flex ai:center bg:rgb(229,234,253) bg:rgb(190,211,238,.7):hover height:40px p:.2rem|.3rem r:50% width:40px"
        id="dropdown-toggle"
        onClick={handleOpen}
        ref={btnEl}
        style={`background-size:cover;border: none; cursor: pointer;background-color:rgb(237,237,255);background-image: url(${profileImage})`}
      />
      <Show when={isOpen()}>
        <ZIndex>
          <DropdownMenu
            class="r:5"
            onClickOutside={handleClose}
            parentRef={btnEl}
            placement="bottom-end"
          >
            <ul class="list-style-type:none m:0 p:0 position:relative">
              <ProfileHeader profileImage={profileImage} />
              <hr class="color:rgb(223,223,223)" />
              <MenuItems
                isAuthenticated={!!graph.member?.properties?.email}
                navigate={navigate}
                onClose={handleClose}
                setLoadingSite={setLoadingSite}
                showLoadingToast={showLoadingToast}
                signOutCall={signOutCall}
              />
            </ul>
          </DropdownMenu>
        </ZIndex>
      </Show>
    </>
  );
}

interface ProfileHeaderProps {
  profileImage: string;
}

function ProfileHeader(props: ProfileHeaderProps): JSX.Element {
  const [graph] = useGraph();

  return (
    <li class="flex mb:5px p:10px">
      <div class="h:45 r:50% w:45" style={`background-size:cover;background-image: url(${props.profileImage})`} />
      <div class="ml:10 mr:1rem">
        <div class="f:15 font-weight:bold text-align:start">
          <Show fallback={graph.member?.properties?.username ?? "anonymous"} when={!graph.member?.properties?.username}>
            Guest User
          </Show>
        </div>
        <div class="f:13 text-align:start">
          <Show fallback={graph.member?.properties?.email ?? "anonymous@gmail.com"} when={!graph.member?.properties?.email}>
            guest@gmail.com
          </Show>
        </div>
      </div>
    </li>
  );
}

interface MenuItemsProps {
  isAuthenticated: boolean;
  navigate: ReturnType<typeof useNavigate>;
  onClose: () => void;
  setLoadingSite: ReturnType<typeof useLoading>[1];
  showLoadingToast: ReturnType<typeof useToast>['showLoadingToast'];
  signOutCall: () => Promise<void>;
}

function MenuItems(props: MenuItemsProps): JSX.Element {
  return (
    <Show fallback={<UnauthenticatedMenu onClose={props.onClose} />} when={props.isAuthenticated}>
      <AuthenticatedMenu
        navigate={props.navigate}
        onClose={props.onClose}
        setLoadingSite={props.setLoadingSite}
        showLoadingToast={props.showLoadingToast}
        signOutCall={props.signOutCall}
      />
    </Show>
  );
}

interface AuthenticatedMenuProps {
  navigate: ReturnType<typeof useNavigate>;
  onClose: () => void;
  setLoadingSite: ReturnType<typeof useLoading>[1];
  showLoadingToast: ReturnType<typeof useToast>['showLoadingToast'];
  signOutCall: () => Promise<void>;
}

function AuthenticatedMenu(props: AuthenticatedMenuProps): JSX.Element {
  return (
    <>
      <li class="m:5|10 mt:5px">
        <A class="flex ai:center bg:rgb(241,241,241):hover color:#333 p:5px|7px r:5|5|5|5 text-decoration:none" href={`${APP_BASE_URL}/setting`} onclick={props.onClose}>
          Account Setting
        </A>
      </li>
      <li class="m:5|10 mt:5px">
        <A class="flex ai:center bg:rgb(241,241,241):hover color:#333 p:5px|7px r:5|5|5|5 text-decoration:none" href="/contact-us" onclick={props.onClose}>
          Help
        </A>
      </li>
      <hr class="color:rgb(223,223,223)" />
      <li class="m:5|10 mt:5px">
        <a
          class="flex ai:center color:#333 cursor:default p:10px|7px r:5|5|5|5 text-decoration:none"
          onclick={async () => {
            props.onClose();
            props.setLoadingSite(true);
            await props.showLoadingToast({
              loadMessage: "Logging Out...",
              onSuccess: (value) => {
                if (value != null && value.message !== null) {
                  props.navigate("/auth/login");
                }
              },
              promise: props.signOutCall(),
              successMessage: "Log Out Successfully",
            });
            props.setLoadingSite(false);
          }}
        >
          Sign Out
        </a>
      </li>
    </>
  );
}

interface UnauthenticatedMenuProps {
  onClose: () => void;
}

function UnauthenticatedMenu(props: UnauthenticatedMenuProps): JSX.Element {
  return (
    <>
      <li class="m:5|10 mt:5px">
        <A class="flex ai:center bg:rgb(241,241,241):hover color:#333 p:5px|7px r:5|5|5|5 text-decoration:none" href="/auth/login" onclick={props.onClose} replace={true}>
          Log In
        </A>
      </li>
      <li class="m:5|10 mt:5px">
        <A class="flex ai:center bg:rgb(241,241,241):hover color:#333 p:5px|7px r:5|5|5|5 text-decoration:none" href="/auth/signup" onclick={props.onClose} replace={true}>
          Sign Up
        </A>
      </li>
    </>
  );
}
