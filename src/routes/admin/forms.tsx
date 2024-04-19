import {AllForms} from "~/pages/FormsAdmin";
import {API, DataFetcher} from "~/components/DataFetcher";
import {AllDashboards} from "~/pages/Grids";

export default function allDashboards() {
    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={<AllForms />}/>;
}
