import { createFileRoute } from "@tanstack/solid-router";

import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { testEmailForm } from "./testEmailSchema";

export const Route = createFileRoute('/internal/page/(email)/(templates)/(other)/TestEmail')({
  component: TestEmail,
})

function TestEmail() {
  return <SchemaRenderer form={testEmailForm} />;
}
