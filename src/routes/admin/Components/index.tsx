import { useParams } from "@solidjs/router";
import { AbstractSingleGrid } from "~/pages/dynamic/Grids";
import { API, DataFetcher } from "~/components/api/DataFetcher";

export default function Components() {
  const params = useParams();

  return (
    <DataFetcher
      fetchData={API.fetchDataUrl}
      renderContent={
        <DataFetcher
          fetchData={API.getPagesDataUrl}
          renderContent={<AbstractSingleGrid tableId={params.entity} />}
        />
      }
    />
  );
}
