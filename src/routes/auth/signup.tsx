import { SiteTitle } from "~/components/SiteTitle";
import { SignupForm } from "~/pages/auth/SignupForm";

export default function signUp() {
  return (
    <>
      <SiteTitle>Sign Up</SiteTitle>
      <SignupForm />
    </>
  );
}
