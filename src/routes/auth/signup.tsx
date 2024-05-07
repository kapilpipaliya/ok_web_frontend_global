import { Login, SignUp } from "~/pages/form/Forms";
import SiteTitle from "~/components/website/utils";

export default function signUp() {
  return (
    <>
      <SiteTitle>Sign Up</SiteTitle>
      <SignUp />
    </>
  );
}
