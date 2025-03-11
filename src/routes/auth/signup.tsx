import { createFileRoute } from "@tanstack/solid-router";

import { SignupForm } from "~/pages/auth/SignupForm";

export const Route = createFileRoute('/auth/signup')({
  component: SignupForm,
})
