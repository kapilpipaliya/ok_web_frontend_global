import {Login, Logout} from "~/pages/Forms";
import {API, DataFetcher} from "~/components/DataFetcher";

export default function logout() {
    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={<Logout />}/>;
}
