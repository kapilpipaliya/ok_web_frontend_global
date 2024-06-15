import { UserDashBoardGrid } from "~/pages/UserDashBoardGrid";
import {Breadcrumb} from "~/components/Breadcrumb";
import { breadcrumbData } from "~/lib/constants";

export default function tableDashboard() {
  return (
    <>
      <Breadcrumb
        title="Dashboard"
        breadcrumb={[...breadcrumbData, { name: "Dashboard" }]}
      />
      <UserDashBoardGrid />
    </>
  );
}
