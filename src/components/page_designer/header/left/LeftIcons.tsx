import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";

import logo from "~/assets/graphics/sidebarLogo.svg";
import { IconButton } from "~/components/styled/IconButton";
import { removeLastPathSegment } from "~/lib/url/removeLastPathSegment";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { PageLayoutObject, useDesignerFormIdContext } from "../../context/LayoutContext";

import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { LeftToggleButton } from "./LeftToggleButton";

export const LeftIcons = () => {
  const navigate = useNavigate();
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  
  const handleBackClick = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate(removeLastPathSegment());
    }
  };

  return (
    <div class="flex ai:center">
      <IconButton
        class="flex ai:center bg:rgb(255,253,253,.5) bg:rgb(232,229,229):hover cursor:pointer jc:center r:5|5|5|5"
        icon="flowbite:caret-left-outline"
        iconClass={"color:lightgrey color:black:hover"}
        onClick={handleBackClick}
        size={30}
        title="Back"
      />
      <a href="/admin">
        <img alt="logo" class="h:30px" src={logo} />
      </a>
    </div>
  );
};
