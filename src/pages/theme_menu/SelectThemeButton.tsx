import { createSignal, lazy, Show, Suspense } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { headerIconButtonCss } from "~/pages/settings/constants";

const SelectThemeMenu = lazy(() =>
  import("./SelectThemeMenu").then((m) => ({ default: m.SelectThemeMenu })),
);

export function SelectThemeButton() {
  const [isThemeOptionsOpen, setIsThemeOptionsOpen] = createSignal(false);
  const [buttonRef, setButtonRef] = createSignal<HTMLButtonElement>();

  return (
    <>
      <IconButton
        css={headerIconButtonCss}
        icon="ph:paint-bucket"
        onClick={() => setIsThemeOptionsOpen(true)}
        ref={setButtonRef}
        size={22}
        title="Select Theme"
        tooltipGroup="right-buttons"
        type="button"
      />
      <Show when={isThemeOptionsOpen()}>
        <DropdownMenu
          class="theme-dropdown"
          onClickOutside={() => setIsThemeOptionsOpen(false)}
          parentRef={buttonRef()!}
        >
          <Suspense fallback={null}>
            <SelectThemeMenu />
          </Suspense>
        </DropdownMenu>
      </Show>
    </>
  );
}
