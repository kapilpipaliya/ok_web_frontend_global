import { createMemo, Match, Show, Switch } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { IconButton } from "~/components/styled/IconButton";
import { IframeHelpDialog } from "~/components/styled/modal/IframeHelpDialog";
import { FilePickerButton } from "~/features/css_editor/components/fields/textfield_with_unit/FilePickerButtonImageSrc";
import { PageAttrRender } from "~/features/page_attr_render/PageAttrRender";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { evalExpression } from "~/lib/expression_eval";
import { IdAttr, type Vertex } from "~/lib/graph/graph";
import { useGraph } from "~/lib/graph/GraphContext";

import { DefaultValueContent } from "./DefaultValueContent";
import { Label } from "./Label";

export function HighlightSetValueContent(
  props: Readonly<{
    meta: Vertex;
    onChange: (meta: Vertex, data: any) => void;
    selectedLayout: Vertex;
    txnId: number;
  }>,
) {
  const [graph, setGraph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const selectedAttr = () => graph.vertexes[formStoreVertex().P.selectedId];
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
          <Match
            when={
              // selectedAttr()?.P.componentName === "Image" &&
              props.meta.P.key === "src"
            }
          >
            <div>
              <div class={"flex gap:2"}>
                <DynamicComponent
                  data={props.selectedLayout}
                  isNoPermissionCheck={true}
                  isRealTime={false}
                  meta={props.meta}
                  noLabel
                  onChange={(data) => props.onChange(props.meta, data)}
                  txnId={props.txnId}
                />
                <FilePickerButton
                  handleChange={(value) => props.onChange(props.meta, value)}
                  meta={props.selectedLayout}
                  value={props.selectedLayout.P.src}
                />
              </div>
            </div>
          </Match>
          <Match
            when={
              selectedAttr()?.P.componentName === "Icon" &&
              props.meta.P.key === "icon"
            }
          >
            <div>
              <div class={"flex gap:2"}>
                <DynamicComponent
                  data={props.selectedLayout}
                  isNoPermissionCheck={true}
                  isRealTime={false}
                  meta={props.meta}
                  noLabel
                  onChange={(data) => props.onChange(props.meta, data)}
                  txnId={props.txnId}
                />
                <IframeHelpDialog
                  icon="arcticons:pickme"
                  iframeSrc="https://icon-sets.iconify.design"
                  iframeTitle="Icon Sets"
                  title="Icon Picker"
                />
              </div>
            </div>
          </Match>
          <Match when={true}>
            <DynamicComponent
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
          icon="ph:x"
          iconClass="color:#ff0000 cursor:pointer"
          onClick={() => props.onChange(props.meta, null)}
          size={24}
        />
      </Show>
    </div>
  );
}
