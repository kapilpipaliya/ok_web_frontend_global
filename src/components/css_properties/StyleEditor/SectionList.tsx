import { Icon } from "@iconify-icon/solid";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
} from "solid-js";

import type {
  CSSJSONSchemaSearchType,
  GenericField,
} from "../constants/FieldSchemaType";

import { DynamicCSSComponent } from "../components/DynamicCssComponent";
import { useCssState } from "../context/CssStateContext";
import { ShowConfiguredOnlyContext } from "../context/ShowConfiguredOnlyContext";

export const CollapsibleSection = (
  props: Readonly<{
    index: number;
    isOpen: boolean;
    propertyFieldMap: { [key: string]: GenericField };
    sectionCount: Accessor<number>;
    setAllOpen: Accessor<boolean | null>;
    title: string;
  }>,
) => {
  // dont used createWritableMemo here, because props.isOpen is not a state.
  const [isOpen, setIsOpen] = createSignal(props.isOpen ?? true);
  const [state] = useCssState();

  // Sync with setAllOpen signal
  createEffect(() => {
    if (props.setAllOpen() !== null) {
      setIsOpen(props.setAllOpen()!);
    }
  });

  return (
    <div
      class="b:1px|solid|lightgray p:5|10 w:full"
      classList={{
        "r:0|0|5|5": props.index === props.sectionCount() - 1,
        "r:5": props.index === 0 && props.sectionCount() === 1,
        "r:5|5|0|0": props.index === 0 && props.sectionCount() > 1,
      }}
    >
      <button
        class="flex ai:center cursor:pointer w:full"
        onClick={() => setIsOpen(!isOpen())}
        type="button"
      >
        <Icon
          class={`cursor:pointer transform:${isOpen() ? "rotate(180deg)" : "rotate(90deg)"} transition:transform|0.2s|linear`}
          height={25}
          icon="ph:caret-up"
          width={25}
          noobserver
        />
        <span class="f:15 font-weight:600">{props.title}</span>
      </button>
      <Show when={isOpen()}>
        <hr class="color:#e1e1e1 m:2" />
        <For each={Object.entries(props.propertyFieldMap)}>
          {([, value]) => (
            <DynamicCSSComponent meta={value} projections={[state() || ""]} />
          )}
        </For>
      </Show>
    </div>
  );
};

export const SectionList = (
  props: Readonly<{
    filteredSections: () => CSSJSONSchemaSearchType;
  }>,
) => {
  const sectionCount = createMemo(
    () => Object.keys(props.filteredSections()).length,
  );
  const [setAllOpen, setSetAllOpen] = createSignal<boolean | null>(null);
  const [showConfiguredOnly, setShowConfiguredOnly] = createSignal(false);

  const collapseAll = () => setSetAllOpen(false);
  const expandAll = () => setSetAllOpen(true);
  const toggleConfigured = () => setShowConfiguredOnly(prev => !prev);

  return (
    <ShowConfiguredOnlyContext.Provider value={showConfiguredOnly}>
      <div class="flex jc:end mb:2 w:100%">
        <button 
          class="btn" 
          onClick={toggleConfigured} 
          title={showConfiguredOnly() ? "Show all fields" : "Show configured fields only"}
        >
          <Icon
            class="transition:transform|0.2s|linear"
            height={25}
            icon={showConfiguredOnly() ? "ph:eye-slash" : "ph:eye"}
            width={25}
            noobserver
          />
        </button>
        <button class="btn ml:2" onClick={collapseAll} title="Collapse all">
          <Icon
            class="transition:transform|0.2s|linear"
            height={25}
            icon="ph:arrows-in"
            width={25}
            noobserver
          />
        </button>
        <button class="btn ml:2" onClick={expandAll} title="Expand all">
          <Icon
            class="transition:transform|0.2s|linear"
            height={25}
            icon="ph:arrows-out"
            width={25}
            noobserver
          />
        </button>
      </div>
      <For each={Object.entries(props.filteredSections())} fallback={""}>
        {(section, index) => {
          const [sectionName, { isOpen, propertyFieldMap }] = section;
          return (
            <Show when={Object.keys(propertyFieldMap).length > 0}>
              <CollapsibleSection
                index={index()}
                isOpen={isOpen ?? true}
                propertyFieldMap={propertyFieldMap}
                sectionCount={sectionCount}
                setAllOpen={setAllOpen}
                title={sectionName}
              />
            </Show>
          );
        }}
      </For>
    </ShowConfiguredOnlyContext.Provider>
  );
};
