import { createSignal, type JSX, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { getProfileImageUrl } from "~/lib/graph/get/sync/user/getProfileImageUrl";
import { useGraph } from "~/lib/graph/GraphContext";

import { MenuItems } from "./MenuItems";
import { ProfileHeader } from "./ProfileHeader";

export function UserDropdownMenuDisplay(): JSX.Element {
  const [graph] = useGraph();
  const [isOpen, setIsOpen] = createSignal(false);
  let btnEl: HTMLButtonElement;

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <button
        class={`flex ai:center bg:primary-5 bg:primary-10:hover h:36px p:6 r:7 width:36px mr:3 background-size:cover border:none cursor:pointer bg:primary-5 background-image:url(${getProfileImageUrl(graph)})`}
        id="user-dropdown-toggle"
        onClick={handleOpen}
        ref={btnEl!}
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
              <ProfileHeader />
              <hr class="color:base-20" />
              <MenuItems onClose={handleClose} />
            </ul>
          </DropdownMenu>
        </ZIndex>
      </Show>
    </>
  );
}
