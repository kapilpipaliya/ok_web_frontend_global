import { createEffect, createResource, on, useContext } from "solid-js";

import TagBox, { Properties } from "devextreme/ui/tag_box";
import { commitTxn, getNewTxnId, graph } from "../../lib/graph";
import { selectedValue, setSelectionValue } from "./SelectInputField";
import { WsContext } from "../ws_events_dispatcher";
import { FormContext, onChangeHandler } from "../dynamicForm";
import {
 getOptionLabel,
 getSelectedVertexValue,
 getSelectionOptions
} from "../../lib/Traverse";
import { ComponentProps } from "../core/Form";

// TODO: Add support for multiple string values.
// TODO: Add support for inward values
export function TagField(props: Omit<ComponentProps, "setValue">) {
  const { Ws } = useContext(WsContext);
  let { local, isRealTime, formVertex, txnId } = useContext(FormContext);

  if (!props.meta.properties.props?.collection) {
    return "Collection Not Defined.";
  }

  const [selectOptions, { refetch }] = createResource(() => {
   if (props.disabled) {
    return selectedValue(props.meta, props.data).map(vertexId => graph.vertexes[vertexId]);
   }
    return getSelectionOptions(props.data, props.meta.properties.props.collection).vertexes || [];
  });

  return (
    <div aria-labeledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const selectedValue = getSelectedVertexValue(props.data, props.meta);

          const instance = new TagBox(el, {
            searchEnabled: true,
            disabled: props.disabled!,
            value: selectedValue,
            onValueChanged: function (e) {
             if (isRealTime) {
              txnId = getNewTxnId();
             }
              // batch(() => {
              //   if(e.event) isChangedByUser = true;
              setSelectionValue(txnId, props.data, props.meta, e.value);
              onChangeHandler(txnId, formVertex, props.data, props.meta);
              if (!local && isRealTime) commitTxn(txnId, Ws);
              // })
            },
            valueExpr: "id",
            displayExpr: (item) => getOptionLabel(item, props.meta.properties.props.displayExpr || "properties.id"),
            labelMode: "floating",
            onFocusIn: function (e) {
              refetch();
            },
          });
          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              if (property === "displayExpr") continue;
              instance.option(property, props.meta.properties.props[property]);
            }
          });
          createEffect(
            on(
              () => getSelectedVertexValue(props.data, props.meta),
              (selectedValue) => {
                instance.option("value", selectedValue);
              },
              { defer: true },
            ),
          );
         createEffect(() => instance.option("disabled", props.disabled));

         // when the value is changed by other components, we want to refetch the options
          // createEffect(on(() => props.rawValue, (v) => refetch(v)))
          createEffect(() => {
            if (selectOptions()) {
              instance.option("dataSource", selectOptions());
            }
          });
        }}
      />
      {/* Todo: think about validations */}
      {/*<Show when={props.page}>*/}
      {/*  <For each={Object.values(props.page!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>*/}
      {/*</Show>*/}
    </div>
  );
}
