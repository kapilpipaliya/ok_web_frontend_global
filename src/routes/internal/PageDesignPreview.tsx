import { clientOnly } from "@solidjs/start";
import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute('/internal/PageDesignPreview')({
  component: clientOnly(() => import("../../pages/PageDesignPreview")),
})
