import {GraphInterface, Id, Vertex} from "~/lib/graph/graph";
import type {NavItem} from "~/components/page_designer/form_elements/getTreeData";
import {PageLayoutObject} from "~/components/page_designer/context/LayoutContext";
import {SetStoreFunction} from "solid-js/store";
import {mergeVertexProperties} from "~/lib/graph/mutate/vertex";
import {v7 as uuidv7} from "uuid";

export function openInNewInternalTab(
  layoutStoreId: Id,
  child: Vertex,
  layoutStore: () => PageLayoutObject,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  // Check if form with same label and dataId already exists
  const exists = layoutStore().openedFormIds.some(
    form => form.label === child.L[0] && form.dataId === child.id
  );

  if (!exists) {
    // Note: cloneProperties is false because we don't want to clone the properties of the form. It cause re-render of the form.
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId,
      graph,
      setGraph,
      {
        openedFormIds: [...layoutStore().openedFormIds, {
          formId: uuidv7(),
          label: child.L[0],
          dataId: child.id
        }]
      },
      {cloneProperties: false}
    );
  }
}