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
      isRealTime={false}
      meta={props.meta}
      noPermissionCheck={true}
      txnId={props.txnId} />
  );
}
