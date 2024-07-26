import { useNavigate } from "@solidjs/router";
import { type JSX, Show, createSignal, onMount } from "solid-js";

import { DropdownMenu } from "~/components/DropdownMenu";
import { useToast } from "~/components/Toast";
import { ZIndex } from "~/components/ZIndex";
import { signOutCall } from "~/lib/api/api_functions";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { useLoading } from "~/lib/contexts";
import { useGraph } from "~/lib/graph/graph";

import { MenuItems } from "./MenuItems";
import { ProfileHeader } from "./ProfileHeader";

export function DropdownMenuDisplay(): JSX.Element {
  const [graph, setGraph] = useGraph();
  const [loadingSite, setLoadingSite] = useLoading();
  const navigate = useNavigate();
  const { showLoadingToast, showErrorToast } = useToast();
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
          if (data.user) {
            setGraph("member", data.user);
          }
          if (data.userSetting) {
            setGraph("userSetting", data.userSetting);
          }
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message) {
          showErrorToast(err.message);
          navigate("/auth/login");
        }
      });
  });

  const profileImage = graph.member?.P?.profileImage ||
    "https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png";

  return (
    <>
      <button
        class="flex ai:center bg:rgb(229,234,253) bg:rgb(190,211,238,.7):hover height:40px p:.2rem|.3rem r:50% width:40px"
        id="dropdown-toggle"
        onClick={handleOpen}
        ref={btnEl}
        style={`background-size:cover;border: none; cursor: pointer;background-color:rgb(237,237,255);background-image: url(${profileImage})`} />
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
                isAuthenticated={!!graph.member?.P?.email}
                navigate={navigate}
                onClose={handleClose}
                setLoadingSite={setLoadingSite}
                showLoadingToast={showLoadingToast}
                signOutCall={signOutCall} />
            </ul>
          </DropdownMenu>
        </ZIndex>
      </Show>
    </>
  );
}
