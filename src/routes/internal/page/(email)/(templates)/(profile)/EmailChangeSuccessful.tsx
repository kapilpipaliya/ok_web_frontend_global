import { createFileRoute } from "@tanstack/solid-router";

import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { emailChangeSuccessfulForm } from "./emailChangeSuccessfulSchema";

export const Route = createFileRoute('/internal/page/(email)/(templates)/(profile)/EmailChangeSuccessful')({
  component: EmailChangeSuccessful,
})

function EmailChangeSuccessful() {
  return <SchemaRenderer form={emailChangeSuccessfulForm} />;
}
