import {createContext, useContext} from "solid-js";
import type { createStore } from "solid-js/store";
import type { IFormContext } from "~/lib/contexts";
import { Id } from "~/lib/graph/graph";

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
    formData: {} as IFormContext,
    labelPosition: "top", // Default position
    labelColor: "black", // Default label color
    inputBackground: "white",
    activeStepId: 0 as Id | number,
    prevTxnIds: [] as Array<Id | number>
  });
}

type PageLayoutObject = ReturnType<typeof getInitialDesignerLayoutStore>;
type PageLayoutStore = ReturnType<typeof createStore<PageLayoutObject>>
export const DesignerLayoutStoreContext = createContext<PageLayoutStore>();

export function useDesignerLayoutStore() {
  return useContext(DesignerLayoutStoreContext)!;
}