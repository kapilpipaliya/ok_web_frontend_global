import { type Component, Match, Show, Switch, createMemo, splitProps } from 'solid-js';

import type { GenericComponentProps } from './FieldType';

export const TextInputField: Component<GenericComponentProps> = (props) => {
  const [local, others] = splitProps(props, ['componentName', 'meta', 'data', 'setValue', 'value', 'isRealTime', 'isTableInside', 'setValue', 'txnId',
  // @ts-expect-error ignore
  'onchange'
  ]);

  const inputTypes = {
    button: 'button',
    checkbox: 'checkbox',
    color: 'color',
    date: 'date',
    'datetime-local': 'datetime-local',
    email: 'email',
    file: 'file',
    image: 'image',
    month: 'month',
    number: 'number',
    password: 'password',
    radio: 'radio',
    range: 'range',
    reset: 'reset',
    search: 'search',
    submit: 'submit',
    tel: 'tel',
    text: 'text',
    time: 'time',
    url: 'url',
    week: 'week',
  };

  const determineInputType = createMemo(() => {
    const name = local.componentName?.toLowerCase() ?? '';
    for (const key in inputTypes) {
      if (name.includes(key)) {
        return inputTypes[key as keyof typeof inputTypes];
      }
    }
    return 'text';
  });

  const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (target.type === 'checkbox') {
      local.setValue?.((target as HTMLInputElement).checked);
    } else {
      local.setValue?.(target.value);
    }
  };

  const DisplayError = () => (
    <Show when={local.meta.P.error}>
      <div class="fg:rgb(255,0,0)">{local.meta.P.error}</div>
    </Show>
  );

  return (
    <>
      <Switch>
        <Match when={/area|html/i.test(local.componentName ?? '')}>
          <textarea {...others} onChange={handleChange} rows={props.meta?.P.rows ?? 4} value={local.value}/>
        </Match>
        <Match when={determineInputType() === 'checkbox'}>
          <input type="checkbox" {...others} checked={local.value} onChange={handleChange} />
        </Match>
        <Match when={true}>
          <input type={determineInputType()} {...others} onChange={handleChange} value={local.value} />
        </Match>
      </Switch>
      <DisplayError />
    </>
  );
};
/*
        <Match when={componentName() === "SelectBox"}>
          <MultiSelectField
            disable={props.disabled}
            displayValueKey="::'P.displayName'||::'P.name'||::'P.id'"
            onRemove={(value: any) => handleChange(value)}
            onSelect={(value: any) => handleChange(value)}
            optionValueKey="id"
            options={props.meta?.P.options ?? []}
            selectedValues={() => [props.data?.P[props.meta.P[IdAttr]]]}
            selectionLimit={1}
          />
          <DisplayError />
        </Match>
        <Match when={componentName() === "RadioGroup"}>
          <RadioGroup disabled={props.disabled}>
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </RadioGroup>
          <DisplayError />
        </Match>
        
        */