import { toTitle } from "case-switcher-js";
import { createEffect, createSignal } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import { DIMENSIONS } from "~/components/styled/ResizableDivView";
import { useGraph } from "~/lib/graph/GraphContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

type DimensionType = {
  height: string;
  view: string;
  width: string;
};

export const ResizeViewButtons = (props: {
  formStoreId: string;
  openIndex: number;
}) => {
  const [graph, setGraph] = useGraph();
  const [isLandscape, setIsLandscape] = createSignal(true);

  const formStoreVertex = () =>
    graph.vertexes[props.formStoreId!] as Vertex<FormStoreObject>;
  const openedView = () => formStoreVertex()?.P.openedViews[props.openIndex];
  const viewVertex = () =>
    graph.vertexes[openedView()] as Vertex<{
      height: string;
      view: string;
      width: string;
    }>;

  // Extract number from dimension string like "100px"
  const extractNumber = (value: string): number =>
    Number.parseInt(value.match(/(\d+)/)?.[0] || "0", 10);

  // Determine if dimensions represent landscape orientation
  const isDimensionsLandscape = (width: string, height: string): boolean =>
    extractNumber(width) >= extractNumber(height);

  // Update dimensions and set orientation
  const updateDimensions = (dimensions: Partial<DimensionType>) => {
    mergeVertexProperties(0, openedView(), graph, setGraph, dimensions);

    // Update orientation if both width and height are provided
    if (dimensions.width && dimensions.height) {
      setIsLandscape(
        isDimensionsLandscape(dimensions.width, dimensions.height),
      );
    }
  };

  // Initialize dimensions if not set
  createEffect(() => {
    const view = viewVertex();
    if (view?.P.width && view?.P.height) {
      // Determine initial orientation
      setIsLandscape(isDimensionsLandscape(view.P.width, view.P.height));
    } else {
      const defaultDimension = DIMENSIONS.desktop;
      updateDimensions({
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
    updateDimensions({
      height: dimension.height,
      view: dimension.id,
      width: dimension.width,
    });
  };

  const handleDimensionChange = (
    dimension: "height" | "width",
    value: string,
  ) => {
    updateDimensions({
      [dimension]: value,
      view: "custom",
    });
  };

  const handleKeyDown = (
    e: KeyboardEvent,
    dimension: "height" | "width",
    currentValue: string,
  ) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();

      const numericMatch = currentValue.match(/(\d+)/);
      if (numericMatch) {
        const numericPart = Number.parseInt(numericMatch[0], 10);
        const prefix = currentValue.substring(0, numericMatch.index);
        const suffix = currentValue.substring(
          numericMatch.index! + numericMatch[0].length,
        );

        const newNumericValue =
          e.key === "ArrowUp" ? numericPart + 1 : numericPart - 1;
        const newValue = `${prefix}${newNumericValue}${suffix}`;

        handleDimensionChange(dimension, newValue);
      }
    }
  };

  const toggleOrientation = () => {
    const view = viewVertex();
    if (view?.P.width && view?.P.height) {
      // Swap width and height
      updateDimensions({
        height: view.P.width,
        view: "custom",
        width: view.P.height,
      });

      setIsLandscape(!isLandscape());
    }
  };

  const commonInputClass =
    "b:1px|solid|primary-10 r:5 p:0.15rem w:4.5rem bg:base-0";

  return (
    <div class="flex gap:0.5rem ai:center text-size:0.8rem">
      <select
        class="b:1px|solid|primary-10 r:5 p:0.25rem bg:base-0 color:base-100"
        onChange={(e) => handleDimensionSelect(e.target.value)}
        title="Select size"
        value={viewVertex()?.P.view?.toLowerCase()}
      >
        {Object.entries(DIMENSIONS).map(([key, value]) => (
          <option value={key}>{toTitle(value.id)}</option>
        ))}
        <option value="custom">Custom</option>
      </select>

      <div class="flex gap:0.25rem ai:center">
        <input
          class={commonInputClass}
          onChange={(e) => handleDimensionChange("width", e.target.value)}
          onKeyDown={(e) =>
            handleKeyDown(e, "width", viewVertex()?.P.width || "")
          }
          title="Width"
          type="text"
          value={viewVertex()?.P.width || ""}
        />
        <span class="flex ai:center">×</span>
        <input
          class={commonInputClass}
          onChange={(e) => handleDimensionChange("height", e.target.value)}
          onKeyDown={(e) =>
            handleKeyDown(e, "height", viewVertex()?.P.height || "")
          }
          title="Height"
          type="text"
          value={viewVertex()?.P.height || ""}
        />
      </div>

      <IconButton
        class="b:1px|solid|primary-10 r:5 p:0.25rem bg:base-0"
        icon="ph:device-mobile-speaker"
        iconClass={`transition:transform|0.2s ${isLandscape() ? "transform:rotate(90deg)" : ""}`}
        onClick={toggleOrientation}
        size={18}
        title={isLandscape() ? "Switch to Portrait" : "Switch to Landscape"}
      />
    </div>
  );
};
