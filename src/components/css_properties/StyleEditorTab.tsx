import { Icon } from "@iconify-icon/solid";
import { For, Show, createMemo, createSignal } from "solid-js";

import { DynamicCSSComponent } from "~/components/css_properties/components/DynamicCssComponent";

import {JSONSchema} from "./CssPropertiesMap";

export const StyleEditorTab = () => {
  const filterSections = (query: string) => {
    const filteredSections = Object.entries(JSONSchema)
      .map(([sectionName, properties]) => {
        const isOpen = !!query; // Set isOpen to true if there's a query
        const filteredProperties = Object.entries(properties)
          .map(([propertyName, property]: any) => {
            let includeProperty = false;
            if (property.label?.toLowerCase().includes(query.toLowerCase())) {
              includeProperty = true;
            }
            if (
              property.component === "grid" &&
              property.children &&
              property.children.length > 0
            ) {
              const matchingChildren = property.children.filter(
                (child: { label: string }) =>
                  child.label?.toLowerCase().includes(query.toLowerCase()),
              );
              if (matchingChildren.length > 0) {
                includeProperty = true;
                property = { ...property, children: matchingChildren };
              }
            }
            return includeProperty ? [propertyName, property] : null;
          })
          .filter(Boolean) // Remove null entries
          .reduce((acc: any, [propertyName, property]: any) => {
            acc[propertyName] = property;
            return acc;
          }, {});
        return {
          [sectionName]: { isOpen: isOpen, properties: filteredProperties },
        };
      })
      .reduce((acc, section) => {
        const [sectionName, data] = Object.entries(section)[0];
        if (Object.entries(data.properties).length > 0) {
          acc[sectionName] = data;
        }
        return acc;
      }, {});

    return filteredSections;
  };

  const [search, setSearch] = createSignal("");
  const [filteredSections, setFilteredSections] = createSignal(
    filterSections(search()),
  );
  const length = createMemo(() => Object.keys(filteredSections()).length);

  const CollapsibleSection = (props: Readonly<{
    index: any;
    isOpen: boolean;
    properties: any;
    title: any;
  }>) => {
    const [isOpen, setIsOpen] = createSignal(props.isOpen ?? false);

    return (
      <div
        class={`${
          props.index === 0 && length() === 1
            ? "r:5"
            : props.index === length() - 1
              ? "r:0|0|5|5"
              : props.index === 0 && length() > 1
                ? "r:5|5|0|0"
                : ""
        } b:1px|solid|lightgray p:5|10 w:full
`}
      >
        <div
          class={"flex ai:center cursor:pointer jc:space-between"}
          onClick={() => setIsOpen(!isOpen())}
        >
          <span class={"f:15 font-weight:600"}>{props.title}</span>
          <Icon
            class={"transform 1s ease-in-out cursor:pointer"}
            height={25}
            icon="uil:angle-up"
            style={{
              transform: `${isOpen() ? "rotate(0deg)" : "rotate(180deg)"}`,
              transition: "transform 0.2s linear",
            }}
            width={25}
          />
        </div>
        <Show when={isOpen()}>
          <hr class={"color:#e1e1e1 m:2"} />
          <For each={Object.entries(props.properties)}>
            {([name, value]) => <DynamicCSSComponent value={value} />}
          </For>
        </Show>
      </div>
    );
  };

  // Function to handle search input
  const handleSearch = (value: string) => {
    setSearch(value);
    setFilteredSections(filterSections(value));
  };
  return (
    <>
      <span
        class={
          "flex ai:start flex-direction:column jc:space-between mb:10 mt:10 w:full"
        }
      >
        <nav class="0px 0px 10px 10px bg:white p:5|0 w:full">
          <div class="group">
            <Icon
              class="icon"
              icon="iconamoon:search"
              style={{ color: "#9e9ea7" }}
            />
            <input
              class="inputSearch f:14"
              onInput={(e) => {
                handleSearch(e.target.value);
              }}
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
    </>
  );
};
