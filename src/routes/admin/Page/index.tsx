import { AbstractSingleGrid } from "~/pages/dynamic/Grids";
import { useParams } from "@solidjs/router";
import { API, DataFetcher } from "~/components/api/DataFetcher";
import PageHeader from "~/components/custom/Breadcumb";
import { APP_BASE_URL, APP_BASE_URL_NAME, breadcrumbData } from "~/lib/Utils";

export default function page() {
  return (
    <>
      <DataFetcher
        fetchData={API.fetchDataUrl}
        renderContent={<AbstractSingleGrid tableId={"Page"} />}
      />
    </>
  );
}
