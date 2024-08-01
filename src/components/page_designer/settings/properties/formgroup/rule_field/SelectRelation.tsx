import type { Vertex } from "~/lib/graph/graph";

import { DynamicComponent } from "~/components/form/DynamicComponent";

export interface SelectRelationProps {
  data: Vertex;
  meta: Vertex;
  txnId: number;
}

export function SelectRelation(props: SelectRelationProps) {
  return (
    <DynamicComponent
      data={props.data}
      isNoPermissionCheck={true}
      isRealTime={false}
      meta={props.meta}
      txnId={props.txnId} />
  );
}
