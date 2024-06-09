import { Match, Show, splitProps, Switch, useContext } from "solid-js";

import { GraphContext, IdAttr } from "~/lib/graph/graph";
import {
  Checkbox,
  Progress,
  Radio,
  RadioGroup,
  TextField,
} from "~/components/solid_blocks";
import { FileUploader } from "~/components/solid_blocks/FileUploader";
import { setValueGlobal } from "~/lib/graph/mutate/form_functions";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import { ExpressionBuilder } from "~/components/ExpressionBuilder";
import { PageItemRender } from "~/components/page_item_render/PageItemRender";
import type { ComponentProps } from "~/components/fields/ComponentType";
import { FormContext, SelectedIdContext } from "~/lib/contexts";
import Label from "~/components/solid_blocks/Label";
import MultiSelectField from "~/components/MultiSelect";
import { getViewValue } from "~/lib/graph/get/sync/getViewValue";

export function GenericInputField(
  props: ComponentProps & {
    component: string;
    title: string;
    txnId: number;
  },
) {
  const { Ws } = useContext(WsContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  const [selectedId, setSelectedId] = useContext(SelectedIdContext);
  const component = () => props.component;
  // todo: make a common onChange if possible.
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
              {...props.meta?.P.props}
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
                props.meta?.P.props?.checked
              }
            >
              {<PageItemRender metaVertex={props.meta} />}
            </Checkbox>
          </Match>
          <Match when={component() === "ColorBox"}>
            <input
              type="color"
              {...props.meta?.P.props}
              value={props.data?.P[props.meta.P[IdAttr]]}
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
              {...props.meta?.P.props}
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
              {...props.meta?.P.props}
              isNumber
              value={props.data?.P[props.meta.P[IdAttr]]}
            />
          </Match>
          <Match when={component() === "Radio"}>
            <Radio
              {...props.meta?.P.props}
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
              // name={props.meta?.P.props?.label ?? "radio"}
              align="left"
            >
              {props.meta?.P.props?.label ?? "radio"}
            </Radio>
          </Match>
          <Match when={component() === "ProgressBar"}>
            <Progress
              style={{ ...props.meta?.P.props }}
              {...props.meta?.P.props}
            />
          </Match>
          <Match when={component() === "SelectBox"}>
            <MultiSelectField
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
              options={props.meta?.P.props?.options ?? []}
              selectedValues={() => [props.data?.P[props.meta.P[IdAttr]]]}
              placeholder={props.meta?.P.props?.placeholder ?? "Select Item"}
              disable={props.disabled}
              displayValueParent="P"
              displayValueChild="name"
              selectionLimit={1}
            />
          </Match>
          <Match when={component() === "RadioGroup"}>
            <RadioGroup>
              <PageItemRender metaVertex={props.meta} />
            </RadioGroup>
          </Match>

          <Match when={component() === "TextArea"}>
            <TextField
              class="global-style"
              {...props.meta?.P.props}
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
              placeholder={props.meta?.P.props?.label ?? props.title}
              multiline
              value={props.data?.P[props.meta.P[IdAttr]]}
            />
          </Match>
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
              class="global-style"
              {...props.meta?.P.props}
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
              placeholder={props.meta?.P.props?.label ?? props.title}
              value={props.data?.P[props.meta.P[IdAttr]]}
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
              class="global-style"
              {...props.meta?.P.props}
              placeholder={props.meta?.P.props?.label ?? props.title}
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
              value={props.data?.P[props.meta.P[IdAttr]]}
            />
          </Match>
          <Match when={component() === "Label"}>
            <Label {...props.meta?.P.props}>
              <PageItemRender metaVertex={props.meta} />
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
