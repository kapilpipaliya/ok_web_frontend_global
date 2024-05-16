import { DataGrid } from "~/pages/dynamic/GridData";
import { API, DataFetcher } from "~/components/api/DataFetcher";

export default function page() {
  return (
    <>
      <DataFetcher
        fetchData={API.getPagesDataUrl}
        renderContent={<DataGrid tableId={"Page"} />}
      />
    </>
  );
}
