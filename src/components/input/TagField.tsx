import {
 createEffect,
 createResource,
 on,
 untrack,
 useContext
} from "solid-js";

import TagBox, { Properties } from "devextreme/ui/tag_box";
import { commitTxn, getNewTxnId, graph, IdAttr, Vertex } from "../../lib/graph";
import {
 selectedValue,
 setParentValue,
 setSelectionValue
} from "./SelectInputField";
import { WsContext } from "../ws_events_dispatcher";
import { FormContext, onChangeHandler } from "../dynamicForm";
import {
 getOptionLabel,
 getParentVertexValue,
 getSelectedVertexValue,
 getSelectionOptions
} from "../../lib/Traverse";
import { ComponentProps } from "../core/Form";

// TODO: Add support for multiple string values.
// TODO: Add support for inward values
export function TagField(props: ComponentProps) {
  const { Ws } = useContext(WsContext);
  let { local, isRealTime, formVertex, txnId } = useContext(FormContext);

  const [selectOptions, { refetch }] = createResource<Vertex[]>(() => {
   let value = props.meta.properties.props.items;
   if (value) {
    if (typeof value === "string") {
     return value.split("\n");
    } else if (Array.isArray(value)) {
     return value;
    } else {
     return value ? [value] : [];
    }
   } else {
    if (props.disabled) {
     return selectedValue(props.meta, props.data).map((vertexId) => graph.vertexes[vertexId]);
    }
    if (!props.meta.properties.props?.collection) {
     return [];
    }
    return getSelectionOptions(props.data, props.meta.properties.props.collection).vertexes || [];
   }
  });

  return (
    <div aria-labeledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          // const selectedValue = getSelectedVertexValue(props.data, props.meta);

         let selectOp = {
          searchEnabled: true,
          disabled: props.disabled!,
          value: selectedValue(props.meta, props.data),
          onValueChanged: function (e) {
           // note: valueChanged is fired even when the value is changed programmatically,
           // that is causing problem: when transaction is reverted, it again calls onValueChanged callback.
           // used e.event check to prevent this.
           if (!e.event) {
            return;
           }
           if (isRealTime) {
            txnId = getNewTxnId();
           }
           // batch(() => {
           //   if(e.event) isChangedByUser = true;
           if (props.meta.properties.props.stringValue) {
            props.setValue(props.meta, e.value);
           } else if (props.meta.properties.props.items) {
            props.setValue(props.meta, e.value);
           } else if (props.meta.properties.props.inward) {
            // Test this
            // setParentValue(txnId, props.data, props.meta, e.value);
           } else {
            setSelectionValue(txnId, props.data, props.meta, e.value);
           }
           onChangeHandler(txnId, formVertex, props.data, props.meta);
           if (!local && isRealTime) commitTxn(txnId, Ws);
           // })
          },
          labelMode: "floating",
          onFocusIn: function (e) {
           refetch();
          },
         } as Properties;
         if (!props.meta.properties.props.items) {
          Object.assign(selectOp, {
           // if valueExpr value is undefined onValueChange will not fire.
           valueExpr: "id",
           displayExpr: (item) => getOptionLabel(item, props.meta.properties.props.displayExpr || `properties.${IdAttr}`),
          } as Properties)
         }
         const instance = new TagBox(el, selectOp);
         createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
             if (property === "displayExpr" || property === 'items') continue;
             instance.option(property, props.meta.properties.props[property]);
            }
          });
          createEffect(
            on(
              () => selectedValue(props.meta, props.data),
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
    </div>
  );
}
