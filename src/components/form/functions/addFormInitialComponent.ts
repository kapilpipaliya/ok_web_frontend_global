import type { SetStoreFunction } from "solid-js/store";

import type { Id, Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { addComponentAttrInPage } from "~/features/page_designer/functions/drag_drop/attributes/addComponentAttrInForm";
import { css } from "~/lib/styles";

// deprecated
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
    "Html",
    { as: "div", css: css`padding: 10px;` },
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

  const HtmlCompIndex = addComponent(
    graph,
    formVertex,
    formCompVertex,
    txnId,
    setGraph,
    "Html",
    {
      as: "div",
      css: css`
        display: flex;
        gap: 0.5rem;
        padding: 10px;
      `,
    },
  );

  if (HtmlCompIndex === -1) {
    return -1;
  }

  const textHtmlCompIndex = addComponent(
    graph,
    formVertex,
    HtmlCompIndex,
    txnId,
    setGraph,
    "TextInput",
    {
      css: css`
        border-radius: 6px;
        border-style: solid;
        border-width: 1px;
        padding: 0.5rem;
      `,
      label: "First Name",
    },
  );

  if (textHtmlCompIndex === -1) {
    return -1;
  }

  const buttonsWrapperCompIndex = addComponent(
    graph,
    formVertex,
    formCompVertex,
    txnId,
    setGraph,
    "Html",
    {
      as: "div",
      css: css`
        display: flex;
        gap: 0.5rem;
        padding: 10px;
      `,
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

function addComponent(
  graph: GraphInterface,
  formVertex: Vertex,
  parentId: Id,
  txnId: number,
  setGraph: SetStoreFunction<GraphInterface>,
  type: string,
  attributes: any = {},
  toVertex?: Vertex,
  position = "center",
) {
  const componentIndex = addComponentAttrInPage(
    formVertex,
    graph.vertexes[parentId],
    txnId,
    graph,
    setGraph,
    type,
    attributes,
    toVertex,
    position,
  );

  return componentIndex;
}
