import { SettingsLayout } from "~/components/styled/SettingsLayout";
import { ActivityLog } from "~/pages/global/activity/ActivityLog";
import { EmailAudit } from "~/pages/global/email/EmailAudit";
import { EmailSetting } from "~/pages/global/email/EmailSetting";
import { GeneralSettings } from "~/pages/global/general/GeneralSettings";
import { RobotsTxtSettings } from "~/pages/global/robotsTxt/RobotsTxtSettings";
import { OAuthSetting } from "~/pages/global/oauth/OAuthSetting";
import { PermissionsSettings } from "~/pages/global/permission/PermissionsSettings";
import { RazorpaySettings } from "~/pages/global/razorpay/RazorpaySettings";
import { RoleSettings } from "~/pages/global/role/RoleSettings";
import { StripeSettings } from "~/pages/global/stripe/StripeSettings";
import { SupportTickets } from "~/pages/global/support/SupportTickets";
import { ThemeSettings } from "~/pages/global/theme/ThemeSettings";
import { UserManagement } from "~/pages/global/user/UserManagement";
import { ShopMigrationRequestSettings } from "~/pages/global/shopMigrationRequest/ShopMigrationRequestSettings";
import { WorkerManagement } from "~/pages/global/worker/WorkerManagement";

export default function AdminGlobalSettings() {
  const menuItems = [
    {
      component: GeneralSettings,
      group: "Basic Settings",
      icon: "ph:gear",
      id: "general",
      label: "General",
    },
    {
      component: RobotsTxtSettings,
      group: "Basic Settings",
      icon: "ph:file-text",
      id: "robots-txt",
      label: "robots.txt",
    },
    // {
    //   component: CompanySettings,
    //   group: "Basic Settings",
    //   icon: "ph:buildings",
    //   id: "company",
    //   label: "Company Details",
    // },
    {
      component: EmailSetting,
      group: "Communication",
      icon: "ph:envelope",
      id: "email",
      label: "Email Settings",
    },
    {
      component: OAuthSetting,
      group: "Authentication",
      icon: "ph:key",
      id: "oauth",
      label: "OAuth Settings",
    },
    {
      component: StripeSettings,
      group: "Payments",
      icon: "ph:credit-card",
      id: "stripe",
      label: "Stripe Settings",
    },
    {
      component: RazorpaySettings,
      group: "Payments",
      icon: "ph:currency-dollar",
      id: "razorpay",
      label: "Razorpay Settings",
    },
    {
      component: ThemeSettings,
      group: "Appearance",
      icon: "ph:paint-brush",
      id: "theme",
      label: "Theme Settings",
    },
    {
      component: PermissionsSettings,
      group: "Access Control",
      icon: "ph:lock",
      id: "permissions",
      label: "Permissions",
    },
    {
      component: RoleSettings,
      group: "Access Control",
      icon: "ph:users-three",
      id: "roles",
      label: "Roles",
    },
    {
      component: UserManagement,
      group: "Access Control",
      icon: "ph:user-gear",
      id: "users",
      label: "Users",
    },
    {
      component: EmailAudit,
      group: "Monitoring",
      icon: "ph:envelope-simple-open",
      id: "email-audit",
      label: "Email Audit",
    },
    {
      component: ActivityLog,
      group: "Monitoring",
      icon: "ph:activity",
      id: "activity-log",
      label: "Activity Log",
    },
    {
      component: ShopMigrationRequestSettings,
      group: "System",
      icon: "ph:database",
      id: "shop-migration-request",
      label: "Shop migration request",
    },
    {
      component: WorkerManagement,
      group: "System",
      icon: "ph:gear-six",
      id: "workers",
      label: "Workers",
    },
    {
      component: SupportTickets,
      group: "Support",
      icon: "ph:ticket",
      id: "support-tickets",
      label: "Support Tickets",
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
