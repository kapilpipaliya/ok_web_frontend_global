import {createMemo, Match, Show, Switch, useContext} from "solid-js";

import { GraphContext, IdAttr } from "~/lib/graph/graph";
import {
  Checkbox,
  Progress,
  Radio,
  RadioGroup,
  TextField,
} from "~/components/solid_blocks";
import { FileUploader } from "~/components/solid_blocks/FileUploader";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import { ExpressionBuilder } from "~/components/ExpressionBuilder";
import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import type { ComponentProps } from "~/components/fields/ComponentType";
import { SelectedIdContext } from "~/lib/contexts";
import {Label} from "~/components/solid_blocks/Label";
import {MultiSelectField} from "~/components/MultiSelect";
import { getViewValue } from "~/lib/graph/get/sync/getViewValue";
import { getCompProps } from "~/lib/graph/get/sync/graph_functions";
import { deNullify, ifNotNull } from "~/lib/utils";
import {mergeCSS} from "~/components/css_properties/cssUtils";

export function GenericInputField(
  props: ComponentProps & {
    component: string;
    title: string;
    txnId: number;
    applyDefaults?: boolean;
  },
) {
  const { Ws } = useContext(WsContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  const [selectedId, setSelectedId] = useContext(SelectedIdContext);
  const component = () => props.component;
  // todo: make a common onChange if possible.
  const defaultValues = createMemo(() => props.applyDefaults && graph.componentIdMap[props.component] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[props.component]]) : {});
  return (
    <div
      classList={{
        "width:100%": component() === "TextArea",
      }}
    >
      <Show
        when={!props.disabled}
        fallback={getViewValue(props.data?.P[props.meta.P[IdAttr]])}
      >
        <Switch>
          <Match when={component() === "CheckBox"}>
            <Checkbox
              {...defaultValues()}
              {...deNullify(props.meta.P)}
              class={mergeCSS(defaultValues().class, props.meta.P.class)}
              onchange={(e: any) => {
                props.setValue
                  ? props.setValue(e.target.checked)
                  : setValueGlobal(
                    graph,
                    setGraph,
                    props.txnId!,
                    props.meta,
                    props.data!,
                    e.target.checked,
                    Ws,
                    false,
                  );
              }}
              align="left"
              checked={
                props.data?.P[props.meta.P[IdAttr]] ??
                props.meta?.P.checked
              }
            >
              {<PageAttrRender metaVertex={props.meta} />}
            </Checkbox>
          </Match>
          <Match when={component() === "ColorBox"}>
            <input
              type="color"
              {...defaultValues()}
              {...deNullify(props.meta.P)}
              class={mergeCSS(defaultValues().class, props.meta.P.class)}
              value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
              onInput={(e) => {
                props.setValue
                  ? props.setValue(e.target.value)
                  : setValueGlobal(
                    graph,
                    setGraph,
                    props.txnId!,
                    props.meta,
                    props.data!,
                    e.target.value,
                    Ws,
                    false,
                  );
              }}
            />
          </Match>
          <Match when={component() === "DropDownBox"}>Dropdown</Match>
          <Match when={component() === "FileUploader"}>
            <FileUploader
              {...defaultValues()}
              {...deNullify(props.meta.P)}
              class={mergeCSS(defaultValues().class, props.meta.P.class)}
              image={props.meta?.P.image}
            />
          </Match>
          <Match when={component() === "HtmlEditor"}>
            {props.data?.P[props.meta.P[IdAttr]]}
          </Match>
          <Match when={component() === "NumberBox"}>
            <TextField
              placeholder={props.meta?.P.label ?? ""}
              onchange={(e: any) => {
                props.setValue
                  ? props.setValue(e.target.value)
                  : setValueGlobal(
                    graph,
                    setGraph,
                    props.txnId!,
                    props.meta,
                    props.data!,
                    e.target.value,
                    Ws,
                    false,
                  );
              }}
              {...defaultValues()}
              {...deNullify(props.meta.P)}
              class={mergeCSS(defaultValues().class, props.meta.P.class)}
              isNumber
              value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
            />
          </Match>
          <Match when={component() === "Radio"}>
            <Radio
              {...defaultValues()}
              {...deNullify(props.meta.P)}
              class={mergeCSS(defaultValues().class, props.meta.P.class)}
              // value={props.data?.P[props.meta.P[IdAttr]] ?? ""}
              onchange={(e: any) => {
                props.setValue
                  ? props.setValue(e.target.checked)
                  : setValueGlobal(
                    graph,
                    setGraph,
                    props.txnId!,
                    props.meta,
                    props.data!,
                    e.target.checked,
                    Ws,
                    false,
                  );
              }}
              // name={props.meta?.P.label ?? "radio"}
              align="left"
            >
              {props.meta?.P.label ?? "radio"}
            </Radio>
          </Match>
          <Match when={component() === "ProgressBar"}>
            <Progress
              style={{ ...props.meta?.P }}
              {...defaultValues()}
              {...deNullify(props.meta.P)}
              class={mergeCSS(defaultValues().class, props.meta.P.class)}
            />
          </Match>
          <Match when={component() === "SelectBox"}>
            <MultiSelectField
              {...defaultValues()}
              onRemove={(e: any) => {
                props.setValue
                  ? props.setValue(e.target.value)
                  : setValueGlobal(
                    graph,
                    setGraph,
                    props.txnId!,
                    props.meta,
                    props.data!,
                    e.target.value,
                    Ws,
                    false,
                  );
              }}
              onSelect={(e: any) => {
                props.setValue
                  ? props.setValue(e.target.value)
                  : setValueGlobal(
                    graph,
                    setGraph,
                    props.txnId!,
                    props.meta,
                    props.data!,
                    e.target.value,
                    Ws,
                    false,
                  );
              }}
              options={props.meta?.P.options ?? []}
              selectedValues={() => [props.data?.P[props.meta.P[IdAttr]]]}
              placeholder={props.meta?.P.placeholder ?? "Select Item"}
              disable={props.disabled}
              displayValueParent="P"
              displayValueChild="name"
              selectionLimit={1}
            />
          </Match>
          <Match when={component() === "RadioGroup"}>
            <RadioGroup>
              <PageAttrRender metaVertex={props.meta} />
            </RadioGroup>
          </Match>

          <Match when={component() === "TextArea"}>
            <TextField
              {...defaultValues()}
              {...deNullify(props.meta.P)}
              class={`global-style ${mergeCSS(defaultValues().class, props.meta.P.class)}`}
              onchange={(e: any) => {
                props.setValue
                  ? props.setValue(e.target.value)
                  : setValueGlobal(
                    graph,
                    setGraph,
                    props.txnId!,
                    props.meta,
                    props.data!,
                    e.target.value,
                    Ws,
                    false,
                  );
              }}
              placeholder={props.meta?.P.label ?? props.title}
              multiline
              value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
            />
          </Match>
          {/* Expression Builder */}
          <Match
            when={
              component() === "TextBox" &&
              props.data &&
              props.meta &&
              props.meta.P &&
              props.meta.P[IdAttr] &&
              props.data.P &&
              props.data.P[props.meta.P[IdAttr]] &&
              props.data.P[props.meta.P[IdAttr]].toString().includes(")+(")
            }
          >
            <TextField
              {...defaultValues()}
              {...deNullify(props.meta.P)}
              class={`global-style ${mergeCSS(defaultValues().class, props.meta.P.class)}`}
              onchange={(e: any) => {
                props.setValue
                  ? props.setValue(e.target.value)
                  : setValueGlobal(
                    graph,
                    setGraph,
                    props.txnId!,
                    props.meta,
                    props.data!,
                    e.target.value,
                    Ws,
                    false,
                  );
              }}
              placeholder={props.meta?.P.label ?? props.title}
              value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
              trailing={
                <ExpressionBuilder
                  content={props.data?.P[props.meta.P[IdAttr]]}
                  meta={props.meta}
                  data={props.data}
                  title={props.title}
                  txnId={props.txnId}
                  component={component()}
                  setValue={
                    props.setValue
                      ? props.setValue
                      : (value) =>
                        setValueGlobal(
                          graph,
                          setGraph,
                          props.txnId!,
                          props.meta,
                          props.data!,
                          value,
                          Ws,
                          false,
                        )
                  }
                />
              }
            />
          </Match>
          <Match when={component() === "TextBox"}>
            <TextField
              {...defaultValues()}
              {...deNullify(props.meta.P)}
              class={`global-style ${mergeCSS(defaultValues().class, props.meta.P.class)}`}
              placeholder={props.meta?.P.label ?? props.title}
              onchange={(e: any) => {
                props.setValue
                  ? props.setValue(e.target.value)
                  : setValueGlobal(
                    graph,
                    setGraph,
                    props.txnId!,
                    props.meta,
                    props.data!,
                    e.target.value,
                    Ws,
                    false,
                  );
              }}
              value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
            />
          </Match>
          <Match when={component() === "Label"}>
            <Label
            meta={props.meta}
              {...defaultValues()}
              {...deNullify(props.meta.P)}
              class={mergeCSS(defaultValues().class, props.meta.P.class)}
            >
              <PageAttrRender metaVertex={props.meta} />
            </Label>
          </Match>
        </Switch>
      </Show>
    </div>
  );
}

// Note:
// what if some properties are removed from meta.
// We should remember previous keys and remove when some keys are changed.
