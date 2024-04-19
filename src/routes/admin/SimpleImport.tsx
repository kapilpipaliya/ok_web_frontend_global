import {SimpleImport} from "~/pages/FormsAdmin";
import {API, DataFetcher} from "~/components/DataFetcher";

export default function simpleimport() {
    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={<SimpleImport />}/>;
}
