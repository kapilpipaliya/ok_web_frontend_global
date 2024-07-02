import { Match, Show, Switch, createMemo, splitProps, useContext } from "solid-js";

import type { ComponentProps } from "~/components/fields/ComponentType";

import { ExpressionBuilder } from "~/components/ExpressionBuilder";
import { MultiSelectField } from "~/components/MultiSelect";
import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import {


  Radio,
  RadioGroup,
} from "~/components/solid_blocks";
import { FileUploader } from "~/components/solid_blocks/FileUploader";
import { getCompProps } from "~/lib/graph/get/sync/getProps";
import { getViewValue } from "~/lib/graph/get/sync/getViewValue";
import { GraphContext, IdAttr } from "~/lib/graph/graph";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { deNullify, ifNotNull } from "~/lib/utils";

import { Signature } from "../SignatureBox";
import { mergeCSS } from "../css_properties/utils/mergeCSS";

export function GenericInputField(
  props: {
    applyDefaults?: boolean;
    component?: string; // depricated
    componentName?: string;
    title: string;
    txnId: number;
  } & ComponentProps,
) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const component = () => props.component ?? props.componentName ?? props.meta.P.component;

  // todo: make a common onChange if possible.
  const defaultValues = createMemo(() => props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {});
  const Error = () => <Show when={props.meta.P.error}>
    <div class="fg:rgb(255,0,0)">{props.meta.P.error}</div>
  </Show>

  const [select, customMetaProps] = splitProps(props.meta.P, ['validation'])

  return (
    <Show
      fallback={getViewValue(props.data?.P[props.meta.P[IdAttr]])}
      when={!props.disabled}
    >
      <Switch>
        <Match when={component() === "CheckBox"}>
          <input
            type="checkbox"
            {...defaultValues()}
            {...deNullify(customMetaProps)}
            checked={
              props.data?.P[props.meta.P[IdAttr]] ??
              props.meta?.P.checked
            }
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
            onchange={(e: any) => {
              props.setValue
                ? props.setValue(e.target.checked)
                : setValueGlobal(
                  graph,
                  setGraph,
                  props.txnId,
                  props.meta,
                  props.data!,
                  e.target.checked,
                  
                  false,
                );
            }}
          />
          <Error />
          <PageAttrRender data={props.data} metaVertex={props.meta} />
        </Match>
        <Match when={component() === "ColorBox"}>
          <input
            type="color"
            {...defaultValues()}
            {...deNullify(customMetaProps)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
            onInput={(e) => {
              props.setValue
                ? props.setValue(e.target.value)
                : setValueGlobal(
                  graph,
                  setGraph,
                  props.txnId,
                  props.meta,
                  props.data!,
                  e.target.value,
                  
                  false,
                );
            }}
            value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
          />
          <Error />
        </Match>
        <Match when={component() === "DropDownBox"}>Dropdown</Match>
        <Match when={component() === "FileUploader"}>
          <FileUploader
            {...defaultValues()}
            {...deNullify(customMetaProps)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
            image={props.meta?.P.image}
          />
          <Error />
        </Match>
        <Match when={component() === "HtmlEditor"}>
          {props.data?.P[props.meta.P[IdAttr]]}
          <Error />
        </Match>
        <Match when={component() === "NumberBox"}>
          <input
            onchange={(e: any) => {
              props.setValue
                ? props.setValue(e.target.value)
                : setValueGlobal(
                  graph,
                  setGraph,
                  props.txnId,
                  props.meta,
                  props.data!,
                  e.target.value,
                  
                  false,
                );
            }}
            placeholder={props.meta?.P.label ?? ""}
            {...defaultValues()}
            {...deNullify(customMetaProps)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
            type="number"
            value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
          />
          <Error />
        </Match>
        <Match when={component() === "Radio"}>
          <Radio
            {...defaultValues()}
            {...deNullify(customMetaProps)}
            // name={props.meta?.P.label ?? "radio"}
            align="left"
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
            // value={props.data?.P[props.meta.P[IdAttr]] ?? ""}
            onchange={(e: any) => {
              props.setValue
                ? props.setValue(e.target.checked)
                : setValueGlobal(
                  graph,
                  setGraph,
                  props.txnId,
                  props.meta,
                  props.data!,
                  e.target.checked,
                  
                  false,
                );
            }}
          >
            {props.meta?.P.label ?? "radio"}
          </Radio>
          <Error />
        </Match>
        <Match when={component() === "ProgressBar"}>
          <input
            style={{ ...props.meta?.P }}
            type="progress"
            {...defaultValues()}
            {...deNullify(customMetaProps)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
          />
          <Error />
        </Match>
        <Match when={component() === "SelectBox"}>
          <MultiSelectField
            {...defaultValues()}
            disable={props.disabled}
            displayValueChild="name"
            displayValueParent="P"
            onRemove={(e: any) => {
              props.setValue
                ? props.setValue(e.target.value)
                : setValueGlobal(
                  graph,
                  setGraph,
                  props.txnId,
                  props.meta,
                  props.data!,
                  e.target.value,
                  
                  false,
                );
            }}
            onSelect={(e: any) => {
              props.setValue
                ? props.setValue(e.target.value)
                : setValueGlobal(
                  graph,
                  setGraph,
                  props.txnId,
                  props.meta,
                  props.data!,
                  e.target.value,
                  
                  false,
                );
            }}
            options={props.meta?.P.options ?? []}
            placeholder={props.meta?.P.placeholder ?? "Select Item"}
            selectedValues={() => [props.data?.P[props.meta.P[IdAttr]]]}
            selectionLimit={1}
          />
          <Error />
        </Match>
        <Match when={component() === "RadioGroup"}>
          <RadioGroup>
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </RadioGroup>
          <Error />
        </Match>

        <Match when={component() === "TextArea"}>
          <textarea
            {...defaultValues()}
            {...deNullify(customMetaProps)}
            class={`${mergeCSS(defaultValues().class, props.meta.P.class)}`}
            onchange={(e: any) => {
              props.setValue
                ? props.setValue(e.target.value)
                : setValueGlobal(
                  graph,
                  setGraph,
                  props.txnId,
                  props.meta,
                  props.data!,
                  e.target.value,
                  
                  false,
                );
            }}
            placeholder={props.meta?.P.label ?? props.title}
            rows={props.meta?.P.rows ?? 4}
            value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
          />
          <Error />
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
          <input
            type="text"
            {...defaultValues()}
            {...deNullify(customMetaProps)}
            class={`${mergeCSS(defaultValues().class, props.meta.P.class)}`}
            onchange={(e: any) => {
              props.setValue
                ? props.setValue(e.target.value)
                : setValueGlobal(
                  graph,
                  setGraph,
                  props.txnId,
                  props.meta,
                  props.data!,
                  e.target.value,
                  
                  false,
                );
            }}
            placeholder={props.meta?.P.label ?? props.title}
            value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
          />
          <Error />
          <ExpressionBuilder
            component={component()}
            content={props.data?.P[props.meta.P[IdAttr]]}
            data={props.data}
            meta={props.meta}
            setValue={
              props.setValue
                ? props.setValue
                : (value) =>
                  setValueGlobal(
                    graph,
                    setGraph,
                    props.txnId,
                    props.meta,
                    props.data!,
                    value,
                    
                    false,
                  )
            }
            title={props.title}
            txnId={props.txnId}
          />
        </Match>
        <Match when={component() === "TextBox"}>
          <input
            type="text"
            {...defaultValues()}
            {...deNullify(customMetaProps)}
            class={`${mergeCSS(defaultValues().class, props.meta.P.class)}`}
            onchange={(e: any) => {
              props.setValue
                ? props.setValue(e.target.value)
                : setValueGlobal(
                  graph,
                  setGraph,
                  props.txnId,
                  props.meta,
                  props.data!,
                  e.target.value,
                  
                  false,
                );
            }}
            placeholder={props.meta?.P.label ?? props.title}
            value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
          />
          <Error />
        </Match>
        <Match when={component() === "SignatureBox"}>
          <Signature />
          <Error />
        </Match>

      </Switch>
    </Show>
  );
}

// Note:
// what if some properties are removed from meta.
// We should remember previous keys and remove when some keys are changed.

