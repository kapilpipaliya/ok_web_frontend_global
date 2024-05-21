import {
  Tab,
  TabContainer,
  TabList,
  Tabs,
} from "~/components/solid-blocks/blocks";
import { Vertex } from "~/lib/graph/graph";
import { StyleCSSComponents } from "./StyleCSSComponents";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  on,
  Show,
} from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { CssEditorContext } from "./cssEditorContext";
import { DynamicCSSComponent } from "~/components/dynamic/components/DynamicCssComponent";
import { Icon } from "@iconify-icon/solid";
import JSONSchema from "./CssProperties";

export function ClassDesignTab(props: {
  component: string;
  meta: Vertex;
  title?: string;
  data?: Vertex; // temp vertex
  setValue?: (data: any) => void;
  disabled?: boolean;
  isRealTime?: boolean;
  txnId?: number;
}) {
  const { Container, ButtonGroups } = StyleCSSComponents();

  const [cssState, setCssState] = createStore({} as { [key: string]: any; });

  // note: 'props.data?.P[props.meta.P.name]' only change by Page Designer component when click on Layout item.
  const parseAndApplyCssRules = (valueString: string) => {
    const cssRules = {} as { [key: string]: string; };

    for (const [key, value] of valueString
      .split(/[\s\n]+/)
      .map((rule) => rule.split(":"))) {
      if (key === "") continue;
      cssRules[key] = value;
    }
    setCssState(reconcile(cssRules));
  };

  createEffect(
    on(
      () => (props.data?.P[props.meta.P.name] as string) ?? "",
      parseAndApplyCssRules
    )
  );

  function getCssValue() {
    return Object.entries(cssState)
      .map(([key, value]) => `${key}:${value}`)
      .join("\n");
  }

  createEffect(() => {
    props.setValue?.(getCssValue());
  });

  return (
    <CssEditorContext.Provider value={[cssState, setCssState]}>
      <tr class={"min-w:100% m:5px"}>
        <td colspan="2">
          <span class={"m:10|0"}>
            <Tabs style={{ padding: "10px" }}>
              <TabList class={"m:5px"}>
                <Tab class={"w:50%"}>Design</Tab>
                <Tab class={"w:50%"}>Code</Tab>
              </TabList>
              <TabContainer>
                <Container>
                  <StyleEditor />
                </Container>
              </TabContainer>
              <TabContainer>
                <Container>
                  <TextEditor getCssValue={getCssValue} parseAndApplyCssRules={parseAndApplyCssRules} />
                </Container>
              </TabContainer>
            </Tabs>
          </span>
        </td>
      </tr>
    </CssEditorContext.Provider>
  );
}

const TextEditor = (props: { getCssValue: any, parseAndApplyCssRules: (valueString: string) => void }) => {
  const [text, setText] = createSignal(props.getCssValue);
  createEffect(() => {
    setText(props.getCssValue);
  });

  const style = {
    color: "black",
    border: "1px solid #ccc",
    padding: "10px",
    margin: "5px",
    width: "100%",
    "min-height": "5rem",
    height: "20rem",
    "border-radius": "6px",
  };

  return (
    <textarea
      style={style}
      value={text()}
      onInput={(e) => {
        setText(e.target.value);
        props.parseAndApplyCssRules(e.target.value);
        // props.setValue?.(e.target.value);
      }}
      placeholder="Start typing..."
    />
  );
};

const StyleEditor = () => {
  const filterSections = (query: string) => {
    const filteredSections = Object.entries(JSONSchema)
      .map(([sectionName, properties]) => {
        const isOpen = !!query; // Set isOpen to true if there's a query
        const filteredProperties = Object.entries(properties)
          .map(([propertyName, property]: any) => {
            let includeProperty = false;
            if (
              property.label &&
              property.label.toLowerCase().includes(query.toLowerCase())
            ) {
              includeProperty = true;
            }
            if (
              property.component === "grid" &&
              property.children &&
              property.children.length > 0
            ) {
              const matchingChildren = property.children.filter(
                (child: { label: string }) =>
                  child.label &&
                  child.label.toLowerCase().includes(query.toLowerCase()),
              );
              if (matchingChildren.length > 0) {
                includeProperty = true;
                property = { ...property, children: matchingChildren };
              }
            }
            return includeProperty ? [propertyName, property] : null;
          })
          .filter(Boolean) // Remove null entries
          .reduce((acc, [propertyName, property]) => {
            acc[propertyName] = property;
            return acc;
          }, {});
        return {
          [sectionName]: { properties: filteredProperties, isOpen: isOpen },
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

  const CollapsibleSection = (props: {
    index: any;
    title: any;
    properties: any;
    isOpen: boolean;
  }) => {
    const [isOpen, setIsOpen] = createSignal(props.isOpen ?? false);

    return (
      <div
        class={`p:5|10 w:full b:1px|solid|lightgray ${props.index === 0 && length() === 1
          ? "r:5"
          : props.index === length() - 1
            ? "r:0|0|5|5"
            : props.index === 0 && length() > 1
              ? "r:5|5|0|0"
              : ""
          }

`}
      >
        <div
          onClick={() => setIsOpen(!isOpen())}
          class={"cursor:pointer flex ai:center jc:space-between"}
        >
          <span class={"f:15 font-weight:600"}>{props.title}</span>
          <Icon
            icon="uil:angle-up"
            height={25}
            width={25}
            class={"cursor:pointer transform 1s ease-in-out"}
            style={{
              transition: "transform 0.2s linear",
              transform: `${isOpen() ? "rotate(0deg)" : "rotate(180deg)"}`,
            }}
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
          "flex ai:start jc:space-between flex-direction:column w:full mb:10 mt:10"
        }
      >
        <nav class="bg:white 0px 0px 10px 10px w:full p:5|0">
          <div class="group">
            <Icon
              class="icon"
              icon="iconamoon:search"
              style={{ color: "#9e9ea7" }}
            />
            <input
              placeholder="Search Style..."
              type="search"
              class="inputSearch f:14"
              value={search()}
              onInput={(e) => {
                handleSearch(e.target.value);
              }}
            />
          </div>
        </nav>
        <For each={Object.entries(filteredSections())} fallback={""}>
          {(section, index) => {
            const [sectionName, { properties, isOpen }] = section;

            return (
              <Show when={Object.keys(properties).length > 0}>
                <CollapsibleSection
                  title={sectionName}
                  properties={properties}
                  index={index()}
                  isOpen={isOpen}
                />
              </Show>
            );
          }}
        </For>
      </span>
    </>
  );
};
