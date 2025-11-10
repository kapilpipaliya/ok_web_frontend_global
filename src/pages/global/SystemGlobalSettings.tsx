import { SettingsLayout } from "~/components/styled/SettingsLayout";
import { EmailSettings } from "~/pages/global/email/EmailSettings";
import { AdminWorkerManagement } from "~/pages/global/worker/AdminWorkerManagement";
import { RedisManagement } from "~/pages/global/redis/RedisManagement";

export default function SystemGlobalSettings() {
  const menuItems = [
    {
      component: EmailSettings,
      icon: "ph:envelope",
      id: "email",
      label: "Email Settings",
    },
    {
      component: AdminWorkerManagement,
      icon: "ph:circles-three",
      id: "admin-workers",
      label: "All Subdomain Workers",
    },
    {
      component: RedisManagement,
      icon: "ph:database",
      id: "redis",
      label: "Redis Management",
    },
  ];

  return (
    <SettingsLayout
      description="Manage global application settings"
      menuItems={menuItems}
      title="Global Settings"
    />
  );
}
