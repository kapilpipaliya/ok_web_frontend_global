import {GraphViewPage} from "~/pages/GraphViewPage";
import {API, DataFetcher} from "~/components/DataFetcher";

export default function logIn() {
    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={<GraphViewPage />}/>;
}
