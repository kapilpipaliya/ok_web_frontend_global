import { createAsync, useNavigate } from "@solidjs/router";
import { type ParentProps, Show } from "solid-js";

import { API } from "~/lib/api/endpoints";
import { getUserRPC } from "~/routes/api/auth/(user)/getUserRPC";
import { Loader } from "~/components/Loader";

interface AuthRequiredProps extends ParentProps {
  /**
   * URL to redirect to if the user is not authenticated
   * Defaults to signin page
   */
  loginUrl?: string;
}

/**
 * A component that checks if the user is authenticated.
 * If not, it redirects to the login page.
 * Otherwise, it renders its children.
 */
export function AuthRequired(props: AuthRequiredProps) {
  const navigate = useNavigate();
  const loginUrl = props.loginUrl || API.urls.admin.signIn;

  const authData = createAsync(async () => {
    try {
      const userData = await getUserRPC();
      if (userData.error || !userData?.user) {
        navigate(loginUrl, { replace: true });
      }
      return userData;
    } catch (error) {
      navigate(loginUrl, { replace: true });
      return null;
    }
  });

  return (
    <Show
      when={authData()}
      fallback={<Loader message="Checking authentication..." />}
    >
      {props.children}
    </Show>
  );
}
