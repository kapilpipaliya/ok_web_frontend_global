import { createSignal, onCleanup, onMount } from "solid-js";

function detectTouchDevice(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(pointer: coarse)").matches ||
    navigator.maxTouchPoints > 0
  );
}

export function createIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = createSignal(false);

  onMount(() => {
    setIsTouchDevice(detectTouchDevice());

    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const update = () => setIsTouchDevice(detectTouchDevice());

    coarsePointerQuery.addEventListener("change", update);
    onCleanup(() => coarsePointerQuery.removeEventListener("change", update));
  });

  return isTouchDevice;
}
