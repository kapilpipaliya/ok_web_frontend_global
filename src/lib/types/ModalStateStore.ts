import type { createStore } from "solid-js";

export type ModalStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
    showModal: boolean;
  }>
>;
