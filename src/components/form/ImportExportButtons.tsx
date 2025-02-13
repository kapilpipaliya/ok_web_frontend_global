import { Icon } from "@iconify-icon/solid";

import { IconButton } from "~/components/styled/IconButton";

export function ImportExportButtons(
  props: Readonly<{ setPopup: (value: boolean) => void }>,
) {
  return (
    <div class="flex justify-content:end mb:10px">
      <button class="flex" onClick={() => props.setPopup(true)} type="button">
        <Icon height={22} icon={"lets-icons:import"} noobserver width={22} />
        Import
      </button>
      <IconButton
        class="flex b:primary"
        icon="lets-icons:export"
        onClick={() => props.setPopup(true)}
        size={22}
        type="button"
      >
        Export
      </IconButton>
    </div>
  );
}
