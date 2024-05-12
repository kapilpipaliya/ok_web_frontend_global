import { API, DataFetcher } from "~/components/api/DataFetcher";
import {BackupRestore} from "~/pages/dynamic/BackupRestore";

export default function backuprestore() {
  return (
    <DataFetcher
      fetchData={API.fetchDataUrl}
      renderContent={<BackupRestore />}
    />
  );
}
