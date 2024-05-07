import { API, DataFetcher } from "~/components/api/DataFetcher";
import Settings from "~/pages/drag-drop/Setting";

export default function setting() {
  return (
    <DataFetcher fetchData={API.fetchDataUrl} renderContent={<Settings />} />
  );
}
