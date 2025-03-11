import { createFileRoute } from "@tanstack/solid-router";

import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { emailConfirmationForm } from "./emailConfirmationSchema";

export const Route = createFileRoute('/internal/page/(email)/(templates)/(profile)/EmailConfirmation')({
  component: EmailConfirmation,
})

function EmailConfirmation() {
  return <SchemaRenderer form={emailConfirmationForm} />;
}
