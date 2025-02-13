import { createSignal, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";

import { VariantsModal } from "../../../variants/VariantsModal";

export function DisplayAllVariants() {
  const [showVariantSettings, setShowVariantSettings] = createSignal(false);
  const onDisplayAllVariants = () => {
    setShowVariantSettings(true);
  };
  return (
    <>
      <button
        class="bg:primary color:base-5 mb:2 p:2 r:5"
        onClick={onDisplayAllVariants}
      >
        All Variants
      </button>
      <Show when={showVariantSettings()}>
        <ZIndex>
          <VariantsModal
            closeModal={() => setShowVariantSettings(false)}
            onSubmit={() => setShowVariantSettings(false)}
          />
        </ZIndex>
      </Show>
    </>
  );
}
