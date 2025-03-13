import { useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";

import { SettingsLayout } from "~/components/styled/SettingsLayout";
import { PasswordChangeForm } from "~/pages/user/PasswordChangeForm";
import { ProfileSettings } from "~/pages/user/ProfileSettings";

export default function AdminUserSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMenu, setSelectedMenu] = createSignal<string>(
    (searchParams.tab as string) || "profile",
  );

  createEffect(() => {
    const tab = searchParams.tab;
    if (tab && tab !== selectedMenu()) {
      setSelectedMenu(tab as string);
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
    setSearchParams({ tab: id });
  };

  return (
    <SettingsLayout
      description="Manage your account settings and preferences."
      menuItems={menuItems}
      onMenuSelect={handleMenuSelect}
      selectedMenu={selectedMenu}
      title="Account Settings"
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
