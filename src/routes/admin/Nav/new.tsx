import {NavDesigner} from "~/pages/FormDesigner";
import {API, DataFetcher} from "~/components/DataFetcher";

export default function NavNew() {
    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={<NavDesigner/>}/>;
}
