import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
  useContext,
} from "solid-js";

import { IconButton } from "~/components/styled/IconButton";

import type {
  CSSJSONSchemaSearchType,
  GenericField,
} from "../constants/FieldSchemaType";

import { DynamicCSSComponent } from "../components/DynamicCssComponent";
import { useCssEditor } from "../context/CssEditorContext";
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
  const [cssState] = useCssEditor();
  const showConfiguredOnly = useContext(ShowConfiguredOnlyContext);

  // Check if section has any configured fields
  const hasConfiguredFields = createMemo(() => {
    if (!showConfiguredOnly()) return true;
    
    const currentState = cssState[state()] || {};
    
    // Check all properties in this section
    for (const [, field] of Object.entries(props.propertyFieldMap)) {
      // Check main field
      if (currentState[field.key || ''] !== undefined) {
        return true;
      }
      
      // Check custom properties for fieldWithCustomProperty components
      if (field.componentName === 'fieldWithCustomProperty' && field.customProperty) {
        for (const customProp of field.customProperty) {
          if (currentState[customProp.key] !== undefined) {
            return true;
          }
        }
      }
    }
    
    return false;
  });

  // Sync with setAllOpen signal
  createEffect(() => {
    if (props.setAllOpen() !== null) {
      setIsOpen(props.setAllOpen()!);
    }
  });

  return (
    <Show when={hasConfiguredFields()}>
      <div
        class="b:1px|solid|lightgray p:5|10 w:full"
        classList={{
          "r:0|0|5|5": props.index === props.sectionCount() - 1,
          "r:5": props.index === 0 && props.sectionCount() === 1,
          "r:5|5|0|0": props.index === 0 && props.sectionCount() > 1,
        }}
      >
        <IconButton
          class="w:full"
          icon="ph:caret-up"
          iconClass={`cursor:pointer transform:${isOpen() ? "rotate(180deg)" : "rotate(90deg)"} transition:transform|0.2s|linear`}
          onClick={() => setIsOpen(!isOpen())}
          type="button"
        >
          <span class="f:15 font-weight:600">{props.title}</span>
        </IconButton>
        <Show when={isOpen()}>
          <hr class="color:#e1e1e1 m:2" />
          <For each={Object.entries(props.propertyFieldMap)}>
            {([, value]) => (
              <DynamicCSSComponent meta={value} projections={[state() || ""]} />
            )}
          </For>
        </Show>
      </div>
    </Show>
  );
};

export const SectionList = (
  props: Readonly<{
    filteredSections: () => CSSJSONSchemaSearchType;
    searchQuery: string;
  }>,
) => {
  const sectionCount = createMemo(
    () => Object.keys(props.filteredSections()).length,
  );
  const [setAllOpen, setSetAllOpen] = createSignal<boolean | null>(null);
  const [showConfiguredOnly, setShowConfiguredOnly] = createSignal(false);

  const collapseAll = () => setSetAllOpen(false);
  const expandAll = () => setSetAllOpen(true);
  const toggleConfigured = () => setShowConfiguredOnly((prev) => !prev);

  // Add effect to auto-expand sections when showing configured fields only
  createEffect(() => {
    if (showConfiguredOnly()) {
      // When toggling to "configured only", expand all sections
      setSetAllOpen(true);
    }
  });

  createEffect(() => {
    if (props.searchQuery) {
      setSetAllOpen(true);
    }
  });

  return (
    <ShowConfiguredOnlyContext.Provider value={showConfiguredOnly}>
      <div class="flex jc:end mb:2 w:100%">
        <IconButton
          icon={showConfiguredOnly() ? "ph:eye-slash" : "ph:eye"}
          iconClass="transition:transform|0.2s|linear"
          onClick={toggleConfigured}
          size={25}
          title={
            showConfiguredOnly()
              ? "Show all fields"
              : "Show configured fields only"
          }
        />
        <IconButton
          class="ml:2"
          icon="ph:arrows-in"
          iconClass="transition:transform|0.2s|linear"
          onClick={collapseAll}
          size={25}
          title="Collapse all"
        />
        <IconButton
          class="ml:2"
          icon="ph:arrows-out"
          iconClass="transition:transform|0.2s|linear"
          onClick={expandAll}
          size={25}
          title="Expand all"
        />
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
