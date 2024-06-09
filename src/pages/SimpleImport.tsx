// TODO make default component property applied to
import {GraphContext, IdAttr, type Vertex} from "~/lib/graph/graph";
import {useContext} from "solid-js";
import {WsContext} from "~/lib/websocket/ws_events_dispatcher";
import {createStore, type Store} from "solid-js/store";

import {SelectInputField} from "~/components/fields/SelectInputField";
import {onDataDirectoryImportClick, updateImportRecord,} from "~/lib/graph/mutate/import";
import {DynamicForm} from "~/components/form/DynamicForm";
import {GenericField} from "~/components/fields/GenericField";
import type {IFormContext} from "~/lib/contexts";

export function SimpleImport(props: {}) {
  const { Ws } = useContext(WsContext);
  const config = createStore({} as { formData: Store<IFormContext> });
  const [graph, setGraph] = useContext(GraphContext)!;
  return (
    <>
      <SelectInputField
        component={"SelectBox"}
        data={{ P: {} } as Vertex}
        meta={
          {
            P: {
              [IdAttr]: "import",
            
                stringValue: true,
                items: `dataType
component
dataTypeDefault
lookup
attribute
user
role
perm`,
              
            },
          } as unknown as Vertex
        }
        // @ts-ignore
        setValue={(attr, vertex, data) =>
          updateImportRecord(
            graph,
            setGraph,
            config[0].formData.txnId,
            data,
            config[0].formData.formData,
            false,
            Ws,
          )
        }
      />
      <DynamicForm
        id={"new"}
        formId={"Import"}
        graph={graph}
        setGraph={setGraph}
      />

      <GenericField
        meta={
          {
            P: {
              component: "Button",
              [IdAttr]: "meta",
           
                children: "Import",
                onClick: () =>
                  onDataDirectoryImportClick(
                    config[0].formData.formData,
                    Ws,
                    graph,
                    setGraph,
                  ),
              
            },
          } as unknown as Vertex
        }
      />
    </>
  );
} // group of the fields

