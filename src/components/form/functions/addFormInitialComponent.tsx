import type { SetStoreFunction } from "solid-js/store";

import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";

import { addComponentAttrInPage } from "~/features/page_designer/functions/drop/addComponentAttrInForm";

export function addComponent(
  graph: GraphInterface,
  formVertex: Vertex,
  parentId: Id,
  txnId: number,
  setGraph: SetStoreFunction<GraphInterface>,
  type: string,
  attributes: any = {},
) {
  const componentIndex = addComponentAttrInPage(
    formVertex,
    graph.vertexes[parentId],
    txnId,
    graph,
    setGraph,
    type,
    attributes,
  );

  return componentIndex;
}
export function addFormInitialComponent(
  formVertex: Vertex,
  graph: GraphInterface,
  txnId: number,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const layoutRowId = addComponent(
    graph,
    formVertex,
    formVertex.id,
    txnId,
    setGraph,
    "Box",
    { class: JSON.stringify({ "": { padding: "10px" } }) },
  );
  if (layoutRowId === -1) {
    return -1;
  }

  const formCompVertex = addComponent(
    graph,
    formVertex,
    layoutRowId,
    txnId,
    setGraph,
    "Form",
  );
  if (formCompVertex === -1) {
    return -1;
  }

  const boxCompIndex = addComponent(
    graph,
    formVertex,
    formCompVertex,
    txnId,
    setGraph,
    "Box",
    {
      class: JSON.stringify({
        "": {
          display: "flex",
          gap: "0.5rem",
          padding: "10px",
        },
      }),
    },
  );

  if (boxCompIndex === -1) {
    return -1;
  }

  const textBoxCompIndex = addComponent(
    graph,
    formVertex,
    boxCompIndex,
    txnId,
    setGraph,
    "TextInput",
    {
      class: JSON.stringify({
        "": {
          "border-radius": "6px",
          "border-style": "solid",
          "border-width": "1px",
          padding: "0.5rem",
        },
      }),
      label: "First Name",
    },
  );

  if (textBoxCompIndex === -1) {
    return -1;
  }

  const buttonsWrapperCompIndex = addComponent(
    graph,
    formVertex,
    formCompVertex,
    txnId,
    setGraph,
    "Box",
    {
      class: JSON.stringify({
        "": {
          display: "flex",
          gap: "0.5rem",
          padding: "10px",
        },
      }),
    },
  );

  if (buttonsWrapperCompIndex === -1) {
    return -1;
  }

  const submitButtonCompIndex = addComponent(
    graph,
    formVertex,
    buttonsWrapperCompIndex,
    txnId,
    setGraph,
    "Button",
    {
      text: "Submit",
      type: "submit",
    },
  );

  if (submitButtonCompIndex === -1) {
    return -1;
  }

  const cancelButtonCompIndex = addComponent(
    graph,
    formVertex,
    buttonsWrapperCompIndex,
    txnId,
    setGraph,
    "Button",
    {
      text: "Cancel",
      type: "cancel",
    },
  );
  if (cancelButtonCompIndex === -1) {
    return -1;
  }
}
