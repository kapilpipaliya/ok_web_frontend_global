import { SiteTitle } from "~/components/SiteTitle";
import { ForgotPassword } from "~/pages/form/ForgotPassword";

export default function logIn() {
  return (
    <>
      <SiteTitle>Forgot Password</SiteTitle>
      <ForgotPassword />
    </>
  );
}
