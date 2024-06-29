import {createContext, useContext} from "solid-js";
import type { createStore } from "solid-js/store";

export function getInitialDesignerLayoutStore() {
  return ({
    view: "Tablet",
    selectedSection: "build",
    isSmallScreen: false,
    leftMenuTabs: [
      { title: "Components", collection: "Comp" },
      { title: "Pages", collection: "Page" },
      { title: "Templates", collection: "TemplatePage" },
      { title: "Forms", collection: "Form" },
      { title: "Thank You", collection: "ThankYouPage" },
      { title: "Error Pages", collection: "ErrorPages" },
      { title: "Email Template", collection: "EmailTemplate" }
    ],
    rightMenuTabs: ["layout", "form"].map((column) => ({
      id: column,
      name: column,
    })),
    isLeftOpen: true,
    isRightOpen: true,
  });
}

export type PageLayoutObject = ReturnType<typeof getInitialDesignerLayoutStore>;
export type PageLayoutStore = ReturnType<typeof createStore<PageLayoutObject>>
export const InitialLayoutStoreContext = createContext<PageLayoutStore>();

export function useStore() {
  return useContext(InitialLayoutStoreContext);
}