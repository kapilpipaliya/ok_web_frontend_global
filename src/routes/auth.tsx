import { createAsync, RouteSectionProps, useNavigate } from "@solidjs/router";
import { getUser } from "~/lib/auth/auth";
import { APP_BASE_URL } from "~/lib/Utils";

export default function auth(props: RouteSectionProps) {
  const navigate = useNavigate();

  const user = createAsync(() => getUser(), { deferStream: true });
  if (user()?.id) {
    navigate(`${APP_BASE_URL}`);
  }

  return <>{props.children}</>;
}
