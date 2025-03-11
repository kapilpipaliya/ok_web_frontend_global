import { clientOnly } from "@solidjs/start";
import { createFileRoute } from "@tanstack/solid-router";

const SystemUserSettingsRoute = clientOnly(
  () => import("~/pages/user/SystemUserSettings"),
);

export const Route = createFileRoute('/system/_layout/UserSettings')({
  component: SystemUserSettingsRoute,
})
