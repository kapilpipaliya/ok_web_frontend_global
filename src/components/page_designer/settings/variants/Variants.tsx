import { VariantsHeader } from "./header/VariantsHeader";
import { VariantsList } from "./body/VariantsList";

export function Variants() {
  return (
    <div class="w-full">
      <VariantsHeader />
      <VariantsList />
    </div>
  );
}
