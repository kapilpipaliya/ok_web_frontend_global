import { createEffect, createResource, on, useContext } from "solid-js";

import TagBox, { Properties } from "devextreme/ui/tag_box";
import { ComponentProps } from "./Form";
import { commitTxn, getNewTxnId } from "../../lib/graph";
import {
  getOptionLabel,
  getSelectedVertexValue,
  getSelectionOptions,
  setSelectionValue
} from "./SelectInputField";
import { WsContext } from "../ws_events_dispatcher";
import { onChangeHandler } from "../core/dynamicForm";

export function TagField(props: Omit<ComponentProps, "setValue">) {
  const { Ws } = useContext(WsContext);


  if(!props.meta.properties.props?.collection) {
    return "Collection Not Defined."
  }

  const [selectOptions, {refetch}] = createResource(() => {
    return getSelectionOptions(props.data, props.meta.properties.props.collection, "")
  });

  return (
    <div aria-labeledby={props["aria-labeledby"]}>
      <div ref={el => {
        const selectedValue = getSelectedVertexValue(props.data, props.meta);

        const instance = new TagBox(el, {
          searchEnabled: true,
          value: selectedValue,
          onValueChanged: function(e) {
            const txnId = getNewTxnId();
            // batch(() => {
            //   if(e.event) isChangedByUser = true;
            setSelectionValue(txnId, props.data, props.meta,  e.value);
              onChangeHandler(txnId, props.data,  props.meta);
              commitTxn(txnId, Ws);
            // })
          },
          valueExpr: "id",
          displayExpr: item => getOptionLabel(item, props.meta.properties.props.displayExpr || "properties.id"),
          labelMode: 'floating',
          onFocusIn: function(e) {
            refetch()
          }
        });
        createEffect(() => {
          for (const property in props.meta.properties.props as Properties) {
            if(property === "displayExpr") continue;
            instance.option(property, props.meta.properties.props[property]);
          }
        });
        createEffect(on(() => getSelectedVertexValue(props.data, props.meta), selectedValue => {
          instance.option("value", selectedValue);
        }, { defer: true }));
        // when the value is changed by other components, we want to refetch the options
        // createEffect(on(() => props.rawValue, (v) => refetch(v)))
        createEffect(() => {
          if(selectOptions()) {
            instance.option('dataSource', selectOptions());
          }
        })
      }} />
      {/* Todo: think about validations */}
      {/*<Show when={props.page}>*/}
      {/*  <For each={Object.values(props.page!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>*/}
      {/*</Show>*/}
    </div>
  );
}
