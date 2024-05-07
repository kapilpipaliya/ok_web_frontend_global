import { API, DataFetcher } from "~/components/api/DataFetcher";
import { GraphViewPage } from "~/components/custom/GraphViewPage";

export default function logIn() {
  return (
    <DataFetcher
      fetchData={API.fetchDataUrl}
      renderContent={<GraphViewPage />}
    />
  );
}
