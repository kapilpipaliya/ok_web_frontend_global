import { AbstractSingleGrid } from "~/pages/dynamic/Grids";
import { API, DataFetcher } from "~/components/api/DataFetcher";

export default function page() {
  return (
    <>
      <DataFetcher
        fetchData={API.getPagesDataUrl}
        renderContent={<AbstractSingleGrid tableId={"Page"} />}
      />
    </>
  );
}
