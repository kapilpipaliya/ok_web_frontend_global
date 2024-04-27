import {AbstractSingleGrid} from "~/pages/Grids";
import {useParams} from "@solidjs/router";
import {API, DataFetcher} from "~/components/DataFetcher";
import PageHeader from "~/components/custom-component/Breadcumb";

export default function page() {
    const params = useParams();
    const breadcrumbData = [
        {name: 'Home', href: '/'},
        {name: 'Admin', href: '/admin'},
        {name: 'Page'},
    ];
    return <>
        <PageHeader
            title="Page"
            breadcrumb={breadcrumbData}
        />
        <DataFetcher fetchData={API.fetchDataUrl} renderContent={<AbstractSingleGrid tableId={'Page'}/>}/>
    </>;
}
