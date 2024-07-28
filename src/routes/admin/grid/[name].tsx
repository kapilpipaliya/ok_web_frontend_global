import { Breadcrumb } from "~/components/Breadcrumb";
import { useGraph } from "~/lib/graph/graph";
import { UserDashBoardGrid } from "~/pages/UserDashBoardGrid";

export default function tableDashboard() {
  const [graph] = useGraph();
  const breadcrumbData = [
    { href: `${graph.APP_BASE_URL}`, icon: "ic:baseline-home", name: "Home" },
  ];
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
