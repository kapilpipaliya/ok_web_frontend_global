import type { SetStoreFunction } from "solid-js/store";

// Base modal state type
export type ModalState = {
  isLoading: boolean;
  showModal: boolean;
};

// Store type for modal state, combining the state and its setter function
export type ModalStateStore = [ModalState, SetStoreFunction<ModalState>];
