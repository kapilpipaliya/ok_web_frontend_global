import {TableDashboard} from "~/pages/Grids";
import {API, DataFetcher} from "~/components/DataFetcher";
import {breadcrumbData} from "~/lib/Utils";
import PageHeader from "~/components/custom-component/Breadcumb";

export default function tableDashboard() {

    return <>
        <PageHeader
        title="Dashboard"
        breadcrumb={[...breadcrumbData, {name: 'Dashboard'}]}
    />
        <DataFetcher fetchData={API.fetchDataUrl} renderContent={<TableDashboard/>}/></>;
}
