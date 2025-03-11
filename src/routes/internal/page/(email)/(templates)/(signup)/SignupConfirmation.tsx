import { createFileRoute } from "@tanstack/solid-router";

import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { signupConfirmationForm } from "./signupConfirmationSchema";

export const Route = createFileRoute('/internal/page/(email)/(templates)/(signup)/SignupConfirmation')({
  component: SignupConfirmation,
})

function SignupConfirmation() {
  return <SchemaRenderer form={signupConfirmationForm} />;
}
