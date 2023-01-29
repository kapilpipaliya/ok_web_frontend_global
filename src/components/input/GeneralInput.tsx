import { Match, Switch } from "solid-js";
import { IFormControl } from "solid-forms";
import { TextInputField } from "./TextInputField";
import { BooleanInputField } from "./BooleanInputField";
import { TextAreaField } from "./TextAreaField";
import { JsonInput } from "./JsonInput";

interface Properties {
  control: IFormControl;
  disabled?: boolean;
  dom?: HTMLElement | ((e: HTMLElement) => void);
  h?: boolean;
  hidden?: boolean;
  type?: string;
}

export const GeneralInput = (props: Properties) => {
  if (props.h || props.hidden) {
    return <div />;
  }

  return (
    <Switch fallback={<div>Unknown Component type: {props.type}</div>}>
      <Match when={props.type === "color"}>
        <TextInputField control={props.control} type={"color"} />
      </Match>
      <Match when={props.type === "email"}>
        <TextInputField control={props.control} type={"color"} />
      </Match>
      <Match when={props.type === "number" || props.type === "serial"}>
        <TextInputField control={props.control} type={"number"} />
      </Match>
      <Match when={props.type === "password"}>
        <TextInputField control={props.control} type={"password"} />
      </Match>
      <Match when={props.type === "range"}>
        <TextInputField control={props.control} type={"range"} />
      </Match>
      <Match when={props.type === "search"}>
        <TextInputField control={props.control} type={"search"} />
      </Match>
      <Match when={props.type === "text"}>
        <TextInputField control={props.control} type={"text"} />
      </Match>
      <Match when={props.type === "checkbox"}>
        <BooleanInputField control={props.control} />
      </Match>
      <Match when={props.type === "radio"}>
        <TextInputField control={props.control} type={"radio"} />
      </Match>
      <Match when={props.type === "textarea" || props.type === "codemirror"}>
        <TextAreaField control={props.control} type={"text"} />
      </Match>
      <Match when={props.type === "chatInput"}>{/*<ChatInput control={props.control} onChange={e => props.onChange(e.target.value)} />*/}</Match>
      <Match when={props.type === "select"}>
        {/*<SingleSelect*/}
        {/*  inputId={props.control.id}*/}
        {/*  label={props.control.label}*/}
        {/*  value={props.control.value as string}*/}
        {/*  onChange={props.onChange}*/}
        {/*  onBlur={props.control.onBlur}*/}
        {/*  onFocus={props.control.onFocus}*/}
        {/*  required={props.control.isRequired}*/}
        {/*  disabled={props.disabled}*/}
        {/*  error={props.control.error}*/}
        {/*  isInvalid={props.control.error}*/}
        {/*  {...(props.control.options ?? {})}*/}
        {/*/>*/}
      </Match>
      <Match when={props.type === "file"}>{/*<File control={props.control}  />*/}</Match>
      <Match when={props.type === "text_array"}>
        {/*<ArrayInput*/}
        {/*  inputId={props.field.id}*/}
        {/*  label={props.field.label}*/}
        {/*  value={props.field.value as string[]}*/}
        {/*  onChange={props.onChange}*/}
        {/*  onBlur={props.field.onBlur}*/}
        {/*  onFocus={props.field.onFocus}*/}
        {/*  required={props.field.isRequired}*/}
        {/*  disabled={props.disabled}*/}
        {/*  error={props.field.error}*/}
        {/*  isInvalid={props.field.error}*/}
        {/*  {...(props.field.options ?? {})}*/}
        {/*/>*/}
      </Match>
      <Match when={props.type === "multi_select"}>
        {/*<TableForm*/}
        {/*  inputId={props.control.id}*/}
        {/*  label={props.control.label}*/}
        {/*  value={props.control.value as Array<{ _key: string; value: {} }>}*/}
        {/*  onChange={props.onChange}*/}
        {/*  onBlur={props.control.onBlur}*/}
        {/*  onFocus={props.control.onFocus}*/}
        {/*  required={props.control.isRequired}*/}
        {/*  disabled={props.disabled}*/}
        {/*  error={props.control.error}*/}
        {/*  isInvalid={props.control.error}*/}
        {/*  {...(props.control.options ?? {})}*/}
        {/*/>*/}
      </Match>
      <Match when={props.type === "multi_select_bool_properties"}>
        {/*<TableFormBoolProperties*/}
        {/*  inputId={props.control.id}*/}
        {/*  label={props.control.label}*/}
        {/*  value={props.control.value as Array<{ _key: string; value: {} }>}*/}
        {/*  onChange={props.onChange}*/}
        {/*  onBlur={props.control.onBlur}*/}
        {/*  onFocus={props.control.onFocus}*/}
        {/*  required={props.control.isRequired}*/}
        {/*  disabled={props.disabled}*/}
        {/*  error={props.control.error}*/}
        {/*  isInvalid={props.control.error}*/}
        {/*  {...(props.control.options ?? {})}*/}
        {/*/>*/}
      </Match>
      <Match when={props.type === "json_editor"}>
        <JsonInput control={props.control} disabled={props.disabled} />
      </Match>
      <Match when={props.type === "flat_picker"}>
        {/*<DateTimePicker*/}
        {/*  inputId={props.control.id}*/}
        {/*  label={props.control.label}*/}
        {/*  value={props.control.value}*/}
        {/*  onChange={getFirstValue}*/}
        {/*  onBlur={props.control.onBlur}*/}
        {/*  onFocus={props.control.onFocus}*/}
        {/*  required={props.control.isRequired}*/}
        {/*  disabled={props.disabled}*/}
        {/*  f*/}
        {/*  error={props.control.error}*/}
        {/*  isInvalid={props.control.error}*/}
        {/*  {...props.control.options}*/}
        {/*/>*/}
      </Match>
      <Match when={props.type === "uuid"}>
        {/*<UUIDInput value={props.control.value} onChange={props.onChange} onBlur={props.control.onBlur} onFocus={props.control.onFocus} {...(props.control.options ?? {})} />*/}
      </Match>
      <Match when={props.type === "subdomain"}>{/*<SubDomain value={props.control.value} onChange={props.onChange} {...(props.control.options ?? {})} />*/}</Match>
      <Match when={props.type === "url"}>{/*<TextAreaField control={props.control} type={"text"} prefix={"https://"} suffix={props.control.options?.domain ?? ''}/>*/}</Match>
    </Switch>
  );
};
