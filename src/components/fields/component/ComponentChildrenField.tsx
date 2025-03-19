import { useContext } from "solid-js";

import { ComponentChildrenContext } from "~/components/fields/component/contexts/ComponentChildrenContext";

export const ComponentChildrenField = () => {
  const children = useContext(ComponentChildrenContext);

  return <>{children}</>;
};
