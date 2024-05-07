import { Match, Show, Switch, useContext } from "solid-js";

import { GraphContext, IdAttr } from "../../lib/graph";
import { ComponentProps } from "../../lib/ComponentType";
import {
  Checkbox,
  Progress,
  Radio,
  RadioGroup,
  TextField,
} from "../solid-blocks/blocks";
import { PageItemRender } from "./GenaricField";

import { FileUploader } from "../solid-blocks/blocks/fileuploader";
import { setSelectedId } from "../../lib/pageStore";
import { setValueGlobal, getTextColumnValue } from "../../lib/Utils";
import { WsContext } from "../../lib/ws_events_dispatcher";
import { ExpressionBuilder } from "../custom/ExpressionBuilder";

export function GenericInputField(
  props: ComponentProps & {
    component: string;
    title: string;
    txnId: number;
  },
) {
  const { Ws } = useContext(WsContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  const { component, disabled, title, txnId, meta, data, setValue } = props;

  return (
    <div
      aria-labeledby={props["aria-labeledby"]}
      classList={{
        "width:100%": component === "TextArea",
      }}
    >
      <Show
        when={!disabled}
        fallback={getTextColumnValue(data?.P[meta.P[IdAttr]])}
      >
        <Switch>
          <Match when={component === "Form"}>
            <PageItemRender metaVertex={meta} />
          </Match>
          <Match
            when={component === "FormSubmit" || component === "FormCancel"}
          >
            <button onClick={() => setSelectedId(meta.id)} {...meta.P.props}>
              {data?.P[meta.P[IdAttr]] ?? meta.P.children}
            </button>
          </Match>
          <Match when={component === "CheckBox"}>
            <Checkbox
              {...meta?.P.props}
              onchange={(e: any) => {
                setValue
                  ? setValue(e.target.checked)
                  : setValueGlobal(
                      graph,
                      setGraph,
                      txnId!,
                      meta,
                      data!,
                      e.target.checked,
                      Ws,
                      false,
                    );
              }}
              align="left"
              checked={data?.P[meta.P[IdAttr]] ?? meta?.P.props?.checked}
            >
              {<PageItemRender metaVertex={meta} />}
            </Checkbox>
          </Match>
          <Match when={component === "ColorBox"}>
            <input
              type="color"
              {...meta?.P.props}
              value={data?.P[meta.P[IdAttr]]}
              onInput={(e) => {
                setValue
                  ? setValue(e.target.value)
                  : setValueGlobal(
                      graph,
                      setGraph,
                      txnId!,
                      meta,
                      data!,
                      e.target.value,
                      Ws,
                      false,
                    );
              }}
            />
          </Match>
          <Match when={component === "DropDownBox"}>Dropdown</Match>
          <Match when={component === "FileUploader"}>
            <FileUploader {...meta?.P.props} image={meta?.P.image} />
          </Match>
          <Match when={component === "HtmlEditor"}>
            {data?.P[meta.P[IdAttr]]}
          </Match>
          <Match when={component === "NumberBox"}>
            <TextField
              placeholder={meta?.P.label ?? ""}
              onchange={(e: any) => {
                setValue
                  ? setValue(e.target.value)
                  : setValueGlobal(
                      graph,
                      setGraph,
                      txnId!,
                      meta,
                      data!,
                      e.target.value,
                      Ws,
                      false,
                    );
              }}
              {...meta?.P.props}
              isNumber
              value={data?.P[meta.P[IdAttr]]}
            />
          </Match>
          <Match when={component === "Radio"}>
            <Radio
              {...meta?.P.props}
              // value={data?.P[meta.P[IdAttr]] ?? ""}
              onchange={(e: any) => {
                setValue
                  ? setValue(e.target.checked)
                  : setValueGlobal(
                      graph,
                      setGraph,
                      txnId!,
                      meta,
                      data!,
                      e.target.checked,
                      Ws,
                      false,
                    );
              }}
              // name={meta?.P.props?.label ?? "radio"}
              align="left"
            >
              {meta?.P.props?.label ?? "radio"}
            </Radio>
          </Match>
          <Match when={component === "ProgressBar"}>
            <Progress style={{ ...meta?.P.props }} {...meta?.P.props} />
          </Match>
          <Match when={component === "RadioGroup"}>
            <RadioGroup>
              <PageItemRender metaVertex={meta} />
            </RadioGroup>
          </Match>

          <Match when={component === "TextArea"}>
            <TextField
              class="global-style"
              {...meta?.P.props}
              onchange={(e: any) => {
                setValue
                  ? setValue(e.target.value)
                  : setValueGlobal(
                      graph,
                      setGraph,
                      txnId!,
                      meta,
                      data!,
                      e.target.value,
                      Ws,
                      false,
                    );
              }}
              placeholder={meta?.P.props?.label ?? title}
              multiline
              value={data?.P[meta.P[IdAttr]]}
            />
          </Match>
          <Match
            when={
              component === "TextBox" &&
              data &&
              meta &&
              meta.P &&
              meta.P[IdAttr] &&
              data.P &&
              data.P[meta.P[IdAttr]] &&
              data.P[meta.P[IdAttr]].toString().includes(")+(")
            }
          >
            <TextField
              class="global-style"
              {...meta?.P.props}
              onchange={(e: any) => {
                setValue
                  ? setValue(e.target.value)
                  : setValueGlobal(
                      graph,
                      setGraph,
                      txnId!,
                      meta,
                      data!,
                      e.target.value,
                      Ws,
                      false,
                    );
              }}
              placeholder={meta?.P.props?.label ?? title}
              value={data?.P[meta.P[IdAttr]]}
              trailing={
                <ExpressionBuilder
                  content={data?.P[meta.P[IdAttr]]}
                  meta={meta}
                  data={data}
                  title={title}
                  txnId={txnId}
                  component={component}
                  setValue={
                    setValue
                      ? setValue
                      : (value) =>
                          setValueGlobal(
                            graph,
                            setGraph,
                            txnId!,
                            meta,
                            data!,
                            value,
                            Ws,
                            false,
                          )
                  }
                />
              }
            />
          </Match>
          <Match when={component === "TextBox"}>
            <TextField
              class="global-style"
              {...meta?.P.props}
              placeholder={meta?.P.props?.label ?? title}
              onchange={(e: any) => {
                setValue
                  ? setValue(e.target.value)
                  : setValueGlobal(
                      graph,
                      setGraph,
                      txnId!,
                      meta,
                      data!,
                      e.target.value,
                      Ws,
                      false,
                    );
              }}
              value={data?.P[meta.P[IdAttr]]}
            />
          </Match>
        </Switch>
      </Show>
    </div>
  );
}

// Note:
// what if some properties are removed from meta.
// We should remember previous keys and remove when some keys are changed.
