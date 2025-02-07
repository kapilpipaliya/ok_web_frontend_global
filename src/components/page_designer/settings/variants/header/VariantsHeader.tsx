import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";

import { DisplayAllVariants } from "./DisplayAllVariants";

export function VariantsHeader() {
  return (
    <>
      <HeaderWithDescription
        description="Define the variants."
        title=""
      />

      <div class="flex ai:center jc:space-between mt:10">
        {/* We dont allow configuring a single variant, because we have many properties to edit with variant name, we need a saprate modal for it */}
        {/* <AddNewVariantButton /> */}
        <DisplayAllVariants />
      </div>
    </>
  );
}
