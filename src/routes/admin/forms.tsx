import { AllForms } from "~/pages/form/FormsAdmin";
import { API, DataFetcher } from "~/components/api/DataFetcher";

export default function allDashboards() {
  return (
    <DataFetcher fetchData={API.fetchDataUrl} renderContent={<AllForms />} />
  );
}
