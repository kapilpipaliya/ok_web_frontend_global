import { useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";

import { SettingsLayout } from "~/components/settings/SettingsLayout";
import { useGraph } from "~/lib/graph/graph";
import { ActivityLog } from "~/pages/global/activity/ActivityLog";
import { CompanySettings } from "~/pages/global/company/CompanySettings";
import { EmailAudit } from "~/pages/global/email/EmailAudit";
import { EmailSettings } from "~/pages/global/email/EmailSettings";
import { GeneralSettings } from "~/pages/global/general/GeneralSettings";
import { PermissionsSettings } from "~/pages/global/permission/PermissionsSettings";
import { RoleSettings } from "~/pages/global/role/RoleSettings";
import { ThemeSettings } from "~/pages/global/theme/ThemeSettings";
import { UserManagement } from "~/pages/global/user/UserManagement";

export default function AdminGlobalSettings() {
  const [graph] = useGraph();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMenu, setSelectedMenu] = createSignal(
    searchParams.tab || "general",
  );

  createEffect(() => {
    const tab = searchParams.tab;
    if (tab && tab !== selectedMenu()) {
      setSelectedMenu(tab);
    }
  });

  const menuItems = [
    {
      component: "GeneralSettings",
      id: "general",
      label: "General",
    },
    {
      component: "CompanySettings",
      id: "company",
      label: "Company Details",
    },
    {
      component: "EmailSettings",
      id: "email",
      label: "Email Settings",
    },
    {
      component: "ThemeSettings",
      id: "theme",
      label: "Theme Settings",
    },
    {
      component: "Permissions",
      id: "permissions",
      label: "Permissions",
    },
    {
      component: "RoleSettings",
      id: "roles",
      label: "Roles",
    },
    {
      component: "UserManagement",
      id: "users",
      label: "Users",
    },
    {
      component: "EmailAudit",
      id: "email-audit",
      label: "Email Audit",
    },
    {
      component: "ActivityLog",
      id: "activity-log",
      label: "Activity Log",
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
      <Show when={selectedMenu() === "general"}>
        <GeneralSettings />
      </Show>
      <Show when={selectedMenu() === "company"}>
        <CompanySettings />
      </Show>
      <Show when={selectedMenu() === "email"}>
        <EmailSettings />
      </Show>
      <Show when={selectedMenu() === "theme"}>
        <ThemeSettings />
      </Show>
      <Show when={selectedMenu() === "permissions"}>
        <PermissionsSettings />
      </Show>
      <Show when={selectedMenu() === "roles"}>
        <RoleSettings />
      </Show>
      <Show when={selectedMenu() === "users"}>
        <UserManagement />
      </Show>
      <Show when={selectedMenu() === "email-audit"}>
        <EmailAudit />
      </Show>
      <Show when={selectedMenu() === "activity-log"}>
        <ActivityLog />
      </Show>
    </SettingsLayout>
  );
}
