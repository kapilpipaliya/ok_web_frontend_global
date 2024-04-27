import {API, DataFetcher} from "~/components/DataFetcher";
import {GraphViewPage} from "~/pages/GraphViewPage";
import Settings from "~/components/Setting";

export default function setting() {
    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={<Settings />}/>;
}
