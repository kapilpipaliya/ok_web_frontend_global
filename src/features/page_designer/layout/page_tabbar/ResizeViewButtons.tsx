import { toTitle } from "case-switcher-js";
import { createEffect } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { DIMENSIONS } from "~/components/styled/ResizableDivView";
import { useGraph } from "~/lib/graph/GraphContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

export const ResizeViewButtons = (props: {
  formStoreId: string;
  openIndex: number;
}) => {
  const [graph, setGraph] = useGraph();

  const formStoreVertex = () =>
    graph.vertexes[props.formStoreId!] as Vertex<FormStoreObject>;
  const openedView = () => formStoreVertex()?.P.openedViews[props.openIndex];
  const viewVertex = () =>
    graph.vertexes[openedView()] as Vertex<{
      height: string;
      view: string;
      width: string;
    }>;

  // Initialize dimensions if not set
  createEffect(() => {
    const view = viewVertex();
    if (!(view?.P.width && view?.P.height)) {
      const defaultDimension = DIMENSIONS.desktop;
      mergeVertexProperties(0, openedView(), graph, setGraph, {
        height: defaultDimension.height,
        view: defaultDimension.id,
        width: defaultDimension.width,
      });
    }
  });

  const handleDimensionSelect = (selected: string) => {
    if (selected === "custom") {
      return;
    }
    const dimension = DIMENSIONS[selected as keyof typeof DIMENSIONS];
    mergeVertexProperties(0, openedView(), graph, setGraph, {
      height: dimension.height,
      view: dimension.id,
      width: dimension.width,
    });
  };

  const handleDimensionChange = (dimension: "height" | "width", value: string) => {
    mergeVertexProperties(0, openedView(), graph, setGraph, {
      [dimension]: value,
      view: "custom",
    });
  };

  const handleKeyDown = (e: KeyboardEvent, dimension: "height" | "width", currentValue: string) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      
      const numericMatch = currentValue.match(/(\d+)/);
      if (numericMatch) {
        const numericPart = parseInt(numericMatch[0], 10);
        const prefix = currentValue.substring(0, numericMatch.index);
        const suffix = currentValue.substring(numericMatch.index! + numericMatch[0].length);
        
        const newNumericValue = e.key === "ArrowUp" ? numericPart + 1 : numericPart - 1;
        const newValue = `${prefix}${newNumericValue}${suffix}`;
        
        handleDimensionChange(dimension, newValue);
      }
    }
  };

  return (
    <div class="flex gap:1rem ai:center">
      <select
        class="b:1px|solid|primary-10 r:5 p:0.5rem bg:base-0 color:base-100"
        onChange={(e) => handleDimensionSelect(e.target.value)}
        value={viewVertex()?.P.view?.toLowerCase()}
      >
        {Object.entries(DIMENSIONS).map(([key, value]) => (
          <option value={key}>{toTitle(value.id)}</option>
        ))}
        <option value="custom">Custom</option>
      </select>

      <div class="flex gap:0.5rem ai:center">
        <span class="flex ai:center">w:</span>
        <input
          class="b:1px|solid|primary-10 r:5 p:0.25rem w:5rem bg:base-0"
          onChange={(e) => handleDimensionChange("width", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "width", viewVertex()?.P.width || "")}
          type="text"
          value={viewVertex()?.P.width || ""}
        />
        <span class="flex ai:center">h:</span>
        <input
          class="b:1px|solid|primary-10 r:5 p:0.25rem w:5rem bg:base-0"
          onChange={(e) => handleDimensionChange("height", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "height", viewVertex()?.P.height || "")}
          type="text"
          value={viewVertex()?.P.height || ""}
        />
      </div>
    </div>
  );
};
