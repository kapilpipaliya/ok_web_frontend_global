import { Icon } from "@iconify-icon/solid";
import { For, Show, createMemo, createSignal } from "solid-js";

import { DynamicCSSComponent } from "~/components/css_properties/components/DynamicCssComponent";

import type { CSSJSONSchemaSearchType, GenericField } from "./constants/FieldType";

import { JSONSchema } from "./constants/CssPropertiesMap";

export const StyleEditorTab = () => {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filteredSections, setFilteredSections] = createSignal(filterSections(searchQuery()));
  const sectionCount = createMemo(() => Object.keys(filteredSections()).length);

  function filterSections(query: string) {
    return Object.entries(JSONSchema).reduce((acc, [sectionName, propertyFieldMap]) => {
      const filteredProperties = filterProperties(propertyFieldMap, query);
      if (Object.keys(filteredProperties).length > 0) {
        acc[sectionName] = { isOpen: !!query, propertyFieldMap: filteredProperties };
      }
      return acc;
    }, {} as CSSJSONSchemaSearchType);
  }

  function filterProperties(propertyFieldMap: { [key: string]: GenericField }, query: string) {
    return Object.fromEntries(
      Object.entries(propertyFieldMap)
        .filter(([_, field]) => shouldIncludeProperty(field, query))
    );
  }

  function shouldIncludeProperty(field: GenericField, query: string): boolean {
    if (field.label?.toLowerCase().includes(query.toLowerCase())) {
      return true;
    }
    if (field.component === "grid" && field.children?.length > 0) {
      const matchingChildren = field.children.filter((child: { label: string }) =>
        child.label?.toLowerCase().includes(query.toLowerCase())
      );
      if (matchingChildren.length > 0) {
        field.children = matchingChildren;
        return true;
      }
    }
    return false;
  }

  function handleSearch(value: string) {
    setSearchQuery(value);
    setFilteredSections(filterSections(value));
  }

  const CollapsibleSection = (props: Readonly<{
    index: number;
    isOpen: boolean;
    propertyFieldMap: { [key: string]: GenericField };
    title: string;
  }>) => {
    const [isOpen, setIsOpen] = createSignal(props.isOpen ?? false);

    return (
      <div
        class="b:1px|solid|lightgray p:5|10 w:full"
        classList={{
          "r:0|0|5|5": props.index === sectionCount() - 1,
          "r:5": props.index === 0 && sectionCount() === 1,
          "r:5|5|0|0": props.index === 0 && sectionCount() > 1,
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
          <For each={Object.entries(props.propertyFieldMap)}>
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
            value={searchQuery()}
          />
        </div>
      </nav>
      <For each={Object.entries(filteredSections())} fallback={""}>
        {(section, index) => {
          const [sectionName, { isOpen, propertyFieldMap }] = section;
          return (
            <Show when={Object.keys(propertyFieldMap).length > 0}>
              <CollapsibleSection
                index={index()}
                isOpen={isOpen}
                propertyFieldMap={propertyFieldMap}
                title={sectionName}
              />
            </Show>
          );
        }}
      </For>
    </span>
  );
};
