
import ForgotPasswordForm, { Login } from "~/pages/Forms";
import SiteTitle from "~/components/website/utils";

export default function logIn() {

    return <>
        <SiteTitle>Forgot Password</SiteTitle>
        <ForgotPasswordForm />
    </>
}