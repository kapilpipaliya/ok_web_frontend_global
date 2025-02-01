import { Icon } from "@iconify-icon/solid";

export function ImportExportButtons(
  props: Readonly<{ setPopup: (value: boolean) => void }>,
) {
  return (
    <div class="flex justify-content:end mb:10px">
      <button class="flex" onClick={() => props.setPopup(true)} type="button">
        <Icon height={22} icon={"lets-icons:import"} width={22} noobserver />
        Import
      </button>
      <button
        class="flex b:blue"
        onClick={() => props.setPopup(true)}
        type="button"
      >
        <Icon height={22} icon={"lets-icons:export"} width={22} noobserver />
        Export
      </button>
    </div>
  );
}
