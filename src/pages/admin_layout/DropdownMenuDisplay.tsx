import { createSignal, type JSX, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { useToast } from "~/components/styled/Toast";
import { signOutCall } from "~/lib/api/service/user/signOutCall";
import { getMemberVertex } from "~/lib/graph/get/sync/getMemberVertex";
import { useGraph } from "~/lib/graph/graph";

import { profileImage } from "./constant";
import { MenuItems } from "./MenuItems";
import { ProfileHeader } from "./ProfileHeader";

export function UserDropdownMenuDisplay(): JSX.Element {
  const [graph] = useGraph();
  const { showErrorToast, showLoadingToast } = useToast();
  const [isOpen, setIsOpen] = createSignal(false);
  let btnEl: HTMLButtonElement;

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <button
        class="flex ai:center bg:rgb(229,234,253) bg:rgb(190,211,238,.7):hover height:36px p:6 r:7 width:36px mr:3"
        id="user-dropdown-toggle"
        onClick={handleOpen}
        ref={btnEl!}
        style={`background-size:cover;border: none; cursor: pointer;background-color:rgb(237,237,255);background-image: url(${profileImage})`}
      />
      <Show when={isOpen()}>
        <ZIndex>
          <DropdownMenu
            class="r:5"
            onClickOutside={handleClose}
            parentRef={btnEl!}
            placement="bottom-end"
          >
            <ul class="list-style-type:none m:0 p:0 position:relative">
              <ProfileHeader
                profileImage={
                  getMemberVertex(graph)?.P?.profileImage || profileImage
                }
              />
              <hr class="color:rgb(223,223,223)" />
              <MenuItems onClose={handleClose} signOutCall={signOutCall} />
            </ul>
          </DropdownMenu>
        </ZIndex>
      </Show>
    </>
  );
}
