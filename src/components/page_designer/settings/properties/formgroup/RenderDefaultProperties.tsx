import { createMemo, For, Match, Switch } from "solid-js";

import type { GenericField } from "~/components/css_properties/constants/FieldSchemaType";

import { PROPERTIES } from "~/components/constants/constant";
import { DynamicCSSComponent } from "~/components/css_properties/components/DynamicCssComponent";
import {
  CssEditorContext,
  type CSSStore,
} from "~/components/css_properties/CssEditorContext";
import { DefaultComponentProperties } from "~/cypher/mutate/sync/component_properties";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../../LayoutContext";

type RenderDefaultPropertiesProps = {
  onChange: (meta: Vertex, data: unknown) => void;
};

interface DefaultProperty {
  componentName: string;
  default: string;
  description: string;
  key: string;
}

export function RenderDefaultProperties(
  props: Readonly<RenderDefaultPropertiesProps>,
) {
  const [graph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();

  const selectedComp = () => graph.vertexes[layoutStore.selectedComponent];
  const componentName = () => selectedComp().P.key;
  const componentProperties = () =>
    DefaultComponentProperties[componentName()] as DefaultProperty[];

  const selectedLayout = () => graph.vertexes[layoutStore.selectedId];

  const isSelectComponent = (componentName: string) =>
    typeof componentName === "string" &&
    componentName.includes("|") &&
    (componentName.startsWith("'") || componentName.startsWith('"'));

  return (
    <For
      each={componentProperties()?.filter((prop) => !prop.key.startsWith("on"))}
    >
      {(property) => {
        const ComponentName = () => {
          switch (property.componentName) {
            case "JSX.Element":
              return "string";
            case "string":
            case "'string | null'":
              return "string";
            case "boolean":
              return "boolean";
            case "number[]":
            case "string[]":
            case "string | string[]":
            case "string | string[] | null":
            case "T | Array<T>":
              return "array";
            case "'boolean | 'only''":
            case "'true' | string'":
            case "ComboboxTriggerMode":
              return "select";
            case "Placement":
              return "select";
            default: {
              if (property.componentName.startsWith("Array")) {
                return "array";
              }
              if (property.componentName.startsWith("keyof")) {
                return "string";
              }
              if (isSelectComponent(property.componentName)) {
                return "select";
              }
              return property.componentName;
            }
          }
        };
        const extraProperties = createMemo(() => {
          switch (property.componentName) {
            case "ComboboxTriggerMode":
              return {
                options: ["input", "focus", "manual"],
              };
            case "Placement":
              return {
                options: [
                  "top",
                  "top-start",
                  "top-end",
                  "bottom",
                  "bottom-start",
                  "bottom-end",
                  "left",
                  "left-start",
                  "left-end",
                  "right",
                  "right-start",
                  "right-end",
                ],
              };
            case "'boolean | 'only''":
            case "'true' | string'":
              return {
                options: property.componentName
                  .slice(1, -1)
                  .split(" | ")
                  .map((opt) => opt.replace(/'/g, "")),
              };
            default: {
              if (isSelectComponent(property.componentName)) {
                return {
                  options: property.componentName
                    .slice(1, -1)
                    .split(" | ")
                    .filter((opt) => !opt.includes("=>"))
                    .map((opt) => opt.replace(/['"]/g, "")),
                };
              }
              return {};
            }
          }
        });
        const _defaultCSSClass = createMemo(() => {
          switch (ComponentName()) {
            case "number":
            case "string":
              return PROPERTIES.Css.TextField;
            case "boolean":
              return PROPERTIES.Css.CheckBox;
            case "array":
            case "select":
              return "w:full mb:2";
            case "number":
              return "w:full mb:2 number-input";
            case "color":
              return "w:full mb:2 color-picker";
            case "date":
            case "datetime":
              return "w:full mb:2 date-input";
            default:
              return "w:full mb:2";
          }
        });
        return (
          <CssEditorContext.Provider
            value={[selectedLayout() as unknown as CSSStore, () => {}]}
          >
            <Switch>
              <Match
                when={
                  property.componentName === "children" ||
                  property.componentName === "() => void" ||
                  property.componentName.startsWith("Component") ||
                  property.key === "translations"
                }
              />

              <Match when={ComponentName()}>
                {/* <DynamicComponent
                  componentName={ComponentName()}
                  meta={{ P: { ...property, css: defaultCSSClass(), labelPosition: "left" } } as unknown as Vertex}
                  onChange={(data) => props.onChange({ P: property } as unknown as Vertex, data)}
                  {...extraProperties()}
                /> */}
                <DynamicCSSComponent
                  meta={
                    {
                      ...property,
                      componentName: ComponentName(),
                      label: property.key,
                      ...extraProperties(),
                    } as unknown as GenericField
                  }
                  onChange={(value: unknown) =>
                    props.onChange({ P: property } as unknown as Vertex, value)
                  }
                  projections={["P"]}
                />
              </Match>
              <Match when={true}>
                <div class="f:10">{`Component key ${property.componentName} not supported`}</div>
              </Match>
            </Switch>
          </CssEditorContext.Provider>
        );
      }}
    </For>
  );
}
