import { Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import { isNegative } from "~/lib/data_structure/number/isNegative";
import { useGraph } from "~/lib/graph/GraphContext";
import { headerIconButtonCss } from "~/pages/settings/constants";

export function ShareButton(props: { formStoreId: string }) {
  const [graph] = useGraph();

  const formStoreVertex = () =>
    graph.vertexes[props.formStoreId!] as Vertex<FormStoreObject>;

  const isSaved = () => {
    if (!formStoreVertex()) {
      return false;
    }

    const formStoreVertexObj = formStoreVertex();
    if (!formStoreVertexObj?.P?.formDataId) {
      return false;
    }

    const formDataVertex = graph.vertexes[formStoreVertexObj.P.formDataId];
    if (!formDataVertex) {
      return false;
    }

    return !isNegative(formDataVertex.id) && formDataVertex.P?.key;
  };

  const getLink = () => {
    if (!formStoreVertex()) {
      return "";
    }

    const formStoreVertexObj = formStoreVertex();
    if (!formStoreVertexObj?.P?.formDataId) {
      return "";
    }

    const formDataVertex = graph.vertexes[formStoreVertexObj.P.formDataId];
    if (!(formDataVertex?.L && formDataVertex.P?.key)) {
      return "";
    }

    const { hostname, port, protocol } = window.location;
    const formattedPort = port ? `:${port}` : "";

    return `${protocol}//${hostname}${formattedPort}/view/${formDataVertex.L[0]}/${formDataVertex.P.key}/new`;
  };

  return (
    <Show when={isSaved()}>
      <IconButton
        css={headerIconButtonCss}
        href={getLink()}
        icon="ph:arrow-square-out"
        target="_blank"
        title={<>Open in new tab</>}
        tooltipGroup="page-buttons"
      />
    </Show>
  );
}
