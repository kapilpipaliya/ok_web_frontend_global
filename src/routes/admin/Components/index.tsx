import {useParams} from "@solidjs/router";
import {AbstractSingleGrid} from "~/pages/Grids";
import {API, DataFetcher} from "~/components/DataFetcher";

export default function Components() {
    const params = useParams();
    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={<DataFetcher fetchData={API.fetchDataUrl} renderContent={<AbstractSingleGrid tableId={params.entity}/>}/>}/>;
}
