import { ForgotPassword } from "~/pages/form/ForgotPassword";
import SiteTitle from "~/components/website/utils";

export default function logIn() {
  return (
    <>
      <SiteTitle>Forgot Password</SiteTitle>
      <ForgotPassword />
    </>
  );
}
