import { useParams } from "@solidjs/router";
import { API, DataFetcher } from "~/components/api/DataFetcher";
import { AbstractSingleGrid } from "~/pages/dynamic/Grids";

export default function admin() {
  const params = useParams();
  return (
    <DataFetcher
      renderContent={<AbstractSingleGrid tableId={params.entity} />}
      fetchData={API.fetchDataUrl}
    />
  );
}
