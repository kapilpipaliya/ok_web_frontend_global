import { SettingsLayout } from "~/components/styled/SettingsLayout";
import { PasswordChangeForm } from "~/pages/user/PasswordChangeForm";
import { ProfileSettings } from "~/pages/user/ProfileSettings";

export default function AdminUserSettings() {
  const menuItems = [
    {
      component: ProfileSettings,
      id: "profile",
      label: "Profile",
    },
    {
      component: PasswordChangeForm,
      id: "password",
      label: "Change Password",
    },
  ];

  return (
    <SettingsLayout
      description="Manage your account settings and preferences."
      menuItems={menuItems}
      title="Account Settings"
    />
  );
}
