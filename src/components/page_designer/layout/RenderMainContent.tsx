import { type Setter, Show } from "solid-js";

import { Drawer } from "~/components/styled/Drawer";
import { FormContext } from "~/components/form/FormContext";
import { PageView } from "~/components/page_attr_render/PageView";
import { useDesignerLayoutStore } from "~/components/page_designer/context/LayoutContext";
import { ResizableContainer } from "~/components/styled/ResizableDivView";
import { ZIndex } from "~/components/fields/ZIndex";

import { FormElementsWrapper } from "../form_elements/FormElementsWrapper";
import { PropertiesWrapper } from "../settings/properties/PropertiesWrapper";
import { SettingsWrapper } from "../settings/SettingsWrapper";
import { DeleteAttributeDialog } from "./DeleteRuleDialog";
import { useGraph } from "~/lib/graph/graph";

function FormElements() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
    <Show
      fallback={
        <ZIndex>
          <Drawer
            customButton={() => false}
            drawerClass={"padding:10px"}
            open={() => layoutStore.isLeftOpen}
            setIsOpen={
              ((v: boolean) =>
                setLayoutStore("isLeftOpen", v)) as Setter<boolean>
            }
            width="75%"
          >
            <FormElementsWrapper />
          </Drawer>
        </ZIndex>
      }
      when={!layoutStore.isSmallScreen}
    >
      <Show when={layoutStore.isLeftOpen}>
        <FormElementsWrapper />
      </Show>
    </Show>
  );
}

function PageViewComponent() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
    <Show when={layoutStore.formStore[0]}>
      <ResizableContainer view={layoutStore.view}>
        <PageView
          isDesignMode={true}
          isNoPermissionCheck={true}
          metaVertex={layoutStore.formStore[0]?.formData}
        />
      </ResizableContainer>
    </Show>
  );
}

function Settings() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
    <Show
      fallback={
        <ZIndex>
          <Drawer
            customButton={() => false}
            drawerClass={"padding:10px"}
            open={() => layoutStore.isRightOpen}
            setIsOpen={
              ((isOpen: boolean) =>
                setLayoutStore("isRightOpen", isOpen)) as Setter<boolean>
            }
            width="75%"
          >
            <SettingsWrapper />
          </Drawer>
        </ZIndex>
      }
      when={!layoutStore.isSmallScreen}
    >
      <SettingsWrapper />
    </Show>
  );
}

function PropertiesContent() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph] = useGraph();
  return (<Show when={layoutStore.formStore[0] && layoutStore.selectedComponent !== -1 && graph.vertexes[layoutStore.selectedId]}>
    <FormContext.Provider value={layoutStore.formStore}>
      <PropertiesWrapper />
    </FormContext.Provider>
  </Show>)
}

function Properties() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
    <Show when={layoutStore.showPropertiesDrawer}>
      <ZIndex>
        <Drawer
          customButton={() => false}
          drawerClass={"padding:10px"}
          open={() => layoutStore.showPropertiesDrawer}
          setIsOpen={
            ((v: boolean) =>
              setLayoutStore("showPropertiesDrawer", v)) as Setter<boolean>
          }
        >
          <PropertiesContent />
        </Drawer>
      </ZIndex>
    </Show>
  );
}

function DeleteConfirmation() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
    <Show
      when={
        Object.keys(layoutStore.usedAttrsInRules).length > 0 ||
        layoutStore.usedAttrsInUniqueConstraints.length > 0 ||
        layoutStore.usedAttrsInNameKeys.length > 0 ||
        layoutStore.shouldContainAtLeastOneForm
      }
    >
      <ZIndex>
        <DeleteAttributeDialog />
      </ZIndex>
    </Show>
  );
}

export function RenderMainContent() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph] = useGraph();

  const getGridTemplateColumns = () => {
    const leftPanelWidth = "300px";
    const centerPanelWidth = "1fr";
    const settingsPanelWidth = "450px";
    const propertiesPanelWidth = "450px";

    if (!(layoutStore.isLeftOpen || layoutStore.isRightOpen)) {
      return `${centerPanelWidth}|${settingsPanelWidth}`;
    }
    if (layoutStore.isLeftOpen && layoutStore.isRightOpen) {
      return `${leftPanelWidth}|${centerPanelWidth}|${propertiesPanelWidth}|${settingsPanelWidth}`;
    }
    return `${layoutStore.isLeftOpen ? `${leftPanelWidth}|${centerPanelWidth}|${propertiesPanelWidth}` : `${centerPanelWidth}|${propertiesPanelWidth}|${settingsPanelWidth}`}`;
  };

  return (
    <div
      class={`grid gap:4px grid-template-columns:${getGridTemplateColumns()}`}
    >
      <FormElements  />
      <PageViewComponent />
      <Show when={(layoutStore.selectedId !== -1) && graph.vertexes[layoutStore.selectedId] && (layoutStore.selectedId)} fallback={<div class="pl:8 pt:8 bl:1|solid|lightgrey">Element is not selected</div>}>
        <div class={`bl:1|solid|lightgrey max-height:calc(100vh-${graph.navBarHeight + 2}px) overflow:auto scrollbar-color:lightgrey {scrollbar-width:thin} p:5`}>
          <PropertiesContent />
        </div>
      </Show>
      <Settings />
      <Properties />
      <DeleteConfirmation />
    </div>
  );
}
