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
import { css } from "~/lib/styles";
import { As } from "~/components/As";

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
    if (!showConfiguredOnly()) {
      return true;
    }

    const currentState = cssState[state()] || {};

    // Check all properties in this section
    for (const [, field] of Object.entries(props.propertyFieldMap)) {
      // Check main field
      if (currentState[field.key || ""] !== undefined) {
        return true;
      }

      // Check custom properties for fieldWithCustomProperty components
      if (
        field.componentName === "fieldWithCustomProperty" &&
        field.customProperty
      ) {
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
      <As as="div"
        css={css`
  border: 1px solid #3b82f6;
  padding: 5px 10px;
  width: 100%;
  border-radius: ${(() => {
    if (props.index === props.sectionCount() - 1) return "0 0 5px 5px";
    if (props.index === 0 && props.sectionCount() === 1) return "5px";
    if (props.index === 0 && props.sectionCount() > 1) return "5px 5px 0 0";
    return "0";
  })()};
`}
      >
        <IconButton
          css={css`
  width: 100%;
  background-color: transparent;
  border: none;
`}
          icon="ph:caret-up"
          iconCss={css`
  cursor: pointer;
  transform: ${isOpen() ? "rotate(180deg)" : "rotate(90deg)"};
  transition: transform 0.2s linear;
`}
          onClick={() => setIsOpen(!isOpen())}
          type="button"
        >
          <As as="span" css={css`
  font-size: 15px;
  font-weight: 600;
`}>{props.title}</As>
        </IconButton>
        <Show when={isOpen()}>
          <As as="hr" css={css`
  color: #e1e1e1;
  margin: 2px;
`} />
          <For each={Object.entries(props.propertyFieldMap)}>
            {([, value]) => (
              <DynamicCSSComponent meta={value} projections={[state() || ""]} />
            )}
          </For>
        </Show>
      </As>
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
      <As as="div" css={css`
  display: flex;
  justify-content: end;
  margin-bottom: 2px;
  width: 100%;
`}>
        <IconButton
          icon={showConfiguredOnly() ? "ph:eye-slash" : "ph:eye"}
          css={css`
            background-color: transparent;
            border: none;
          `}
          iconCss={css`transition: transform 0.2s linear;`}
          onClick={toggleConfigured}
          size={25}
          title={
            showConfiguredOnly()
              ? "Show all fields"
              : "Show configured fields only"
          }
        />
        <IconButton
          css={css`
            background-color: transparent;
            border: none;
            margin-left: 2px;
          `}
          icon="ph:arrows-in"
          iconCss={css`transition: transform 0.2s linear;`}
          onClick={collapseAll}
          size={25}
          title="Collapse all"
        />
        <IconButton
          css={css`
            background-color: transparent;
            border: none;
            margin-left: 2px;
          `}
          icon="ph:arrows-out"
          iconCss={css`transition: transform 0.2s linear;`}
          onClick={expandAll}
          size={25}
          title="Expand all"
        />
      </As>
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
