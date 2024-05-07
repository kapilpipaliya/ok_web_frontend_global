import { createAsync, RouteSectionProps, useNavigate } from "@solidjs/router";
import { CSSRuntimeProvider } from "~/components/css/CSSRuntimeProvider";
import { config } from "~/master.css";
import { getUser } from "~/lib/auth/auth";
import { APP_BASE_URL } from "~/lib/Utils";
import { createEffect } from "solid-js";

export default function auth(props: RouteSectionProps) {
  const navigate = useNavigate();

  const user = createAsync(() => getUser(), { deferStream: true });
  if (user()?.id) {
    navigate(`${APP_BASE_URL}`);
  }

  return <>{props.children}</>;
}
