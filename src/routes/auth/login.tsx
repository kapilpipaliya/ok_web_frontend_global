import { createFileRoute } from "@tanstack/solid-router";

import { LoginForm } from "~/pages/auth/LoginForm";

export const Route = createFileRoute('/auth/login')({
  component: LoginForm,
})
