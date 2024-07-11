import { Breadcrumb } from "~/components/Breadcrumb";
import { breadcrumbData } from "~/lib/constants";
import { UserDashBoardGrid } from "~/pages/UserDashBoardGrid";

export default function tableDashboard() {
  return (
    <>
      <Breadcrumb
        breadcrumb={[...breadcrumbData, { name: "Dashboard" }]}
        title="Dashboard"
      />
      <UserDashBoardGrid />
    </>
  );
}
