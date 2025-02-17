import { SiteTitle } from "~/components/SiteTitle";
import { ForgotPasswordForm } from "~/pages/auth/ForgotPasswordForm";

export default function logIn() {
  return (
    <>
      <SiteTitle>Forgot Password</SiteTitle>
      <ForgotPasswordForm />
    </>
  );
}
