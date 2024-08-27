

import {
  For,
  Match,
  Switch,
} from "solid-js";

import type { GenericField } from "~/components/css_properties/constants/FieldSchemaType";

import { DynamicCSSComponent } from "~/components/css_properties/components/DynamicCssComponent";
import { CssEditorContext, type CSSStore } from "~/components/css_properties/CssEditorContext";
import { DefaultComponentProperties } from "~/cypher/mutate/sync/component_properties";
import { useGraph, type Vertex, } from "~/lib/graph/graph";

import {
  useDesignerLayoutStore,
} from "../../../LayoutContext";


type RenderDefaultPropertiesProps = {
  onChange: (meta: Vertex, data: unknown) => void;
}

interface DefaultProperty {
  componentName: string;
  default: string;
  description: string;
  name: string;
}


export function RenderDefaultProperties(props: Readonly<RenderDefaultPropertiesProps>) {
  const [graph, _setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();

  const selectedComp = () => graph.vertexes[layoutStore.selectedComponent];
  const componentName = () => selectedComp().P.name;
  const componentProperties = () => DefaultComponentProperties[componentName()] as DefaultProperty[];

  const selectedLayout = () => graph.vertexes[layoutStore.selectedId];

  return (
    <For each={componentProperties()?.filter(prop => !prop.name.startsWith('on'))}>
      {(property) => (
        <CssEditorContext.Provider value={[selectedLayout() as unknown as CSSStore, () => { }]}>
          <Switch>
            <Match when={property.componentName === "string" || property.componentName === "'string | null'"}>
              <DynamicCSSComponent
                meta={{ ...property, label: property.name } as unknown as GenericField}
                onChange={(value: unknown) => props.onChange({ P: property } as unknown as Vertex, value)}
                projections={["P"]}
              />
            </Match>
            <Match when={property.componentName === "boolean"}>
              <DynamicCSSComponent
                meta={{ ...property, componentName: "string", label: property.name, type: "checkbox" } as unknown as GenericField}
                onChange={(value: unknown) => props.onChange({ P: property } as unknown as Vertex, value)}
                projections={["P"]}
              />
            </Match>
            <Match when={property.componentName === "number[]" || property.componentName === "string[]"}>
              <DynamicCSSComponent
                meta={{ ...property, componentName: "array", label: property.name } as unknown as GenericField}
                onChange={(value: unknown) => props.onChange({ P: property } as unknown as Vertex, value)}
                projections={["P"]}
              />
            </Match>
            <Match when={property.componentName === "'string | string[]'" || property.componentName === "'string | string[] | null'"}>
              <DynamicCSSComponent
                meta={{ 
                  ...property, 
                  componentName: "array", 
                  label: property.name, 
                } as unknown as GenericField}
                onChange={(value: unknown) => props.onChange({ P: property } as unknown as Vertex, value)}
                projections={["P"]}
              />
            </Match>
            <Match when={property.componentName === "'boolean | 'only''" || property.componentName === "'true' | string'"}>
              <DynamicCSSComponent
                meta={{ 
                  ...property, 
                  componentName: "select", 
                  label: property.name, 
                  options: property.componentName.slice(1, -1).split(" | ").map(opt => opt.replace(/'/g, ""))
                } as unknown as GenericField}
                onChange={(value: unknown) => props.onChange({ P: property } as unknown as Vertex, value)}
                projections={["P"]}
              />
            </Match>
            <Match when={property.componentName.includes("|") && property.componentName.startsWith("'") && property.componentName.endsWith("'")}>
              <DynamicCSSComponent
                meta={{ 
                  ...property, 
                  componentName: "select", 
                  label: property.name, 
                  options: property.componentName.slice(1, -1).split("' | '")
                } as unknown as GenericField}
                onChange={(value: unknown) => props.onChange({ P: property } as unknown as Vertex, value)}
                projections={["P"]}
              />
            </Match>
            <Match when={true}>
              <div>{`Component name ${property.componentName} not supported`}</div>
            </Match>
          </Switch>

        </CssEditorContext.Provider>
      )}
    </For>
  );
}
