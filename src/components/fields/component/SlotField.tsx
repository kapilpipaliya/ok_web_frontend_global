import { useContext } from "solid-js";

import { SlotContext } from "~/components/fields/component/contexts/SlotContext";

export const SlotField = () => {
  const children = useContext(SlotContext);

  return <>{children}</>;
};
