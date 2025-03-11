import { createFileRoute } from "@tanstack/solid-router";

import { ContactForm } from "~/pages/auth/ContactForm";

export const Route = createFileRoute('/support/contact')({
  component: ContactForm,
})
