import { mutateData } from "~/lib/graph/mutate/mutate";
import { UserDashboards } from "~/pages/dynamic/UserDashboards";

export default function allDashboards() {
  mutateData();
  return <UserDashboards />;
}
