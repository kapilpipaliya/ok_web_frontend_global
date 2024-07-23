import { Icon } from "@iconify-icon/solid";
import {
  type Setter,
  Show, createSignal
} from "solid-js";
import { Drawer } from "~/components/Drawer";
import { ZIndex } from "~/components/ZIndex";
import { CSSPropertiesEditorWrapper } from "~/components/css_properties/CSSPropertiesEditorWrapper";
import { type Vertex, useGraph } from "~/lib/graph/graph";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";

// Component for handling the CSS Editor
export function CssEditor(props: { joinVertex: Vertex; metaVertex: Vertex; txnId: number; }) {
  const [graph, setGraph] = useGraph();
  const [showCssEditor, setShowCssEditor] = createSignal(false);
  return (
    <>
      <button class="b:1px|solid|lightgrey p:6 r:6" onClick={() => setShowCssEditor(true)} type="button">
        <Icon height={20} icon="fluent:text-edit-style-20-filled" width={20} />
      </button>
      <Show when={showCssEditor()}>
        <ZIndex>
          <Drawer
            customButton={() => false}
            drawerClass={"padding:10px"}
            open={showCssEditor}
            setIsOpen={((v: boolean) => setShowCssEditor(v)) as Setter<boolean>}
          >
            <CSSPropertiesEditorWrapper
              data={props.joinVertex}
              meta={props.metaVertex}
              setValue={(data) => {
                setValueGlobal(
                  graph,
                  setGraph,
                  props.txnId,
                  props.metaVertex,
                  props.joinVertex,
                  data,
                  false
                );
              }}
              txnId={props.txnId} />
          </Drawer>
        </ZIndex>
      </Show>
    </>
  );
}
