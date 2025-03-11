import { createFileRoute } from "@tanstack/solid-router";

import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { signupEmailVerificationForm } from "./signupEmailVerificationSchema";

export const Route = createFileRoute('/internal/page/(email)/(templates)/(signup)/SignupEmailVerification')({
  component: SignupEmailVerification,
})

function SignupEmailVerification() {
  return <SchemaRenderer form={signupEmailVerificationForm} />;
}
