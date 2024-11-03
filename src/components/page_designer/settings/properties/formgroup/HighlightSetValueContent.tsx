import { type Accessor, createMemo, Match, Show, Switch } from "solid-js";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { IconButton } from "~/components/IconButton";
import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import { evalExpression } from "~/lib/expression_eval";
import { IdAttr, useGraph, type Vertex } from "~/lib/graph/graph";

import { DefaultValueContent } from "./DefaultValueContent";
import { Label } from "./Label";

export function HighlightSetValueContent(
  props: Readonly<{
    componentName: Accessor<string>;
    meta: Vertex;
    onChange: (meta: Vertex, data: any) => void;
    selectedLayout: Vertex;
    txnId: number;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const componentExample = createMemo(
    () =>
      evalExpression("->$0CompExample", {
        graph,
        setGraph,
        vertexes: [props.meta],
      }) || [],
  );

  return (
    <div
      class={`${props.selectedLayout?.P[props.meta.P[IdAttr]] !== undefined && props.selectedLayout?.P[props.meta.P[IdAttr]] !== null ? "b:2px|solid|#008000 bb:none bt:none p:2|3 r:5px" : ""} flex ai:center gap:2 justify-content:space-between mt:6`}
    >
      <span class="f:15 flex:.5">
        <Label meta={props.meta} />
      </span>
      <span class="f:15 flex:1">
        <Switch>
          <Match when={props.meta.P.key === "defaultValue"}>
            <DefaultValueContent
              meta={props.meta}
              onChange={props.onChange}
              selectedLayout={props.selectedLayout}
              txnId={props.txnId}
            />
          </Match>
          <Match when={componentExample().length > 0}>
            <PageAttrRender
              data={props.selectedLayout}
              metaVertex={componentExample()[0]}
            />
          </Match>
          <Match when={true}>
            <DynamicComponent
              componentName={props.componentName()}
              data={props.selectedLayout}
              isNoPermissionCheck={true}
              isRealTime={false}
              meta={props.meta}
              noLabel
              onChange={(data) => props.onChange(props.meta, data)}
              txnId={props.txnId}
            />
          </Match>
        </Switch>
        {/* Select Rules: */}
        {/* <SelectInputField
                      componentName={"Select"}
                      data={{ P: {} } as Vertex}
                      meta={{
                        P: {
                          [IdAttr]: "import",
                          displayExpr: "$P.key",
                          collection: `ids:'${props.selectedLayout.id}'->Rule`
                        },
                      } as unknown as Vertex}
                      onChange={(attr, vertex, data) => 0}
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
          onClick={() => props.onChange(props.meta, null)}
          size={24}
        />
      </Show>
    </div>
  );
}
