import { API, DataFetcher } from "~/components/api/DataFetcher";
import { PageView_ } from "~/pages/dynamic/PageView";

export default function admin() {
  
  return (
    <DataFetcher
      fetchData={API.fetchDataUrl}
      renderContent={<PageView_ count={1} id={"home"} />}
    />
  );
}
