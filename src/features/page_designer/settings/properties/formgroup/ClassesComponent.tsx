import { createMemo, createSignal, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { TabsWithUnderline } from "~/components/styled/SimpleTabs";
import { CSSPropertiesEditorWrapper } from "~/features/css_editor/CSSEditor/CSSPropertiesEditorWrapper";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
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

  const formStoreId = useDesignerFormIdContext();
  const _formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  // const getComponentName = () =>
  //   graph.vertexes[formStoreVertex().P.selectedComponent]?.P.key;
  // const checkIsForm = () => graph.vertexes[formStoreVertex()?.P.formDataId!]?.L[0] === "Form";
  // const checkIsFormField = () =>
  //   checkIsForm() && genericInputComponents.includes(getComponentName());
  const getClassVertices = () =>
    props.metaAttributes.filter((vertex) => vertex.P.key.endsWith("Class")) ??
    [];

  const metaClasses = createMemo(() => [
    graph.vertexes[props.vertexIds.class],
    // ...(checkIsFormField() ? [graph.vertexes[props.vertexIds.labelClass]] : []),
    ...getClassVertices(),
  ]);

  const [selectedId, setSelectedId] = createSignal(metaClasses()[0]?.id || "");
  const handleTabClick = (id: string) => setSelectedId(id);

  return (
    <>
      <TabsWithUnderline
        displayValueKey="::'P.displayName'||::'P.key'||::'P.id'||::'label'"
        onTabClick={handleTabClick}
        selectedKey={selectedId()}
        tabs={metaClasses() as unknown as { id: string }[]}
      />
      <Show keyed when={selectedId()}>
        <CSSPropertiesEditorWrapper
          data={props.selectedLayout}
          meta={metaClasses().find((vertex) => vertex.id === selectedId())!}
          onChange={(data) =>
            props.onChange(
              metaClasses().find((vertex) => vertex.id === selectedId())!,
              data,
            )
          }
        />
      </Show>
    </>
  );
}
