import { ForgotPasswordForm } from "~/pages/form/Forms";
import SiteTitle from "~/components/website/utils";

export default function logIn() {
  return (
    <>
      <SiteTitle>Forgot Password</SiteTitle>
      <ForgotPasswordForm />
    </>
  );
}
