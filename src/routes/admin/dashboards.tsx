import {FullDashboard} from "~/pages/Dashboard";
import {AllDashboards} from "~/pages/Grids";
import {API, DataFetcher} from "~/components/DataFetcher";

export default function allDashboards() {
    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={<AllDashboards />}/>;
}
