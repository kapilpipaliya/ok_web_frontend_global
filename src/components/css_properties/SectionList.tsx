import { Icon } from "@iconify-icon/solid";
import { type Accessor, createEffect, createMemo, createSignal, For, Show } from "solid-js";

import type {
  CSSJSONSchemaSearchType,
  GenericField,
} from "./constants/FieldType";

import { DynamicCSSComponent } from "./components/DynamicCssComponent";

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
        class="flex ai:center cursor:pointer jc:space-between"
        onClick={() => setIsOpen(!isOpen())}
        type="button"
      >
        <Icon
          class={`cursor:pointer transform:${isOpen() ? "rotate(180deg)" : "rotate(90deg)"} transition:transform|0.2s|linear`}
          height={25}
          icon="uil:angle-up"
          width={25}
        />
        <span class="f:15 font-weight:600">{props.title}</span>
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

export const SectionList = (props: Readonly<{
  filteredSections: () => CSSJSONSchemaSearchType;
}>) => {
  const sectionCount = createMemo(
    () => Object.keys(props.filteredSections()).length,
  );
  const [setAllOpen, setSetAllOpen] = createSignal<boolean | null>(null);

  const collapseAll = () => setSetAllOpen(false);
  const expandAll = () => setSetAllOpen(true);

  return (
    <>
      <div class="flex jc:end mb:2 w:100%">
        <button class="btn" onClick={collapseAll} title="Collapse all">
          <Icon
            class={' transition:transform|0.2s|linear'}
            height={25}
            icon="mdi:collapse-all-outline"
            width={25}
          />
        </button>
        <button class="btn ml:2" onClick={expandAll} title="Expand all">
          <Icon
            class={' transition:transform|0.2s|linear'}
            height={25}
            icon="mdi:expand-all-outline"
            width={25}
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
    </>
  );
};
