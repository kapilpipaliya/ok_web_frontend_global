import { createFileRoute } from "@tanstack/solid-router";

import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { invitationEmailForm } from "./invitationEmailSchema";

export const Route = createFileRoute('/internal/page/(email)/(templates)/(user)/InvitationEmail')({
  component: InvitationEmail,
})

function InvitationEmail() {
  return <SchemaRenderer form={invitationEmailForm} />;
}
