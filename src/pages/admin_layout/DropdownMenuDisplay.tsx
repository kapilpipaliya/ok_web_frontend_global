import { createSignal, type JSX, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { useToast } from "~/components/styled/Toast";
import { signOutCall } from "~/lib/api/service/user/signOutCall";
import { useGraph } from "~/lib/graph/graph";

import { MenuItems } from "./MenuItems";
import { ProfileHeader } from "./ProfileHeader";

export function UserDropdownMenuDisplay(): JSX.Element {
  const [graph] = useGraph();
  const { showErrorToast, showLoadingToast } = useToast();
  const [isOpen, setIsOpen] = createSignal(false);
  let btnEl: HTMLButtonElement;

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const profileImage =
    graph.member?.P?.profileImage ||
    "https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png";

  return (
    <>
      <button
        class="flex ai:center bg:rgb(229,234,253) bg:rgb(190,211,238,.7):hover height:40px p:.2rem|.3rem r:50% width:40px"
        id="dropdown-toggle"
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
              <ProfileHeader profileImage={profileImage} />
              <hr class="color:rgb(223,223,223)" />
              <MenuItems onClose={handleClose} signOutCall={signOutCall} />
            </ul>
          </DropdownMenu>
        </ZIndex>
      </Show>
    </>
  );
}
