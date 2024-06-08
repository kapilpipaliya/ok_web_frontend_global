import { For, createSignal } from "solid-js";

export const PageSetting = () => {
  return <Sidebar />;
};

const Sidebar = () => {
  const [selected, setSelected] = createSignal("thank-you-page");

  const menuItems: any = [
    { id: "thank-you-page", label: "Thank You Page", icon: "✅" },
  ];

  return (
    <div style={{ display: "flex" }} class="mt:1rem w:98vw flex:column@<sm">
      <div
        class="h:90vh@>sm"
        style={{
          width: "250px",
          "background-color": "rgb(64,74,86)",
          padding: "20px",
          color: "#fff",
          "border-radius": "5px",
        }}
      >
        <For each={menuItems}>
          {(item) => (
            <div
              onClick={() => setSelected(item.id)}
              style={{
                padding: "10px 20px",
                cursor: "pointer",
                "background-color":
                  selected() === item.id ? "#343a40" : "transparent",
                "margin-bottom": "10px",
                "border-radius": "4px",
                display: "flex",
                "align-items": "center",
              }}
            >
              <span style={{ "margin-right": "10px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          )}
        </For>
      </div>
      <div style={{ flex: 1, padding: "20px", "background-color": "#f8f9fa" }}>
        <h2 class="font-weight:700 font:18 ">
          {menuItems.find((item: any) => item.id === selected()).icon}&nbsp;
          {menuItems.find((item: any) => item.id === selected()).label}
        </h2>
        <p class="font:14">Show Page After Submission Form</p>
        {/* Add the content for the selected menu item here */}
      </div>
    </div>
  );
};
