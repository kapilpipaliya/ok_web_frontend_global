import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";

import { DisplayAllVariants } from "./DisplayAllVariants";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function VariantsHeader() {
  return (
    <>
      <HeaderWithDescription description="Define the variants." title="" />

      <As
        as="div"
        css={css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
`}
      >
        {/* We dont allow configuring a single variant, because we have many properties to edit with variant name, we need a saprate modal for it */}
        {/* <AddNewVariantButton /> */}
        <DisplayAllVariants />
      </As>
    </>
  );
}
