import { clientOnly } from "@solidjs/start";
import { createFileRoute } from "@tanstack/solid-router";

const AdminUserSettingsRoute = clientOnly(
  () => import("~/pages/user/AdminUserSettings"),
);

export const Route = createFileRoute('/admin/_layout2/UserSettings')({
  component: AdminUserSettingsRoute,
})
