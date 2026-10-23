import type {  Accessor, JSX  } from "@solidjs/web";
import { LoopChildrenRenderer } from "~/components/form/dynamic_component/components/LoopChildrenRenderer";
import type { Vertex } from "~/lib/graph/type/vertex";

export function createLoopRowRenderer(options: {
  loopMeta: Vertex;
  data?: Vertex;
  isNoPermissionCheck: boolean;
  mapContextValue: (rowData: unknown, index: Accessor<number>) => unknown;
}): (rowData: unknown, index: Accessor<number>) => JSX.Element {
  return (rowData, index) => (
    <LoopChildrenRenderer
      loopMeta={options.loopMeta}
      data={options.data}
      contextValue={options.mapContextValue(rowData, index)}
      isNoPermissionCheck={options.isNoPermissionCheck}
    />
  );
}
