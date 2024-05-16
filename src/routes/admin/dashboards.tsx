import { UserDashboards } from "~/pages/dynamic/UserDashboards";
import { API, DataFetcher } from "~/components/api/DataFetcher";

export default function allDashboards() {
  return (
    <DataFetcher
      fetchData={API.fetchDataUrl}
      renderContent={<UserDashboards />}
    />
  );
}
