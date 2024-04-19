import {API, DataFetcher} from "~/components/DataFetcher";
import BackupRestore from "~/pages/BackupRestore";

export default function backuprestore() {
    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={<BackupRestore />}/>;
}
