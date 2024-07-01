import { Icon } from "@iconify-icon/solid";

export function ImportExportButtons(props: Readonly<{ setPopup: (value: boolean) => void; }>) {
  return (
    <div
      style={{
        display: "flex",
        "justify-content": "end",
        "margin-bottom": "10px",
      }}
    >
      <button
        onClick={() => props.setPopup(true)}
        style={{ display: "flex" }}
        type="button"
      >
        <Icon
          height={22}
          icon={"lets-icons:import"}
          width={22} />
        Import
      </button>
      <button
        class="b:blue"
        onClick={() => props.setPopup(true)}
        style={{ display: "flex" }}
        type="button"
      >
        <Icon
          height={22}
          icon={"lets-icons:export"}
          width={22} />
        Export
      </button>
    </div>
  );
}
