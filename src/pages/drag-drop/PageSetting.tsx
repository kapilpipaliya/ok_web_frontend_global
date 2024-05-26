import { For, createMemo, createSignal, useContext } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { PageView } from "~/components/dynamic/fields/static/GenaricField";
import { IsPreviewContext, PageConfigContext } from "~/lib/contexts";

export const PageSetting = () => {
  return (
    <div class={"mt:2rem"}>
      <Sidebar />
    </div>
  );
};

const Sidebar = () => {
  const [selected, setSelected] = createSignal("form-settings");

  const menuItems: any = [
    { id: "form-settings", label: "Form Settings", icon: "⚙️" },
    { id: "emails", label: "Emails", icon: "📧" },
    { id: "conditions", label: "Conditions", icon: "🔄" },
    { id: "thank-you-page", label: "Thank You Page", icon: "✅" },
    { id: "integrations", label: "Integrations", icon: "🔗" },
    { id: "approval-flows", label: "Approval Flows", icon: "✔️" },
    { id: "jotform-sign", label: "Jotform Sign", icon: "✍️" },
    { id: "mobile-notifications", label: "Mobile Notifications", icon: "📱" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          width: "250px",
          "background-color": "rgb(64,74,86)",
          padding: "20px",
          color: "#fff",
          "border-radius": "5px",
          height: "80vh",
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
        <h2>{menuItems.find((item: any) => item.id === selected()).label}</h2>
        <p>Customize form status and properties</p>
        {/* Add the content for the selected menu item here */}
      </div>
    </div>
  );
};
