import type { Component } from "solid-js";

import { v7 as uuidv7 } from "uuid";

import { useGraph } from "~/lib/graph/graph";
import { addNewVertex } from "~/lib/graph/mutate/vertex";

import { SchemaRenderer } from "../../SchemaRenderer";
import { getUserFormSchema } from "./userFormSchema";

interface Props {
  onSuccess: () => void;
}

export const AddUserForm: Component<Props> = (props) => {
  const [graph, setGraph] = useGraph();
  const formDataId = `-${uuidv7()}`;

  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: ["User"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );

  const formSchema = getUserFormSchema(props.onSuccess);

  return (
    <SchemaRenderer
      form={formSchema}
      formDataId={formDataId}
    />
  );
};
