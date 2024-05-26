import { JSX, Show, createSignal } from "solid-js";

export function useExpansion(defaultValue = true) {
  const [expanded, setExpanded] = createSignal(defaultValue);
  const toggleExpansion = () => setExpanded(!expanded());
  return [expanded, toggleExpansion];
}
