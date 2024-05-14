import { createAsync, RouteSectionProps, useNavigate } from "@solidjs/router";
import { API } from "~/components/api/DataFetcher";
import getAPI from "~/components/api/getApi";
import { APP_BASE_URL } from "~/lib/Utils";
// todo: when user come to login page, if already login redirect to dashboard.
export default function auth(props: RouteSectionProps) {
  const navigate = useNavigate();

  
  // getAPI(API.getUserUrl).then((user) => {
  //   if (user?.id) {
  //     navigate(`${APP_BASE_URL}`);
  //   }
  // });

  return <>{props.children}</>;
}
