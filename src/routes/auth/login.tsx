import { SiteTitle } from "~/components/SiteTitle";
import { LoginForm } from "~/pages/auth/LoginForm";

export default function logIn() {
  return (
    <>
      <SiteTitle>Login</SiteTitle>
      <LoginForm />
    </>
  );
}
