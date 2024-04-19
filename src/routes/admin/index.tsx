import {FullDashboard} from "~/pages/Dashboard";
import {API, DataFetcher} from "~/components/DataFetcher";

export default function admin() {
    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={<FullDashboard/>}/>
}
