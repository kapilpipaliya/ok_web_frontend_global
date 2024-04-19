import {FullDashboard} from "~/pages/Dashboard";
import {Login} from "~/pages/Forms";
import {API, DataFetcher} from "~/components/DataFetcher";

export default function logIn() {
    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={<Login />}/>;
}
