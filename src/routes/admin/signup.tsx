import { SignUp} from "~/pages/Forms";
import {API, DataFetcher} from "~/components/DataFetcher";

export default function signUp() {
    return <DataFetcher fetchData={API.fetchDataUrl} renderContent={<SignUp />}/>;
}
