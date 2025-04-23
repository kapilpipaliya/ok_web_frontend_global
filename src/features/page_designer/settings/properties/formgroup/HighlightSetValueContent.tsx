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
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function HighlightSetValueContent(
  props: Readonly<{
    meta: Vertex;
    onChange: (meta: Vertex, data: unknown) => void;
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
    <As
      as="div"
      css={css`
  ${
    props.selectedLayout?.P[props.meta.P[IdAttr]] !== undefined &&
    props.selectedLayout?.P[props.meta.P[IdAttr]] !== null
      ? `
  border: 2px solid #008000;
  border-bottom: none;
  border-top: none;
  padding: 2px 3px;
  border-radius: 5px;
`
      : ""
  }
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: space-between;
  margin-top: 6px;
`}
    >
      <As
        as="span"
        css={css`
  font-size: 15px;
  flex: 0.5;
`}
      >
        <Label meta={props.meta} />
      </As>
      <As
        as="span"
        css={css`
  font-size: 15px;
  flex: 1;
`}
      >
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
              isNoPermissionCheck={true}
              metaVertex={componentExample()[0]}
            />
          </Match>
          <Match when={props.meta.P.key === "type" && selectedAttr()?.P.componentName === "Head"}>
            <DynamicComponent
              data={props.selectedLayout}
              isNoPermissionCheck={true}
              isRealTime={false}
              meta={props.meta}
              onChange={(data) => props.onChange(props.meta, data)}
              txnId={props.txnId}
            />
          </Match>
          <Match
            when={
              // selectedAttr()?.P.componentName === "Image" &&
              props.meta.P.key === "src"
            }
          >
            <div>
              <As
                as="div"
                css={css`
  display: flex;
  gap: 2px;
`}
              >
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
              </As>
            </div>
          </Match>
          <Match
            when={
              selectedAttr()?.P.componentName === "Icon" &&
              props.meta.P.key === "icon"
            }
          >
            <div>
              <As
                as="div"
                css={css`
  display: flex;
  gap: 2px;
`}
              >
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
              </As>
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
      </As>
      <Show
        when={
          props.selectedLayout?.P[props.meta.P[IdAttr]] !== undefined &&
          props.selectedLayout?.P[props.meta.P[IdAttr]] !== null
        }
      >
        <IconButton
          data-testid="clearIcon"
          icon="ph:x"
          css={css`
            background-color: transparent;
            border: none;
          `}
          iconCss={css`color:#ff0000; cursor:pointer;`}
          onClick={() => props.onChange(props.meta, null)}
          size={24}
        />
      </Show>
    </As>
  );
}
