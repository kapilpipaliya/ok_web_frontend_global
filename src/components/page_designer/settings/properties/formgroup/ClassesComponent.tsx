import { createSignal, Show } from "solid-js";

import { CSSPropertiesEditorWrapper } from "~/components/css_properties/CSSPropertiesEditorWrapper";
import { genericInputComponents } from "~/components/form/functions/genericInputComponents";
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";
import { TabsWithUnderline } from "~/components/SimpleTabs";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import type { createVertexIds } from "./FormGroupProperties";

interface ClassesComponentProps {
  metaAttributes: Vertex[];
  selectedLayout: Vertex;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: (meta: Vertex, data: any) => void;
  txnId: number;
  vertexIds: ReturnType<typeof createVertexIds>;
}
export function ClassesComponent(props: Readonly<ClassesComponentProps>) {
  const [graph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  const componentName = graph.vertexes[layoutStore.selectedComponent].P.name;
  const isForm = layoutStore.formStore[0]?.formData.L[0] === "Form";
  const isFormField = isForm && genericInputComponents.includes(componentName);
  const classVertices = props.metaAttributes.filter((vertex) =>
    vertex.P.name.endsWith("Class"),
  );
  const metaClasses = [
    graph.vertexes[props.vertexIds.class],
    ...(isFormField ? [graph.vertexes[props.vertexIds.labelClass]] : []),
    ...classVertices,
  ];

  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const handleTabClick = (index: number) => setSelectedIndex(index);

  return (
    <>
      <TabsWithUnderline
        displayValueKey="::'P.displayName'||::'P.name'||::'P.id'||::'label'"
        onTabClick={handleTabClick}
        selectedIndex={selectedIndex()}
        tabs={metaClasses as unknown as { name: string }[]}
      />
      <Show keyed when={selectedIndex() + 1}>
        <CSSPropertiesEditorWrapper
          data={props.selectedLayout}
          meta={metaClasses[selectedIndex()]}
          setValue={(data) =>
            props.setValue(metaClasses[selectedIndex()], data)
          }
          txnId={props.txnId}
        />
      </Show>
    </>
  );
}
