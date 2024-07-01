import { Icon } from "@iconify-icon/solid";
import { For, Show, createMemo, createSignal } from "solid-js";

import { DynamicCSSComponent } from "~/components/css_properties/components/DynamicCssComponent";

import { JSONSchema } from "./constants/CssPropertiesMap";

type Property = typeof JSONSchema[keyof typeof JSONSchema]

export const StyleEditorTab = () => {
  const [search, setSearch] = createSignal("");
  const [filteredSections, setFilteredSections] = createSignal<Record<string, Section>>(filterSections(search()));
  const length = createMemo(() => Object.keys(filteredSections()).length);

  function filterSections(query: string) {
    return Object.entries(JSONSchema)
      .map(([sectionName, properties]) => {
        const isOpen = !!query; // Set isOpen to true if there's a query
        const filteredProperties = filterProperties(properties, query);
        return { [sectionName]: { isOpen, properties: filteredProperties } };
      })
      .reduce((acc, section) => {
        const [sectionName, data] = Object.entries(section)[0];
        if (Object.entries(data.properties).length > 0) {
          // @ts-ignore
          acc[sectionName] = data;
        }
        return acc;
      }, {} as typeof JSONSchema);
  }

  function filterProperties(properties: Property, query: string) {
    return Object.entries(properties)
      .map(([propertyName, property]) => {
        if (shouldIncludeProperty(property, query)) {
          return [propertyName, property];
        }
        return null;
      })
      .filter(Boolean)
      .reduce((acc, [propertyName, property]) => {
        acc[propertyName] = property;
        return acc;
      }, {} as Property);
  }

  function shouldIncludeProperty(property: Property, query: string): boolean {
    if (property.label?.toLowerCase().includes(query.toLowerCase())) {
      return true;
    }
    if (property.component === "grid" && property.children?.length > 0) {
      const matchingChildren = property.children.filter((child: { label: string }) =>
        child.label?.toLowerCase().includes(query.toLowerCase())
      );
      if (matchingChildren.length > 0) {
        property.children = matchingChildren;
        return true;
      }
    }
    return false;
  }

  function handleSearch(value: string) {
    setSearch(value);
    setFilteredSections(filterSections(value));
  }

  const CollapsibleSection = (props: Readonly<{
    index: number;
    isOpen: boolean;
    properties: Property;
    title: string;
  }>) => {
    const [isOpen, setIsOpen] = createSignal(props.isOpen ?? false);

    return (
      <div
        class="b:1px|solid|lightgray p:5|10 w:full"
        classList={{
          "r:0|0|5|5": props.index === length() - 1,
          "r:5": props.index === 0 && length() === 1,
          "r:5|5|0|0": props.index === 0 && length() > 1,
        }}
      >
        <button
          class="flex ai:center cursor:pointer jc:space-between" 
          onClick={() => setIsOpen(!isOpen())}
          type="button"
        >
          <span class="f:15 font-weight:600">{props.title}</span>
          <Icon
            class="transform 1s ease-in-out cursor:pointer"
            height={25}
            icon="uil:angle-up"
            style={{
              transform: `${isOpen() ? "rotate(0deg)" : "rotate(180deg)"}`,
              transition: "transform 0.2s linear",
            }}
            width={25}
          />
        </button>
        <Show when={isOpen()}>
          <hr class="color:#e1e1e1 m:2" />
          <For each={Object.entries(props.properties)}>
            {([, value]) => <DynamicCSSComponent value={value} />}
          </For>
        </Show>
      </div>
    );
  };

  return (
    <span class="flex ai:start flex-direction:column jc:space-between mb:10 mt:10 w:full">
      <nav class="0px 0px 10px 10px bg:white p:5|0 w:full">
        <div class="group">
          <Icon class="icon" icon="iconamoon:search" style={{ color: "#9e9ea7" }} />
          <input
            class="inputSearch f:14"
            onInput={(e) => handleSearch(e.target.value)}
            placeholder="Search Style..."
            type="search"
            value={search()}
          />
        </div>
      </nav>
      <For each={Object.entries(filteredSections())} fallback={""}>
        {(section, index) => {
          const [sectionName, { isOpen, properties }] = section;
          return (
            <Show when={Object.keys(properties).length > 0}>
              <CollapsibleSection
                index={index()}
                isOpen={isOpen}
                properties={properties}
                title={sectionName}
              />
            </Show>
          );
        }}
      </For>
    </span>
  );
};
