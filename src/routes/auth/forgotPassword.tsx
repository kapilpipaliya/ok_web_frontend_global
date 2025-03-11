import { createFileRoute } from "@tanstack/solid-router";

import { ForgotPasswordForm } from "~/pages/auth/ForgotPasswordForm";

export const Route = createFileRoute('/auth/forgotPassword')({
  component: ForgotPasswordForm,
})
