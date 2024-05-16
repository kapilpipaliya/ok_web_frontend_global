import { useParams } from "@solidjs/router";
import { DataGrid } from "~/pages/dynamic/GridData";
import { API, DataFetcher } from "~/components/api/DataFetcher";

export default function Components() {
  const params = useParams();

  return (
    <DataFetcher
      fetchData={API.fetchDataUrl}
      renderContent={
        <DataFetcher
          fetchData={API.getPagesDataUrl}
          renderContent={<DataGrid tableId={params.entity} />}
        />
      }
    />
  );
}
