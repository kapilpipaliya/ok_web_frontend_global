import { createFileRoute } from "@tanstack/solid-router";

import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { emailChangedForm } from "./emailChangedSchema";

export const Route = createFileRoute('/internal/page/(email)/(templates)/(profile)/EmailChanged')({
  component: EmailChanged,
})

function EmailChanged() {
  return <SchemaRenderer form={emailChangedForm} />;
}
