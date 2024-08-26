

import {
  For,
} from "solid-js";

import { DefaultComponentProperties } from "~/cypher/mutate/sync/component_properties";
import { useGraph, } from "~/lib/graph/graph";

import {
  useDesignerLayoutStore,
} from "../../../LayoutContext";


type RenderDefaultPropertiesProps = {}

interface DefaultProperty {
  default: string;
  description: string;
  property: string;
  type: string;
}


export function RenderDefaultProperties(_props: Readonly<RenderDefaultPropertiesProps>) {
  const [graph, _setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();

  const selectedComp = () => graph.vertexes[layoutStore.selectedComponent];
  const componentName = () => selectedComp().P.name;
  const componentProperties = () => DefaultComponentProperties[componentName()] as DefaultProperty[];

  return (
    <For each={componentProperties().filter(prop => !prop.property.startsWith('on'))}>
      {(property) => (
        <div>{property.property}</div>
      )}
    </For>
  );
}
