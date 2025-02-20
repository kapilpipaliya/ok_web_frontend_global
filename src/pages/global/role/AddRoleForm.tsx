import type { Component } from "solid-js";

import { createStore } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";

import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { addNewVertex } from "~/lib/graph/mutate/vertex";

import { SchemaRenderer } from "../../SchemaRenderer";
import { getRoleFormSchema } from "./functions/formSchema";

interface Props {
  onSuccess: () => void;
}

export const AddRoleForm: Component<Props> = (props) => {
  const [graph, setGraph] = useGraph();
  const formDataId = `-${uuidv7()}`;

  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: ["Role"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );

  const schema = getRoleFormSchema(props.onSuccess);
  return <SchemaRenderer form={schema} formDataId={formDataId} />;
};
