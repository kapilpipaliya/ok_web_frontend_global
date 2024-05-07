import { API, DataFetcher } from "~/components/api/DataFetcher";
import { SimpleImport } from "~/pages/form/FormsAdmin";

export default function simpleimport() {
  return (
    <DataFetcher
      fetchData={API.fetchDataUrl}
      renderContent={<SimpleImport />}
    />
  );
}
