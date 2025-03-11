import { createFileRoute } from "@tanstack/solid-router";

import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { accountDeletionRequestForm } from "./accountDeletionSchema";

export const Route = createFileRoute('/internal/page/(email)/(templates)/(account)/AccountDeletionRequest')({
  component: AccountDeletionRequest,
})

function AccountDeletionRequest() {
  return <SchemaRenderer form={accountDeletionRequestForm} />;
}
