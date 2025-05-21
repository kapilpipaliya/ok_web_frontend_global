import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { createMemo } from "solid-js";
import { getComponentLabel } from "~/features/page_designer/functions/component/getComponentLabel";
import { ComponentField } from "~/components/fields/component/ComponentField";
import type { DynamicPropsType } from "~/components/form/dynamic_component/functions/DynamicPropsType";

/**
 * Creates a memo to determine the component name
 */
export function createComponentNameMemo(
  props: {
    componentName?: string;
    meta: Vertex;
  },
  options: {
    graph: GraphInterface;
    dynamicProps: () => DynamicPropsType;
  },
) {
  return createMemo(() => {
    try {
      if (options.dynamicProps().componentName) {
        return options.dynamicProps().componentName;
      }
      let componentLabel: string | undefined;
      if (props.componentName) {
        componentLabel = props.componentName;
        return componentLabel;
      }
      const { componentName } = props.meta.P;
      if (componentName) {
        componentLabel = componentName;
      }
      if (!componentLabel) {
        componentLabel = getComponentLabel(options.graph, props.meta);
      }
      if (!componentLabel) {
        return "Html";
      }
      if (typeof componentLabel === "string") {
        return componentLabel;
      }
      return componentLabel;
    } catch (error) {
      console.error("Error in componentName:", error);
      return ComponentField;
    }
  });
}
