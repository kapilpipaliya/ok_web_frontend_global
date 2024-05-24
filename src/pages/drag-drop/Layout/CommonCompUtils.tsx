import { JSX, Show, createSignal } from "solid-js";

export function useExpansion(defaultValue = true) {
  const [expanded, setExpanded] = createSignal(defaultValue);
  const toggleExpansion = () => setExpanded(!expanded());
  return [expanded, toggleExpansion];
}

// TODO: Remove when we don't need it
export const Hide = (props: { when: boolean; fallback?: JSX.Element; children: JSX.Element }) => {
  return (
    <Show when={props.when} fallback={props.fallback ?? null}>
      {props.children}
    </Show>
  );
};