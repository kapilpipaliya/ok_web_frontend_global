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
import { SupportTickets } from "~/pages/global/support/SupportTickets";
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
      group: "Basic Settings",
      id: "general",
      label: "General",
    },
    {
      component: "CompanySettings",
      group: "Basic Settings",
      id: "company",
      label: "Company Details",
    },
    {
      component: "EmailSettings",
      group: "Communication",
      id: "email",
      label: "Email Settings",
    },
    {
      component: "ThemeSettings",
      group: "Appearance",
      id: "theme",
      label: "Theme Settings",
    },
    {
      component: "Permissions",
      group: "Access Control",
      id: "permissions",
      label: "Permissions",
    },
    {
      component: "RoleSettings",
      group: "Access Control",
      id: "roles",
      label: "Roles",
    },
    {
      component: "UserManagement",
      group: "Access Control",
      id: "users",
      label: "Users",
    },
    {
      component: "EmailAudit",
      group: "Monitoring",
      id: "email-audit",
      label: "Email Audit",
    },
    {
      component: "ActivityLog",
      group: "Monitoring",
      id: "activity-log",
      label: "Activity Log",
    },
    {
      component: "SupportTickets",
      group: "Support",
      id: "support-tickets",
      label: "Support Tickets",
    },
  ];

  const handleMenuSelect = (id: string) => {
    setSearchParams({ tab: id });
  };

  return (
    <SettingsLayout
      description="Manage global application settings"
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
      <Show when={selectedMenu() === "support-tickets"}>
        <SupportTickets />
      </Show>
    </SettingsLayout>
  );
}
