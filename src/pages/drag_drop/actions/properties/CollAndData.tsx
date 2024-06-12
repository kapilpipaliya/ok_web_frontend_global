import { createSignal, onCleanup, useContext } from "solid-js";
import { SelectInputField } from "~/components/fields/SelectInputField";
import { GenericInputField } from "~/components/fields/GenericInputField";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { addMetaVertexes } from "~/lib/graph/mutate/form/metaFunction";
import { getNewGraphId, getNewTxnId, revertTransaction } from "~/lib/graph/transaction";
import { FieldAttribute } from "~/lib/FormMetadataType";
import { SelectedIdContext, PageConfigContext } from "~/lib/contexts";
import { getChildVertexes } from "~/lib/graph/get/sync/traverse";
import { GraphContext, IdAttr } from "~/lib/graph/graph";

export function CollAndData(props: any) {
    const [graph, setGraph] = useContext(GraphContext)!;
    const [selectedId] = useContext(SelectedIdContext);
    const [pageConfig] = useContext(PageConfigContext);

    const metaVertexId = getNewGraphId();
    const txnId = getNewTxnId(graph, setGraph);

    addNewVertex(
        txnId,
        newVertex(metaVertexId, ["MetaAttr"], {
            name: "Attr",
            type: "Attr",
            label: "Attr",
        }),
        graph,
        setGraph,
    );

    const attributes: FieldAttribute[] = [
        {
            name: "coll",
            displayName: "Collection",
            component: "SelectBox",
            collection: "g:'Coll'",
            parentLabel: "Coll",
        },
        {
            name: "data",
            component: "SelectBox",
            collection: `g:'{{->$0Coll::'P.${IdAttr}'}}'`,
        },
        {
            name: "data",
            component: "TextBox",
        },
    ];

    addMetaVertexes(graph, setGraph, txnId, graph.vertexes[metaVertexId], attributes);

    onCleanup(() => {
        revertTransaction(txnId);
    });

    const metaVertex = graph.vertexes[metaVertexId];
    const collMetaVertex = getChildVertexes(graph, ["MetaAttr"], [metaVertex]);

    return (
        <>
            <br />
            <SelectInputField
                data={graph.vertexes[selectedId()!]}
                meta={collMetaVertex.vertexes?.[0]!}
                disabled={false}
                title={"Collection:"}
                component={"SelectBox"}
                txnId={pageConfig.formData.txnId}
                isRealTime={false}
            />
            <SelectInputField
                data={graph.vertexes[selectedId()!]}
                meta={collMetaVertex.vertexes?.[1]!}
                disabled={false}
                title={"Data:"}
                component={"SelectBox"}
                txnId={pageConfig.formData.txnId}
                isRealTime={false}
            />
            <span class="float:left mt:5">Expression:</span>
            <GenericInputField
                txnId={txnId}
                title={""}
                data={graph.vertexes[selectedId()!]}
                meta={collMetaVertex.vertexes?.[2]!}
                disabled={false}
                component={"TextBox"}
            />
        </>
    );
}
