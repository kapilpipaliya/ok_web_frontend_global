import { useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";

import { SettingsLayout } from "~/components/styled/SettingsLayout";
import { AccountDeletionForm } from "~/pages/user/AccountDeletionForm";
import { PasswordChangeForm } from "~/pages/user/PasswordChangeForm";
import { ProfileSettings } from "~/pages/user/ProfileSettings";

export default function SystemUserSettings() {
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
    {
      component: "AccountDeletion",
      id: "delete-account",
      label: "Delete Account",
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
      <Show when={selectedMenu() === "delete-account"}>
        <AccountDeletionForm />
      </Show>
    </SettingsLayout>
  );
}
