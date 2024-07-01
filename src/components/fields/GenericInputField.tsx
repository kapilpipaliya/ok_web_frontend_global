import { createMemo, Match, Show, splitProps, Switch, useContext } from "solid-js";

import { GraphContext, IdAttr } from "~/lib/graph/graph";
import {


  Radio,
  RadioGroup,
} from "~/components/solid_blocks";
import { FileUploader } from "~/components/solid_blocks/FileUploader";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { ExpressionBuilder } from "~/components/ExpressionBuilder";
import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import type { ComponentProps } from "~/components/fields/ComponentType";
import { MultiSelectField } from "~/components/MultiSelect";
import { getViewValue } from "~/lib/graph/get/sync/getViewValue";
import { getCompProps } from "~/lib/graph/get/sync/getProps";
import { deNullify, ifNotNull } from "~/lib/utils";
import { mergeCSS } from "~/components/css_properties/cssUtils";
import { Signature } from "../SignatureBox";

export function GenericInputField(
  props: ComponentProps & {
    component?: string; // depricated
    componentName?: string;
    title: string;
    txnId: number;
    applyDefaults?: boolean;
  },
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
      when={!props.disabled}
      fallback={getViewValue(props.data?.P[props.meta.P[IdAttr]])}
    >
      <Switch>
        <Match when={component() === "CheckBox"}>
          <input
            type="checkbox"
            {...defaultValues()}
            {...deNullify(customMetaProps)}
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
            checked={
              props.data?.P[props.meta.P[IdAttr]] ??
              props.meta?.P.checked
            }
          />
          <Error />
          <PageAttrRender metaVertex={props.meta} data={props.data} />
        </Match>
        <Match when={component() === "ColorBox"}>
          <input
            type="color"
            {...defaultValues()}
            {...deNullify(customMetaProps)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
            value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
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
            placeholder={props.meta?.P.label ?? ""}
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
            // name={props.meta?.P.label ?? "radio"}
            align="left"
          >
            {props.meta?.P.label ?? "radio"}
          </Radio>
          <Error />
        </Match>
        <Match when={component() === "ProgressBar"}>
          <input
            type="progress"
            style={{ ...props.meta?.P }}
            {...defaultValues()}
            {...deNullify(customMetaProps)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
          />
          <Error />
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
            selectedValues={() => [props.data?.P[props.meta.P[IdAttr]]]}
            placeholder={props.meta?.P.placeholder ?? "Select Item"}
            disable={props.disabled}
            displayValueParent="P"
            displayValueChild="name"
            selectionLimit={1}
          />
          <Error />
        </Match>
        <Match when={component() === "RadioGroup"}>
          <RadioGroup>
            <PageAttrRender metaVertex={props.meta} data={props.data} />
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
                    props.txnId,
                    props.meta,
                    props.data!,
                    value,
                    
                    false,
                  )
            }
          />
        </Match>
        <Match when={component() === "TextBox"}>
          <input
            type="text"
            {...defaultValues()}
            {...deNullify(customMetaProps)}
            class={`${mergeCSS(defaultValues().class, props.meta.P.class)}`}
            placeholder={props.meta?.P.label ?? props.title}
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

