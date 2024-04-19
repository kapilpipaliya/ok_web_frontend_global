import BackupRestore from "~/pages/BackupRestore";
import {API, DataFetcher} from "~/components/DataFetcher";

export default function backuprestore() {
    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={<BackupRestore />}/>;
}
