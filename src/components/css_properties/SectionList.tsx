import { Icon } from "@iconify-icon/solid";
import { type Accessor, For, Show, createMemo, createSignal } from "solid-js";

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
    title: string;
  }>,
) => {
  const [isOpen, setIsOpen] = createSignal(props.isOpen ?? false);

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
        <span class="f:15 font-weight:600">{props.title}</span>
        <Icon
          class={`transform ${isOpen() ? "rotate:0deg" : "rotate:180deg"} cursor:pointer transition:transform|0.2s|linear`}
          height={25}
          icon="uil:angle-up"
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

export const SectionList = (props: {
  filteredSections: () => CSSJSONSchemaSearchType;
}) => {
  const sectionCount = createMemo(
    () => Object.keys(props.filteredSections()).length,
  );
  return (
    <For each={Object.entries(props.filteredSections())} fallback={""}>
      {(section, index) => {
        const [sectionName, { isOpen, propertyFieldMap }] = section;
        return (
          <Show when={Object.keys(propertyFieldMap).length > 0}>
            <CollapsibleSection
              index={index()}
              isOpen={isOpen}
              propertyFieldMap={propertyFieldMap}
              sectionCount={sectionCount}
              title={sectionName}
            />
          </Show>
        );
      }}
    </For>
  );
};
