import { AllDashboards } from "~/pages/dynamic/Grids";
import { API, DataFetcher } from "~/components/api/DataFetcher";

export default function allDashboards() {
  return (
    <DataFetcher
      fetchData={API.fetchDataUrl}
      renderContent={<AllDashboards />}
    />
  );
}
