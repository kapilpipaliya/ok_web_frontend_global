import { PageDesignerDragAndDrop } from "~/pages/drag-drop/PageDesignerDragAndDrop";
import { API, DataFetcher } from "~/components/api/DataFetcher";

export default function Page() {
  return (
    <DataFetcher
      fetchData={API.getFormDataUrl}
      renderContent={<PageDesignerDragAndDrop />}
    ></DataFetcher>
  );
}
