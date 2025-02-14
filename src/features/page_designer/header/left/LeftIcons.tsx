import { useNavigate } from "@solidjs/router";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { removeLastPathSegment } from "~/lib/url/removeLastPathSegment";

import {
  type PageLayoutObject,
  useDesignerFormIdContext,
} from "../../context/LayoutContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";

export const LeftIcons = () => {
  const navigate = useNavigate();
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const _layoutStore = () =>
    graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreId = useDesignerFormIdContext();
  const _formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const handleBackClick = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate(removeLastPathSegment());
    }
  };

  return (
    <div class="flex ai:center">
      {/* <IconButton
        class="flex ai:center bg:rgb(255,253,253,.5) bg:rgb(232,229,229):hover cursor:pointer jc:center r:5|5|5|5"
        icon="ph:arrow-left"
        iconClass={"color:secondary color:black:hover"}
        onClick={handleBackClick}
        size={30}
        title="Back"
      /> */}
      <IconButton
        class="flex ai:center bg:rgb(255,253,253,.5) bg:rgb(232,229,229):hover cursor:pointer jc:center r:5|5|5|5"
        icon="ph:house"
        iconClass={"color:secondary color:black:hover"}
        onClick={() => navigate("/admin")}
        size={30}
        title="Home"
      />
    </div>
  );
};
