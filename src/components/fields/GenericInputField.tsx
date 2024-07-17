import { Match, Show, Switch, splitProps } from "solid-js";

import type { ComponentProps } from "~/components/fields/ComponentType";

import { ExpressionBuilder } from "~/components/ExpressionBuilder";
import { MultiSelectField } from "~/components/MultiSelect";
import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import { FileUploader } from "~/components/solid_blocks/FileUploader";
import { Radio, RadioGroup } from "~/components/solid_blocks/radio/radio";
import { getViewValue } from "~/lib/graph/get/sync/getViewValue";
import { IdAttr, useGraph } from "~/lib/graph/graph";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { deNullify, ifNotNull } from "~/lib/utils";

import { Signature } from "../SignatureBox";
import { mergeCSS } from "../css_properties/utils/mergeCSS";

export function GenericInputField(
  props: {
    component?: string; // deprecated
    componentName?: string;
    disabled?: boolean;
    title: string;
    txnId: number;
  } & ComponentProps,
) {
  const [graph, setGraph] = useGraph();
  const component = () =>
    props.component ?? props.componentName ?? props.meta.P.component;

  const handleChange = (value: any) => {
    if (props.setValue) {
      props.setValue(value);
    } else {
      setValueGlobal(graph, setGraph, props.txnId, props.meta, props.data!, value, false);
    }
  };

  const DisplayError = () => (
    <Show when={props.meta.P.error}>
      <div class="fg:rgb(255,0,0)">{props.meta.P.error}</div>
    </Show>
  );

  const [select, customMetaProps] = splitProps(props.meta.P, ["validation"]);

  return (
    <Show
      fallback={getViewValue(props.data?.P[props.meta.P[IdAttr]])}
      // when={!props.disabled}
      when={true}
    >
      <Switch>
        <Match when={component() === "CheckBox"}>
          <input
            type="checkbox"
            {...deNullify(customMetaProps)}
            checked={props.data?.P[props.meta.P[IdAttr]] ?? props.meta?.P.checked}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
            onchange={(e: any) => handleChange(e.target.checked)}
          />
          <DisplayError />
          <PageAttrRender data={props.data} metaVertex={props.meta} />
        </Match>
        <Match when={component() === "ColorBox"}>
          <input
            type="color"
            {...deNullify(customMetaProps)}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
            onInput={(e) => handleChange(e.target.value)}
            value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
          />
          <DisplayError />
        </Match>
        <Match when={component() === "DropDownBox"}>Dropdown</Match>
        <Match when={component() === "FileUploader"}>
          <FileUploader
            {...deNullify(customMetaProps)}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
            image={props.meta?.P.image}
          />
          <DisplayError />
        </Match>
        <Match when={component() === "HtmlEditor"}>
          {props.data?.P[props.meta.P[IdAttr]]}
          <DisplayError />
        </Match>
        <Match when={component() === "NumberBox"}>
          <input
            onchange={(e: any) => handleChange(e.target.value)}
            placeholder={props.meta?.P.label ?? ""}
            {...deNullify(customMetaProps)}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
            type="number"
            value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
          />
          <DisplayError />
        </Match>
        <Match when={component() === "Radio"}>
          <Radio
            {...deNullify(customMetaProps)}
            // name={props.meta?.P.label ?? "radio"}
            align="left"
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
            // value={props.data?.P[props.meta.P[IdAttr]] ?? ""}
            onchange={(e: any) => handleChange(e.target.checked)}
          >
            {props.meta?.P.label ?? "radio"}
          </Radio>
          <DisplayError />
        </Match>
        <Match when={component() === "SelectBox"}>
          <MultiSelectField
            disable={props.disabled}
            displayValueKey="::'P.displayName'||::'P.name'||::'P.id'"
            onRemove={(value: any) => handleChange(value)}
            onSelect={(value: any) => handleChange(value)}
            optionValueKey="id"
            options={props.meta?.P.options ?? []}
            placeholder={props.meta?.P.placeholder ?? "Select Item"}
            selectedValues={() => [props.data?.P[props.meta.P[IdAttr]]]}
            selectionLimit={1}
          />
          <DisplayError />
        </Match>
        <Match when={component() === "RadioGroup"}>
          <RadioGroup disabled={props.disabled}>
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </RadioGroup>
          <DisplayError />
        </Match>
        <Match when={component() === "TextArea"}>
          <textarea
            {...deNullify(customMetaProps)}
            class={`${mergeCSS("", props.meta.P.class)}`}
            disabled={props.disabled}
            onchange={(e: any) => handleChange(e.target.value)}
            rows={props.meta?.P.rows ?? 4}
            value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
          />
          <DisplayError />
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
            {...deNullify(customMetaProps)}
            class={`${mergeCSS("", props.meta.P.class)}`}
            disabled={props.disabled}
            onchange={(e: any) => handleChange(e.target.value)}
            placeholder={props.meta?.P.label ?? props.title}
            value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
          />
          <DisplayError />
          <ExpressionBuilder
            component={component()}
            content={props.data?.P[props.meta.P[IdAttr]]}
            data={props.data}
            disabled={props.disabled}
            meta={props.meta}
            setValue={(value) => handleChange(value)}
            title={props.title}
            txnId={props.txnId}
          />
        </Match>
        <Match when={component() === "TextBox"}>
          <input
            type="text"
            {...deNullify(customMetaProps)}
            class={`${mergeCSS("", props.meta.P.class)}`}
            disabled={props.disabled}
            onchange={(e: any) => handleChange(e.target.value)}
            placeholder={props.meta?.P.label ?? props.title}
            value={ifNotNull(props.data?.P[props.meta.P[IdAttr]])}
          />
          <DisplayError />
        </Match>
        <Match when={component() === "SignatureBox"}>
          <Signature disabled={props.disabled} />
          <DisplayError />
        </Match>
      </Switch>
    </Show>
  );
}

// Note:
// what if some properties are removed from meta.
// We should remember previous keys and remove when some keys are changed.
