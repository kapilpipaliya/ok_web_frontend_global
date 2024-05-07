import { AllDashboards } from "~/pages/dynamic/Grids";
import { API, DataFetcher } from "~/components/api/DataFetcher";
import { Dashboard } from "~/pages/dynamic/Dashboard";

export default function allDashboards() {
  return (
    <DataFetcher
      fetchData={API.fetchDataUrl}
      renderContent={<AllDashboards />}
    />
  );
}
