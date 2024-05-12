import { ForgotPasswordForm } from "~/pages/form/ForgotPasswordForm";
import SiteTitle from "~/components/website/utils";

export default function logIn() {
  return (
    <>
      <SiteTitle>Forgot Password</SiteTitle>
      <ForgotPasswordForm />
    </>
  );
}
