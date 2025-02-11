import { v7 as uuidv7 } from "uuid";

import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { useGraph } from "~/lib/graph/graph";
import { createMeta } from "~/lib/graph/mutate/form/createMeta";
import { addNewVertex } from "~/lib/graph/mutate/vertex";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export function SchemaRenderer(props: { form: IFormMetaData }) {
  const [graph, setGraph] = useGraph();
  const metaTxnId = generateNewTxnId(graph, setGraph);

  const formMeta = createMeta(props.form, metaTxnId, graph, setGraph);
  const formDataId = uuidv7();
  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: ["SchemaRenderer"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );
  return (
    <PageViewWrapper
      formDataId={formDataId}
      formMetaId={formMeta.vertex?.id}
      hideSaveCancelButton={true}
      isNoPermissionCheck={true}
      metaTxnId={metaTxnId}
      pageVertexName="SchemaRenderer"
    />
  );
}
