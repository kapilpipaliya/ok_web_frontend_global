import { useNavigate } from "@solidjs/router";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import {
  type PageLayoutObject,
  useDesignerFormIdContext,
} from "../../context/LayoutContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { headerIconButtonClass } from "~/pages/constants/constant";

export const LeftIcons = () => {
  const navigate = useNavigate();
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const _layoutStore = () =>
    graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreId = useDesignerFormIdContext();
  const _formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <div class="flex ai:center">
      <IconButton
        class={`${headerIconButtonClass} ml:2`}
        icon="ph:house"
        onClick={() => navigate("/admin")}
        size={22}
        title="Home"
        tooltipGroup="left-buttons"
      />
    </div>
  );
};
