import {
  createEffect,
  createResource,
  on,
  splitProps,
  useContext
} from "solid-js";

import TagBox, { Properties } from "devextreme/ui/tag_box";
import { Vertex } from "./Form";
import { commitTxn, getNewTxnId } from "../../lib/graph";
import {
  getSelectedVertexValue,
  getSelectionOptions,
  setSelectionValue
} from "./SelectInputField";
import { WsContext } from "../ws_events_dispatcher";
import { onChangeHandler } from "../core/dynamicForm";

export interface SelectInputFieldProps extends Properties {
  meta: Vertex
  vertex: Vertex;
  "aria-labeledby"?: string
}

export function TagField(props: SelectInputFieldProps) {
  const { Ws } = useContext(WsContext);

  const [p, customProps] = splitProps(props, ["vertex", "aria-labeledby"]);
  const [selectOptions, {refetch}] = createResource(() => {
    return getSelectionOptions(props.vertex, props.meta.properties.collection, "")
  });

  return (
    <div aria-labeledby={p["aria-labeledby"]}>
      <div ref={el => {
        const selectedValue = getSelectedVertexValue(props.vertex, props.meta.properties.id);

        const instance = new TagBox(el, {
          ...customProps,
          searchEnabled: true,
          value: selectedValue,
          onValueChanged: function(e) {
            const txnId = getNewTxnId();
            // batch(() => {
            //   if(e.event) isChangedByUser = true;
            setSelectionValue(txnId, props.vertex, props.meta,  e.value);
              onChangeHandler(txnId, props.vertex,  props.meta);
              commitTxn(txnId, Ws);
            // })
          },
          // required: props.meta.properties.required,
          disabled: props.meta.properties.disabled,
          valueExpr: "id",
          displayExpr: "properties.id",
          labelMode: 'floating',
          onFocusIn: function(e) {
            refetch()
          }
        });
        createEffect(() => {
          for(const property in p as Properties) {
            // @ts-ignore
            instance.option(property, p[property]);
          }
        })
        createEffect(on(()  => getSelectedVertexValue(props.vertex, props.meta.properties.id), selectedValue =>{
            instance.option('value', selectedValue)
        }, {defer: true}))
        // when the value is changed by other components, we want to refetch the options
        // createEffect(on(() => props.rawValue, (v) => refetch(v)))
        // createEffect(()=>instance.option('required', props.required))
        // createEffect(()=>instance.option('disabled', props.disabled))
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
