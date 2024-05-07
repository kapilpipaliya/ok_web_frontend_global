import { TableDashboard } from "~/pages/dynamic/Grids";
import { API, DataFetcher } from "~/components/api/DataFetcher";
import { breadcrumbData } from "~/lib/Utils";
import PageHeader from "~/components/custom/Breadcumb";

export default function tableDashboard() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        breadcrumb={[...breadcrumbData, { name: "Dashboard" }]}
      />
      <DataFetcher
        fetchData={API.fetchDataUrl}
        renderContent={<TableDashboard />}
      />
    </>
  );
}
