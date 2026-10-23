import { createSelector, createSignal, For, onSettled, Show } from "solid-js";

import { TreeItemContainer } from "~/features/page_designer/settings/layout/TreeItemContainer";
import { evalExpression } from "~/lib/expression_eval";

import { useFileManagerStore } from "../FileManagerContext";
import { FileManagerConfigIcons } from "./FileManagerConfigIcons";
import { FileManagerTreeItemContent } from "./FileManagerTreeItemContent";
import { getExpressionForFilesData, getFilesData } from "./getFilesData";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function FileManagerTreeItem(props: Readonly<{ item: Vertex }>) {
  const [children, setChildren] = createSignal<Vertex[]>([]);
  const [graph, setGraph] = useGraph();
  const [fileManagerStore, setFileManagerStore] = useFileManagerStore();

  const toggleExpand = async () => {
    const isExpanded = fileManagerStore.expandedKeys.includes(props.item.id);
    if (isExpanded) {
      setFileManagerStore((d) => { d.expandedKeys = ((keys) =>
        keys.filter((key) => key !== props.item.id))(d.expandedKeys); });
    } else {
      const newExpandedKeys = [...fileManagerStore.expandedKeys, props.item.id];
      if (!fileManagerStore.useLocalData) {
        setFileManagerStore((d) => { d.useLocalData = true; });
        // fetch children of children
        await getFilesData(
          graph,
          setGraph,
          fileManagerStore.toParentEdgeType,
          children().map((v) => v.id),
        );
      }
      setFileManagerStore((d) => { d.expandedKeys = newExpandedKeys; });
      await new Promise((resolve) => setTimeout(resolve, 300));
      setFileManagerStore((d) => { d.useLocalData = false; });
    }
  };

  const fetchRemoteChildrenItems = async () => {
    const data = await getFilesData(
      graph,
      setGraph,
      fileManagerStore.toParentEdgeType,
      props.item.id,
    );
    // @ts-expect-error ignore
    if (!data.error && data.result) {
      // @ts-expect-error ignore
      setChildren(data.result);
    }
  };

  const getChildrenItems = async () => {
    if (fileManagerStore.useLocalData) {
      const expression = getExpressionForFilesData(
        fileManagerStore.toParentEdgeType,
        props.item.id,
      );
      const children =
        evalExpression(expression, {
          graph,
          setGraph,
          vertexes: [props.item],
        }) || [];
      setChildren(children);
    } else {
      await fetchRemoteChildrenItems();
    }
  };

  onSettled(getChildrenItems);

  // const children = createMemo(() =>
  //   sortVertexesByPosition(evalExpression("<-ParentFolder", { graph, setGraph, vertexes: [props.item] }) || [])
  // );
  const isSelectedHoverId = createSelector(
    () => fileManagerStore.treeItemHoverId,
  );
  const handleMouseOver = (e: MouseEvent) => {
    e.stopPropagation();
    setFileManagerStore((d) => { d.treeItemHoverId = props.item.id; });
  };

  const handleMouseLeave = (e: MouseEvent) => {
    e.stopPropagation();
    setFileManagerStore((d) => { d.treeItemHoverId = null; });
  };
  return (
    <>
      <TreeItemContainer
        // draggable={true}
        hasChildren={!!children().length}
        isHovered={isSelectedHoverId(props.item.id)}
        onMouseEnter={handleMouseOver}
        onmouseleave={handleMouseLeave}
      >
        <FileManagerTreeItemContent
          hasChildren={!!children().length}
          item={props.item}
          toggleExpand={toggleExpand}
        />
        <FileManagerConfigIcons
          getChildrenItems={getChildrenItems}
          metaVertex={props.item}
        />
      </TreeItemContainer>
      <Show when={fileManagerStore.expandedKeys.includes(props.item.id)}>
        <As
          as="ul"
          css={[
            `return \`._id {
  padding-left: 8px;
  padding-top: 5px;
  list-style: none;
  padding: 0;
}\`;`,
          ]}
        >
          <For each={children()?.filter((item) => item.L[0] !== "File")}>
            {(child) => <FileManagerTreeItem item={child} />}
          </For>
        </As>
      </Show>
    </>
  );
}
