import { Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, For, Show } from "solid-js";

import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { isAdminRole } from "~/lib/graph/get/sync/isAdminRole";
import { useGraph } from "~/lib/graph/graph";
import { EmailSettings } from "~/pages/global/email/EmailSettings";
import { SettingsLayout } from "~/components/settings/SettingsLayout";

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
    setSelectedMenu(id);
    setSearchParams({ tab: id });
  };

  return (
    <SettingsLayout
      title="Global Settings"
      description="Manage global application settings"
      menuItems={menuItems}
      selectedMenu={selectedMenu}
      onMenuSelect={handleMenuSelect}
      graph={graph}
    >
      <Show when={selectedMenu() === "email"}>
        <EmailSettings />
      </Show>
    </SettingsLayout>
  );
}
