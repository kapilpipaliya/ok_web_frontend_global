import { UserDashBoardGrid } from "~/pages/dynamic/UserDashBoardGrid";
import { breadcrumbData } from "~/lib/Utils";
import PageHeader from "~/components/custom/Breadcumb";

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
