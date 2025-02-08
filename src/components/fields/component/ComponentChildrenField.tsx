import { useContext } from "solid-js";

import { ComponentChildrenContext } from "../contexts/ComponentChildrenContext";

export const ComponentChildrenField = () => {
  const children = useContext(ComponentChildrenContext);
  
  return <>{children}</>;
};

