import { UserDashBoardGrid } from "~/pages/UserDashBoardGrid";
import {PageHeader} from "~/components/Breadcrumb";
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
