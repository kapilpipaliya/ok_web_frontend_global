import { Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, For, Show } from "solid-js";

import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { isAdminRole } from "~/lib/graph/get/sync/isAdminRole";
import { useGraph } from "~/lib/graph/graph";
import { PasswordChangeForm } from "~/pages/user/PasswordChangeForm";
import { ProfileSettings } from "~/pages/user/ProfileSettings";
import { SettingsLayout } from "~/components/settings/SettingsLayout";

export default function SystemUserSettings() {
  const [graph] = useGraph();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMenu, setSelectedMenu] = createSignal(
    searchParams.tab || "profile",
  );

  createEffect(() => {
    const tab = searchParams.tab;
    if (tab && tab !== selectedMenu()) {
      setSelectedMenu(tab);
    }
  });

  const menuItems = [
    {
      component: "ProfileSettings",
      id: "profile",
      label: "Profile",
    },
    {
      component: "PasswordSettings",
      id: "password",
      label: "Change Password",
    },
  ];

  const handleMenuSelect = (id: string) => {
    setSelectedMenu(id);
    setSearchParams({ tab: id });
  };

  return (
    <SettingsLayout
      title="Account Settings"
      description="Manage your account settings and preferences."
      menuItems={menuItems}
      selectedMenu={selectedMenu}
      onMenuSelect={handleMenuSelect}
      graph={graph}
    >
      <Show when={selectedMenu() === "profile"}>
        <ProfileSettings />
      </Show>
      <Show when={selectedMenu() === "password"}>
        <PasswordChangeForm />
      </Show>
    </SettingsLayout>
  );
}
