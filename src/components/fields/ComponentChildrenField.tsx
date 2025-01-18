import { type Component, useContext } from "solid-js";

import type { GenericComponentProps } from "./FieldType";
import { ComponentChildrenContext } from "./contexts/ComponentChildrenContext";

interface ComponentChildrenFieldProps extends GenericComponentProps {}

export const ComponentChildrenField: Component<ComponentChildrenFieldProps> = (props) => {
  const children = useContext(ComponentChildrenContext);
  
  return <>{children}</>;
};

