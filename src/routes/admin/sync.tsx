import { SyncComopnent } from "~/components/admin/Sync";
import { API, DataFetcher } from "~/components/api/DataFetcher";

export default function Sync() {
  return (
    <DataFetcher
      fetchData={API.fetchDataUrl}
      renderContent={<SyncComopnent />}
    />
  );
}
