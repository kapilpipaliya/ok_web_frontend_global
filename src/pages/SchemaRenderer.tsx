import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import type { ServerResult } from "~/cypher/types/ServerResult";
import { useGraph } from "~/lib/graph/graph";
import { createMeta } from "~/lib/graph/mutate/form/createMeta";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export function SchemaRenderer(props: {
  form: IFormMetaData;
  formDataId?: string;
  getFormData?: () => Promise<ServerResult>;
  txnId?: string;
}) {
  const [graph, setGraph] = useGraph();
  const metaTxnId = generateNewTxnId(graph, setGraph);

  const formMeta = createMeta(props.form, metaTxnId, graph, setGraph);

  return (
    <PageViewWrapper
      dontConfirmExit={true}
      formDataId={props.formDataId}
      formMetaId={formMeta.vertex?.id}
      getFormData={props.getFormData}
      hideSaveCancelButton={true}
      isNoPermissionCheck={true}
      metaTxnId={metaTxnId}
      pageVertexName="SchemaRenderer"
      txnId={props.txnId}
    />
  );
}
