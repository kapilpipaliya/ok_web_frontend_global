import { clientOnly } from "@solidjs/start";
import { createFileRoute } from "@tanstack/solid-router";

const SystemGlobalSettingsRoute = clientOnly(
  () => import("~/pages/global/SystemGlobalSettings"),
);

export const Route = createFileRoute('/system/_layout/GlobalSettings')({
  component: SystemGlobalSettingsRoute,
})
