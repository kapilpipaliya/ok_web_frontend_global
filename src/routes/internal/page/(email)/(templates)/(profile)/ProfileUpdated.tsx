import { createFileRoute } from "@tanstack/solid-router";

import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { profileUpdatedForm } from "./profileUpdatedSchema";

export const Route = createFileRoute('/internal/page/(email)/(templates)/(profile)/ProfileUpdated')({
  component: ProfileUpdated,
})

function ProfileUpdated() {
  return <SchemaRenderer form={profileUpdatedForm} />;
}
