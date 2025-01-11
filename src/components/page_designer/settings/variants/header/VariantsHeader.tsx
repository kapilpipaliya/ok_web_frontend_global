import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";

import { AddNewVariantButton } from "./AddNewVariantButton";
import { DisplayAllVariants } from "./DisplayAllVariants";

export function VariantsHeader() {
  return (
    <>
      <HeaderWithDescription
        description="Define the variants."
        title=""
      />

      <div class="flex ai:center jc:space-between mt:10">
        <AddNewVariantButton />
        <DisplayAllVariants />
      </div>
    </>
  );
}
