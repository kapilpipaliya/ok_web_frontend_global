import {useParams} from "@solidjs/router";
import {AbstractSingleGrid} from "~/pages/Grids";

export default function Components() {
    const params = useParams();
    return <AbstractSingleGrid tableId={params.entity}/>;
}
