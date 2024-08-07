import { type Accessor, Match, Show, Switch } from "solid-js";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { IconButton } from "~/components/IconButton";
import { IdAttr, type Vertex } from "~/lib/graph/graph";

import { DefaultValueContent } from "./DefaultValueContent";
import { Label } from "./Label";

export function HighlightSetValueContent(
  props: Readonly<{
    componentName: Accessor<string>;
    meta: Vertex;
    selectedLayout: Vertex;
    setValue: (meta: Vertex, data: any) => void;
    txnId: number;
  }>,
) {
  return (
    <div
      class={`${props.selectedLayout?.P[props.meta.P[IdAttr]] !== undefined && props.selectedLayout?.P[props.meta.P[IdAttr]] !== null ? "b:2px|solid|#008000 bb:none bt:none p:2|3 r:5px" : ""} flex ai:center gap:2 justify-content:space-between mt:6`}
    >
      <span class="f:15 flex:.5">
        <Label meta={props.meta} />
      </span>
      <span class="f:15 flex:1">
        <Switch>
          <Match when={props.meta.P.name === "defaultValue"}>
            <DefaultValueContent
              meta={props.meta}
              selectedLayout={props.selectedLayout}
              setValue={props.setValue}
              txnId={props.txnId}
            />
          </Match>
          <Match when={true}>
            <DynamicComponent
              componentName={props.componentName()}
              data={props.selectedLayout}
              isNoPermissionCheck={true}
              isRealTime={false}
              meta={props.meta}
              setValue={(data) => props.setValue(props.meta, data)}
              txnId={props.txnId}
            />
          </Match>
        </Switch>
        {/* Select Rules: */}
        {/* <SelectInputField
                      componentName={"SelectBox"}
                      data={{ P: {} } as Vertex}
                      meta={{
                        P: {
                          [IdAttr]: "import",
                          displayExpr: "$P.name",
                          collection: `ids:'${props.selectedLayout.id}'->Rule`
                        },
                      } as unknown as Vertex}
                      setValue={(attr, vertex, data) => 0}
                    /> */}
      </span>
      <Show
        when={
          props.selectedLayout?.P[props.meta.P[IdAttr]] !== undefined &&
          props.selectedLayout?.P[props.meta.P[IdAttr]] !== null
        }
      >
        <IconButton
          data-testid="clearIcon"
          icon="mdi:close"
          iconClass="color:#ff0000 cursor:pointer"
          onClick={() => props.setValue(props.meta, null)}
          size={24}
        />
      </Show>
    </div>
  );
}
