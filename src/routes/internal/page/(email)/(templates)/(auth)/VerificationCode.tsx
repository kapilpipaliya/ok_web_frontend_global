import { createFileRoute } from "@tanstack/solid-router";

import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { verificationCodeForm } from "./verificationCodeSchema";

export const Route = createFileRoute('/internal/page/(email)/(templates)/(auth)/VerificationCode')({
  component: VerificationCode,
})

function VerificationCode() {
  return <SchemaRenderer form={verificationCodeForm} />;
}
