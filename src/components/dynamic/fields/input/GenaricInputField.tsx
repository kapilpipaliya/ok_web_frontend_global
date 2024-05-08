import {
  createMemo,
  Match,
  Show,
  splitProps,
  Switch,
  useContext,
} from "solid-js";

import { GraphContext, IdAttr } from "~/lib/graph/graph";
import { ComponentProps } from "~/lib/ComponentType";
import {
  Checkbox,
  Progress,
  Radio,
  RadioGroup,
  TextField,
} from "~/components/solid-blocks/blocks";
import { FileUploader } from "~/components/solid-blocks/blocks/file_uploader/fileuploader";
import { setSelectedId } from "~/lib/pageStore";
import { setValueGlobal, getTextColumnValue } from "~/lib/Utils";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import { ExpressionBuilder } from "~/components/custom/ExpressionBuilder";
import { PageItemRender } from "~/components/dynamic/fields/static/GenaricField";

export function GenericInputField(
  props: ComponentProps & {
    component: string;
    title: string;
    txnId: number;
  },
) {
  const { Ws } = useContext(WsContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  const [field, others] = splitProps(props, [
    "meta",
    "data",
    "setValue",
    "disabled",
    "component",
    "title",
    "txnId",
  ]);

  const component = () => field.component;
  return (
    <div
      aria-labeledby={props["aria-labeledby"]}
      classList={{
        "width:100%": component() === "TextArea",
      }}
    >
      <Show
        when={!field.disabled}
        fallback={getTextColumnValue(field.data?.P[field.meta.P[IdAttr]])}
      >
        <Switch>
          <Match when={component() === "Form"}>
            <PageItemRender metaVertex={field.meta} />
          </Match>
          <Match
            when={component() === "FormSubmit" || component() === "FormCancel"}
          >
            <button
              onClick={() => setSelectedId(field.meta.id)}
              {...field.meta.P.props}
            >
              {field.data?.P[field.meta.P[IdAttr]] ?? field.meta.P.children}
            </button>
          </Match>
          <Match when={component() === "CheckBox"}>
            <Checkbox
              {...field.meta?.P.props}
              onchange={(e: any) => {
                field.setValue
                  ? field.setValue(e.target.checked)
                  : setValueGlobal(
                      graph,
                      setGraph,
                      field.txnId!,
                      field.meta,
                      field.data!,
                      e.target.checked,
                      Ws,
                      false,
                    );
              }}
              align="left"
              checked={
                field.data?.P[field.meta.P[IdAttr]] ??
                field.meta?.P.props?.checked
              }
            >
              {<PageItemRender metaVertex={field.meta} />}
            </Checkbox>
          </Match>
          <Match when={component() === "ColorBox"}>
            <input
              type="color"
              {...field.meta?.P.props}
              value={field.data?.P[field.meta.P[IdAttr]]}
              onInput={(e) => {
                field.setValue
                  ? field.setValue(e.target.value)
                  : setValueGlobal(
                      graph,
                      setGraph,
                      field.txnId!,
                      field.meta,
                      field.data!,
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
              {...field.meta?.P.props}
              image={field.meta?.P.image}
            />
          </Match>
          <Match when={component() === "HtmlEditor"}>
            {field.data?.P[field.meta.P[IdAttr]]}
          </Match>
          <Match when={component() === "NumberBox"}>
            <TextField
              placeholder={field.meta?.P.label ?? ""}
              onchange={(e: any) => {
                field.setValue
                  ? field.setValue(e.target.value)
                  : setValueGlobal(
                      graph,
                      setGraph,
                      field.txnId!,
                      field.meta,
                      field.data!,
                      e.target.value,
                      Ws,
                      false,
                    );
              }}
              {...field.meta?.P.props}
              isNumber
              value={field.data?.P[field.meta.P[IdAttr]]}
            />
          </Match>
          <Match when={component() === "Radio"}>
            <Radio
              {...field.meta?.P.props}
              // value={field.data?.P[field.meta.P[IdAttr]] ?? ""}
              onchange={(e: any) => {
                field.setValue
                  ? field.setValue(e.target.checked)
                  : setValueGlobal(
                      graph,
                      setGraph,
                      field.txnId!,
                      field.meta,
                      field.data!,
                      e.target.checked,
                      Ws,
                      false,
                    );
              }}
              // name={field.meta?.P.props?.label ?? "radio"}
              align="left"
            >
              {field.meta?.P.props?.label ?? "radio"}
            </Radio>
          </Match>
          <Match when={component() === "ProgressBar"}>
            <Progress
              style={{ ...field.meta?.P.props }}
              {...field.meta?.P.props}
            />
          </Match>
          <Match when={component() === "RadioGroup"}>
            <RadioGroup>
              <PageItemRender metaVertex={field.meta} />
            </RadioGroup>
          </Match>

          <Match when={component() === "TextArea"}>
            <TextField
              class="global-style"
              {...field.meta?.P.props}
              onchange={(e: any) => {
                field.setValue
                  ? field.setValue(e.target.value)
                  : setValueGlobal(
                      graph,
                      setGraph,
                      field.txnId!,
                      field.meta,
                      field.data!,
                      e.target.value,
                      Ws,
                      false,
                    );
              }}
              placeholder={field.meta?.P.props?.label ?? field.title}
              multiline
              value={field.data?.P[field.meta.P[IdAttr]]}
            />
          </Match>
          <Match
            when={
              component() === "TextBox" &&
              field.data &&
              field.meta &&
              field.meta.P &&
              field.meta.P[IdAttr] &&
              field.data.P &&
              field.data.P[field.meta.P[IdAttr]] &&
              field.data.P[field.meta.P[IdAttr]].toString().includes(")+(")
            }
          >
            <TextField
              class="global-style"
              {...field.meta?.P.props}
              onchange={(e: any) => {
                field.setValue
                  ? field.setValue(e.target.value)
                  : setValueGlobal(
                      graph,
                      setGraph,
                      field.txnId!,
                      field.meta,
                      field.data!,
                      e.target.value,
                      Ws,
                      false,
                    );
              }}
              placeholder={field.meta?.P.props?.label ?? field.title}
              value={field.data?.P[field.meta.P[IdAttr]]}
              trailing={
                <ExpressionBuilder
                  content={field.data?.P[field.meta.P[IdAttr]]}
                  meta={field.meta}
                  data={field.data}
                  title={field.title}
                  txnId={field.txnId}
                  component={component()}
                  setValue={
                    field.setValue
                      ? field.setValue
                      : (value) =>
                          setValueGlobal(
                            graph,
                            setGraph,
                            field.txnId!,
                            field.meta,
                            field.data!,
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
              {...field.meta?.P.props}
              placeholder={field.meta?.P.props?.label ?? field.title}
              onchange={(e: any) => {
                field.setValue
                  ? field.setValue(e.target.value)
                  : setValueGlobal(
                      graph,
                      setGraph,
                      field.txnId!,
                      field.meta,
                      field.data!,
                      e.target.value,
                      Ws,
                      false,
                    );
              }}
              value={field.data?.P[field.meta.P[IdAttr]]}
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
