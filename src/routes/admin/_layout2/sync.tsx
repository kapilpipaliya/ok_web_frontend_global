import { createFileRoute } from "@tanstack/solid-router";

import { SyncData } from "~/pages/manage/SyncData";

export const Route = createFileRoute('/admin/_layout2/sync')({
  component: SyncData,
})
