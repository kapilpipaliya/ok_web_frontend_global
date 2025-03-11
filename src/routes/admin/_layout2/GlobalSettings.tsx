import { clientOnly } from "@solidjs/start";
import { createFileRoute } from "@tanstack/solid-router";

const GlobalSettingsRoute = clientOnly(
  () => import("~/pages/global/AdminGlobalSettings"),
);

export const Route = createFileRoute('/admin/_layout2/GlobalSettings')({
  component: GlobalSettingsRoute,
})
