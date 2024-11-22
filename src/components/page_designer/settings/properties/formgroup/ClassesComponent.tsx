import { createMemo, createSignal, Show } from "solid-js";

import { CSSPropertiesEditorWrapper } from "~/components/css_properties/CSSEditor/CSSPropertiesEditorWrapper";
import { genericInputComponents } from "~/components/form/functions/genericInputComponents";
import { useDesignerLayoutStore } from "~/components/page_designer/context/LayoutContext";
import { TabsWithUnderline } from "~/components/styled/SimpleTabs";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import type { createVertexIds } from "./FormGroupProperties";

interface ClassesComponentProps {
  metaAttributes: Vertex[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (meta: Vertex, data: any) => void;
  selectedLayout: Vertex;
  txnId: number;
  vertexIds: ReturnType<typeof createVertexIds>;
}
export function ClassesComponent(props: Readonly<ClassesComponentProps>) {
  const [graph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();

  const getComponentName = () =>
    graph.vertexes[layoutStore.selectedComponent].P.key;
  const checkIsForm = () => layoutStore.formStore[0]?.formData.L[0] === "Form";
  const checkIsFormField = () =>
    checkIsForm() && genericInputComponents.includes(getComponentName());
  const getClassVertices = () =>
    props.metaAttributes.filter((vertex) => vertex.P.key.endsWith("Class"));

  const metaClasses = createMemo(() => [
    graph.vertexes[props.vertexIds.class],
    ...(checkIsFormField() ? [graph.vertexes[props.vertexIds.labelClass]] : []),
    ...getClassVertices(),
  ]);

  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const handleTabClick = (index: number) => setSelectedIndex(index);

  return (
    <>
      <TabsWithUnderline
        displayValueKey="::'P.displayName'||::'P.key'||::'P.id'||::'label'"
        onTabClick={handleTabClick}
        selectedIndex={selectedIndex()}
        tabs={metaClasses() as unknown as { key: string }[]}
      />
      <Show keyed when={selectedIndex() + 1}>
        <CSSPropertiesEditorWrapper
          data={props.selectedLayout}
          meta={metaClasses()[selectedIndex()]}
          onChange={(data) =>
            props.onChange(metaClasses()[selectedIndex()], data)
          }
        />
      </Show>
    </>
  );
}
