import type { SetStoreFunction, Store } from "solid-js/store";

import { untrack } from "solid-js";

import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";

import { groupBy } from "~/lib/data_structure/object/groupBy";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { createForm } from "~/lib/graph/mutate/form/createForm";
import { createMeta } from "~/lib/graph/mutate/form/metaFunction";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { FormMetaDataAuth } from "~/lib/meta/formMetaDataAuth";

export function getInitialFormState(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  id: Id | undefined,
  txnId: number,
  label: string,
) {
  let dataVertex: Vertex | undefined;
  if (!id) {
    const createResult = createForm(graph, setGraph, txnId, label);

    dataVertex = createResult.vertex!;
  }
  const form = FormMetaData[label] || FormMetaDataAuth[label];

  // Load Form Meta and Data from API
  const metaVertexResult = untrack(() => createMeta(form, graph, setGraph));

  if (metaVertexResult.error) {
    return { error: "Meta Vertex Error" };
  }

  const groupByTabsAndGroupFn = () => {
    const mainAttributes =
      getSelectionOptions(graph, setGraph, "->MetaAttr", [
        metaVertexResult.vertex!,
      ]).vertexes || []; //.sort((a, b) => a.P.pos - b.P.pos);

    const groupByTabs = groupBy(
      mainAttributes,
      (item) => item.P.tab!,
    ) as unknown as {
      [tab: string]: Vertex[];
    };

    const groupByTabsAndGroup = {} as {
      [tab: string]: { [group: string]: Vertex[] };
    };

    for (const tab in groupByTabs) {
      groupByTabsAndGroup[tab] = groupBy(
        groupByTabs[tab],
        (item) => item.P.group!,
      ) as unknown as {
        [group: string]: Vertex[];
      };
    }
    return groupByTabsAndGroup;
  };

  const groupByTabsAndGroup = groupByTabsAndGroupFn();
  const tabs = Object.keys(groupByTabsAndGroup).filter((tab) => tab !== "main");

  return {
    dataVertex,
    groupByTabsAndGroup,
    metaVertexResult,
    tabs,
  };
}
