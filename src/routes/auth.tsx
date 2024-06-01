import { type RouteSectionProps, useNavigate } from "@solidjs/router";
// todo: when user come to login page, if already login redirect to dashboard.
export default function AuthLayout(props: RouteSectionProps) {
  const navigate = useNavigate();

  // getAPI(API.getUserUrl).then((user) => {
  //   if (user?.id) {
  //     navigate(`${APP_BASE_URL}`);
  //   }
  // });

  return <>{props.children}</>;
}
