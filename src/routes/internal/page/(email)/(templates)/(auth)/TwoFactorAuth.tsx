import { createFileRoute } from "@tanstack/solid-router";

import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { twoFactorAuthForm } from "./twoFactorAuthSchema";

export const Route = createFileRoute('/internal/page/(email)/(templates)/(auth)/TwoFactorAuth')({
  component: TwoFactorAuth,
})

function TwoFactorAuth() {
  return <SchemaRenderer form={twoFactorAuthForm} />;
}
