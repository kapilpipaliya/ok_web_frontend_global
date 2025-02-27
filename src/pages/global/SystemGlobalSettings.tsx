import { useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";

import { SettingsLayout } from "~/components/settings/SettingsLayout";
import { useGraph } from "~/lib/graph/graph";
import { EmailSettings } from "~/pages/global/email/EmailSettings";

export default function SystemGlobalSettings() {
  const [graph] = useGraph();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMenu, setSelectedMenu] = createSignal(
    searchParams.tab || "email",
  );

  createEffect(() => {
    const tab = searchParams.tab;
    if (tab && tab !== selectedMenu()) {
      setSelectedMenu(tab);
    }
  });

  const menuItems = [
    {
      component: "EmailSettings",
      id: "email",
      label: "Email Settings",
    },
  ];

  const handleMenuSelect = (id: string) => {
    setSearchParams({ tab: id });
  };

  return (
    <SettingsLayout
      description="Manage global application settings"
      graph={graph}
      menuItems={menuItems}
      onMenuSelect={handleMenuSelect}
      selectedMenu={selectedMenu}
      title="Global Settings"
    >
      <Show when={selectedMenu() === "email"}>
        <EmailSettings />
      </Show>
    </SettingsLayout>
  );
}
