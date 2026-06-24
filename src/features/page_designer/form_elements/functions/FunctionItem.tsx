import { toTitle } from "case-switcher-js";
import { Icon } from "@iconify-icon/solid";

import { IconButton } from "~/components/styled/IconButton";

import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { openInNewInternalTab } from "../pages/functions/openInNewInternalTab";
import { baseItemStyle, buttonStyle } from "../common/ItemStyles";

import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

interface FunctionNavItem {
  id: string;
  key: string;
  P: Record<string, unknown>;
}

export function FunctionItem(props: { item: FunctionNavItem }) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    graph.vertexes[layoutStoreId]?.P as PageLayoutObject | undefined;

  const getVertex = (): Vertex => {
    const v = graph.vertexes[props.item.id];
    if (v) return v as Vertex;
    return {
      id: props.item.id,
      L: ["Function"],
      P: { ...props.item.P, key: props.item.key },
      IN: {},
      OUT: {},
    } as Vertex;
  };

  const handleOpenInNewTab = () => {
    if (!layoutStore()) return;
    openInNewInternalTab(layoutStoreId, getVertex(), graph, setGraph);
  };

  return (
    <As
      as="div"
      css={baseItemStyle}
      style={{ cursor: "pointer" }}
      onClick={handleOpenInNewTab}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpenInNewTab();
        }
      }}
    >
      <Icon icon="ph:function" height={20} width={20} />
      <As as="div" css={"return `._id { font-size: 14px; }`;"}>
        {toTitle(props.item.key)}
      </As>
      <As as="div" css={"return `._id { margin-left: auto; display: flex; }`;"}>
        <IconButton
          css={buttonStyle}
          icon="ph:arrow-square-out"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenInNewTab();
          }}
          size={18}
          title="Open in new tab"
        />
      </As>
    </As>
  );
}
