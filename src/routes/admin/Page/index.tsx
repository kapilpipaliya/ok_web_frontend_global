import {AbstractSingleGrid} from "~/pages/Grids";
import {useParams} from "@solidjs/router";

export default function page() {
    const params = useParams();
    return <AbstractSingleGrid tableId={params.entity}/>;
}
