import { Icon } from "@iconify-icon/solid";
import { type Accessor, Match, Show, Switch } from "solid-js";

import { IdAttr, type Vertex } from "~/lib/graph/graph";

import { Content } from "./Content";
import { DefaultValueContent } from "./DefaultValueContent";
import { Label } from "./Label";

export function HighlightSetValueContent(
  props: Readonly<{
    componentName: Accessor<string>;
    meta: Vertex;
    metaVertex: Vertex;
    selectedLayout: Vertex;
    setValue: (meta: Vertex, data: any) => void;
    txnId: number;
  }>,
) {
  return (
    <div
      class={`${props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== undefined && props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== null ? "b:2px|solid|#008000 bb:none bt:none p:2|3 r:5px" : ""} flex ai:center gap:2 justify-content:space-between mt:6`}
    >
      <span class="f:15 flex:.5">
        <Label metaVertex={props.metaVertex} />
      </span>
      <span class="f:15 flex:1">
        <Switch>
          <Match when={props.metaVertex.P.name === "defaultValue"}>
            <DefaultValueContent
              meta={props.meta}
              selectedLayout={props.selectedLayout}
              setValue={props.setValue}
              txnId={props.txnId}
            />
          </Match>
          <Match when={true}>
            <Content
              componentName={props.componentName}
              meta={props.meta}
              selectedLayout={props.selectedLayout}
              setValue={props.setValue}
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
          props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== undefined &&
          props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== null
        }
      >
        <button onClick={() => props.setValue(props.metaVertex, null)} type="button">
          <Icon
            class="color:#ff0000 cursor:pointer"
            data-testid="clearIcon"
            icon="mdi:close"
          />
        </button>
      </Show>
    </div>
  );
}
