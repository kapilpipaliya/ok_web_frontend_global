import { createFileRoute } from "@tanstack/solid-router";

import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { welcomeEmailForm } from "./welcomeEmailSchema";

export const Route = createFileRoute('/internal/page/(email)/(templates)/(signup)/WelcomeEmail')({
  component: WelcomeEmail,
})

function WelcomeEmail() {
  return <SchemaRenderer form={welcomeEmailForm} />;
}
