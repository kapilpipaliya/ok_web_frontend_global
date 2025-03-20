import { Icon } from "@iconify-icon/solid";

import { IconButton } from "~/components/styled/IconButton";

// deprecated, not used function
export function ImportExportButtons(
  props: Readonly<{ setPopup: (value: boolean) => void }>,
) {
  return (
    <div class="flex justify-content:end mb:10px">
      <button class="flex" onClick={() => props.setPopup(true)} type="button">
        <Icon height={22} icon={"ph:arrow-square-in"} noobserver width={22} />
        Import
      </button>
      <IconButton
        class="flex b:primary"
        icon="ph:arrow-square-out"
        onClick={() => props.setPopup(true)}
        size={22}
        type="button"
      >
        Export
      </IconButton>
    </div>
  );
}
