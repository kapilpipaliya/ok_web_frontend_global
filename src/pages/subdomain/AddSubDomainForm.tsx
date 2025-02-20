import type { Component } from "solid-js";

import { v7 as uuidv7 } from "uuid";

import { useGraph } from "~/lib/graph/graph";
import { addNewVertex } from "~/lib/graph/mutate/vertex";

import { SchemaRenderer } from "../SchemaRenderer";
import { getSubDomainFormSchema } from "./functions/getSubDomainFormSchema";

interface Props {
  onSuccess: () => void;
}

export const AddSubDomainForm: Component<Props> = (props) => {
  const [graph, setGraph] = useGraph();
  const formDataId = `-${uuidv7()}`;

  // Initialize form data vertex
  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: ["SubDomain"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );

  const schema = getSubDomainFormSchema(props.onSuccess);
  return <SchemaRenderer form={schema} formDataId={formDataId} />;
};
