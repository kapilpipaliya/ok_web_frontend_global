import { createFileRoute } from "@tanstack/solid-router";

import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { passwordChangedForm } from "./passwordChangedSchema";

export const Route = createFileRoute('/internal/page/(email)/(templates)/(profile)/PasswordChanged')({
  component: PasswordChanged,
})

function PasswordChanged() {
  return <SchemaRenderer form={passwordChangedForm} />;
}
