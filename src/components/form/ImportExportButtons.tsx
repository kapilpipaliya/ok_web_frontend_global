import { Icon } from "@iconify-icon/solid";

export function ImportExportButtons(props: Readonly<{ setPopup: (value: boolean) => void; }>) {
  return (
    <div
      style={{
        "justify-content": "end",
        "margin-bottom": "10px",
        display: "flex",
      }}
    >
      <button
        type="button"
        style={{ display: "flex" }}
        onClick={() => props.setPopup(true)}
      >
        <Icon
          icon={"lets-icons:import"}
          height={22}
          width={22} />
        Import
      </button>
      <button
        type="button"
        style={{ display: "flex" }}
        onClick={() => props.setPopup(true)}
        class="b:blue"
      >
        <Icon
          icon={"lets-icons:export"}
          height={22}
          width={22} />
        Export
      </button>
    </div>
  );
}
