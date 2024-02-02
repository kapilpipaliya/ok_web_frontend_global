import { onMount } from 'solid-js';

export const useEffectOnce = (effect: () => void) => {
  onMount(effect);
};
