import { TableDashboard} from "~/pages/Grids";
import {API, DataFetcher} from "~/components/DataFetcher";

export default function tableDashboard() {
    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={<TableDashboard/>}/>;
}
