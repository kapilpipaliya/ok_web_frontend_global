import { SiteTitle } from "~/components/SiteTitle";
import { LoginForm } from "~/pages/form/LoginForm";

export default function logIn() {
  return (
    <>
      <SiteTitle>Login</SiteTitle>
      <LoginForm />
    </>
  );
}
