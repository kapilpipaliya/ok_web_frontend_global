import {AbstractSingleGrid} from "~/pages/Grids";
import {useParams} from "@solidjs/router";
import {API, DataFetcher} from "~/components/DataFetcher";

export default function page() {
    const params = useParams();
    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={<AbstractSingleGrid tableId={params.entity}/>}/>;
}
