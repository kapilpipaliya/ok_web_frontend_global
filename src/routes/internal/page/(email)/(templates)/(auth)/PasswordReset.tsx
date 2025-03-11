import { createFileRoute } from "@tanstack/solid-router";

import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { passwordResetForm } from "./passwordResetSchema";

export const Route = createFileRoute('/internal/page/(email)/(templates)/(auth)/PasswordReset')({
  component: PasswordReset,
})

function PasswordReset() {
  return <SchemaRenderer form={passwordResetForm} />;
}
