
import {API, DataFetcher} from "~/components/DataFetcher";
import {PageView_} from "~/pages/PageView";

export default function admin() {
    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={<PageView_ count={1} id={"home"}/>}/>
}
