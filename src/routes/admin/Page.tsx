import {FullDashboard} from "~/pages/Dashboard";
import {API, DataFetcher} from "~/components/DataFetcher";

export default function pas() {
    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={<FullDashboard />}/>;
}
