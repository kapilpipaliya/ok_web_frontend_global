import {PageDesignerDragAndDrop} from "~/components/drag-drop-pages/PageDesignerDragAndDrop";
import {API, DataFetcher} from "~/components/DataFetcher";

export default function Page() {

    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={() => {
        console.log('page desinger')
    }}/>
};
