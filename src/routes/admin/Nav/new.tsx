import { NavDesigner } from "~/pages/form/FormDesigner";
import { API, DataFetcher } from "~/components/api/DataFetcher";

export default function NavNew() {
  return (
    <DataFetcher
      fetchData={API.getPagesDataUrl}
      renderContent={<NavDesigner />}
    />
  );
}
