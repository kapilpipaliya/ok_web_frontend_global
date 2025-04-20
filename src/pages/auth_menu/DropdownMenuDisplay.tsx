import { createSignal, type JSX, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { getProfileImageUrl } from "~/lib/graph/get/sync/user/getProfileImageUrl";
import { useGraph } from "~/lib/graph/GraphContext";

import { MenuItems } from "./MenuItems";
import { ProfileHeader } from "./ProfileHeader";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function UserDropdownMenuDisplay(): JSX.Element {
  const [graph] = useGraph();
  const [isOpen, setIsOpen] = createSignal(false);
  let btnEl: HTMLButtonElement;

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <As
        as="button"
        css={css`
  display: flex;
  align-items: center;
  height: 36px;
  padding: 6px;
  border-radius: 7px;
  width: 36px;
  margin-right: 3px;
  background-size: cover;
  border: none;
  cursor: pointer;
  background-color: \${args.theme.var.color.primary_10};
  background-image: url(${getProfileImageUrl(graph)});

  &:hover {
    background-color: \${args.theme.var.color.primary_40};
  }
`}
        id="user-dropdown-toggle"
        onClick={handleOpen}
        ref={btnEl!}
      />
      <Show when={isOpen()}>
        <ZIndex>
          <DropdownMenu
            css={css`
  border-radius: 5px;
`}
            onClickOutside={handleClose}
            parentRef={btnEl!}
            placement="bottom-end"
          >
            <As
              as="ul"
              css={css`
  list-style-type: none;
  margin: 0;
  padding: 0;
  position: relative;
`}
            >
              <ProfileHeader />
              <As
                as="hr"
                css={css`
  color: #1e293b;
`}
              />
              <MenuItems onClose={handleClose} />
            </As>
          </DropdownMenu>
        </ZIndex>
      </Show>
    </>
  );
}
