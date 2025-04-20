import { createSignal, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";

import { VariantsModal } from "../../../variants/VariantsModal";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function DisplayAllVariants() {
  const [showVariantSettings, setShowVariantSettings] = createSignal(false);
  const onDisplayAllVariants = () => {
    setShowVariantSettings(true);
  };
  return (
    <>
      <As
        as="button"
        css={css`
  background-color: \${args.theme.var.color.primary};
  color: #1e293b;
  margin-bottom: 2px;
  padding: 2px;
  border-radius: 5px;
`}
        onClick={onDisplayAllVariants}
      >
        All Variants
      </As>
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
