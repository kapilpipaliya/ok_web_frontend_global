import { UserDashBoardGrid } from "~/pages/user_dashboard/UserDashBoardGrid";
import PageHeader from "~/components/custom/Breadcumb";
import { breadcrumbData } from "~/lib/constants";

export default function tableDashboard() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        breadcrumb={[...breadcrumbData, { name: "Dashboard" }]}
      />
      <UserDashBoardGrid />
    </>
  );
}
