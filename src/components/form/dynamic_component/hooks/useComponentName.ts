import { createEffect, type Accessor } from "solid-js";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { DynamicPropsType } from "~/components/form/dynamic_component/functions/DynamicPropsType";

export function useComponentName(options: {
  props: {
    componentName?: string;
  };
  componentName: Accessor<string>;
  setComponentName: (value: string) => void;
  graph: GraphInterface;
  dynamicProps: () => DynamicPropsType;
  meta: Vertex;
}): void {
  const getInitialComponentName = () => {
    if (options.props.componentName) {
      return options.props.componentName;
    }
    const { componentName: metaComponentName } = options.meta.P;
    if (metaComponentName) {
      return metaComponentName;
    }
    return "Html"; // Default fallback
  };
  // Set initial value on first run
  options.setComponentName(getInitialComponentName());

  createEffect(() => {
    if (options.dynamicProps().componentName) {
      options.setComponentName(options.dynamicProps().componentName!);
      return;
    } else {
      options.setComponentName(getInitialComponentName());
    }
  });
}
