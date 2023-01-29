import { JSX, Component, batch, createMemo, createSignal, For, getOwner, runWithOwner, Show, splitProps, Switch, Match, JSXElement } from "solid-js";
import {Dynamic} from 'solid-js/web';
import {ulid} from 'ulid'
import {BooleanInputField} from "./BooleanInputField";
import {TextInputField} from "./TextInputField";
import { Icon } from '@iconify-icon/solid';

import { bindOwner, createFormArray, createFormControl, createFormGroup, IFormControl, IFormGroup } from "solid-forms";
import { closestCenter, createSortable, DragDropProvider, DragDropSensors, DragEventHandler, SortableProvider } from "@thisbeyond/solid-dnd";
import {css} from "solid-styled-components";
import {getDefaultValue} from "../../utils/form";
import {SelectInputField} from "./SelectInputField2";
import {A, D} from "@mobily/ts-belt";
import {
  FieldAttribute,
  SelectField,
  TableField,
  TableFieldAttributes,
  FormMetaData,
  FormResult,
  ServerFormAttributeType
} from "./Form";
import {klona} from "klona";
import {toTitle} from "case-switcher-js";
import {DEBUG} from "../../utils/config";
import usePopper from "solid-popper";
import {JsonInput} from "./JsonInput";
import { TextAreaField } from "./TextAreaField";
import { NumberInputField } from "./NumberInputField";
const ModalInput = (props: {btnContent: JSXElement; children: JSXElement}) => {
  const [isVisible, setIsVisible] = createSignal(false);
  const [target, setTarget] = createSignal<HTMLDivElement>();
  const [popper, setPopper] = createSignal<HTMLDivElement>();
  usePopper(target, popper, {
    placement: "bottom",
  });
  return <>
    {/* @ts-ignore */}
    <button type="button" ref={setTarget} design="Default" onClick={()=>setIsVisible(true)}>{props.btnContent}</button>
    <Show when={isVisible()}>
      <div ref={setPopper}>
        {props.children}
        {/* @ts-ignore */}
        <button type="button" design="Default" onClick={()=>setIsVisible(false)}>Close</button>
      </div>
    </Show>
  </>
}

export interface TableInputFieldProps {
  control: ReturnType<typeof createFormArray>;
  attributes: FieldAttribute[];
  defaultValue: "undefined" | "default";
  data: any[];
  defaultValueFn: (control: IFormGroup, key: string) => JSXElement;
  type?: string;
  component?: Component<any>;
  formMetaData?: FormMetaData[];
  postSubmit?: (tableItemFormGroup: IFormGroup, values: FormResult) => void
  // all forms options:
  formValues: IFormGroup;
  noSort?: boolean;
  txnId?: number
}

function OverWriteableCell(props: {
  meta: TableFieldAttributes;
  defaultValueFn: (control: IFormGroup, key: string) => JSXElement;
  control: IFormGroup;
  onClearOverWriteClick: () => void;
  onOverwriteClick: () => void;
  children?: JSX.Element;
}) {
  return (
    <Switch>
      <Match when={props.meta.noInput}>
        <td
          class={css`
            max-width: 100px;
          `}
        >
          <div
            class={css`
              max-width: 100px;
              display: flex;
            `}
          >
            {props.defaultValueFn?.(props.control, props.meta.id)}
          </div>
        </td>
      </Match>
      <Match when={props.meta.fieldOptions?.disabled}>
        <td
          class={css`
            max-width: 100px;
          `}
        >
          <div
            class={css`
              max-width: 100px;
              display: flex;
            `}
          >
            {props.defaultValueFn?.(props.control, props.meta.id)}
            {props.children}
          </div>
        </td>
      </Match>
      <Match when={props.meta.noOverWrite}>
        <td
          class={css`
            max-width: 100px;
          `}
        >
          {props.children}
        </td>
      </Match>
      <Match when={props.meta.id}>
        <td>
          <div
            class={css`
              max-width: 100px;
              display: flex;
            `}
          >
            {props.defaultValueFn?.(props.control, props.meta.id)}
            <Show
              when={props.control.controls[props.meta.id].value === undefined}
              fallback={
                <>
                  {props.children}
                  <button type="button" onClick={props.onClearOverWriteClick}>
                    <Icon icon="mdi:close-circle-outline"/>
                  </button>
                </>
              }
            >
              <button type="button" onClick={props.onOverwriteClick}>
                <Icon icon="mdi:debug-step-over"/>
              </button>
            </Show>
          </div>
        </td>
      </Match>
    </Switch>
  );
}

const tableAttributes = (attributes: FieldAttribute[]):FieldAttribute[]  => {
  return [
    // _id is important, used for sorting
    {
      id: "_id",
      serverType: ServerFormAttributeType.String,
      default: (formValues, control, id) => id || ulid(),
      hidden: true
    },
    {id: "id", serverType: ServerFormAttributeType.String, default: (formValues, control, id) => id || ulid(), hidden: true},
    {id: "start", serverType: ServerFormAttributeType.String, hidden: true},
    {id: "end", serverType: ServerFormAttributeType.String, hidden: true},
    {id: "type", serverType: ServerFormAttributeType.String, hidden: true},
    {
      id: "properties",
      component: "Table",
      attributes
    },
  ]
}

export function TableInputField(props: TableInputFieldProps) {
  const [p, customProps] = splitProps(props, ["control", "attributes", "defaultValue", "formValues"]);

  const [sortedIds, setSortedKeys] = createSignal([] as string[]);

  const owner = getOwner();

  function newRow(attributes: FieldAttribute[], obj?: { [key: string]: any }, id?: string) {
    const groupConstructor = attributes.reduce((acc, meta) => {
      runWithOwner(owner!, () => {
        if (meta.component === "Table") {
          acc[meta.id] = createFormArray([]);
        }
        if (meta.id === "properties") {
          acc[meta.id] = newRow((meta as TableField).attributes, obj?.[meta.id], id);
        } else {
          if (meta.default) {
            acc[meta.id] = createFormControl(obj?.[meta.id] === undefined ? meta.default(p.formValues, p.control, id) : obj[meta.id], meta.fieldOptions);
          } else if (p.defaultValue === "undefined") {
            acc[meta.id] = createFormControl(obj?.[meta.id], meta.fieldOptions);
          } else if (p.defaultValue === "default") {
            acc[meta.id] = createFormControl(getDefaultValue(meta.serverType!), meta.fieldOptions);
          }
        }
      });
      return acc;
    }, {} as { [key: string]: IFormControl | ReturnType<typeof createFormArray> | IFormGroup });

    return createFormGroup(groupConstructor);
  }

  const attributes = tableAttributes(p.attributes);
  const addNew = bindOwner(() => {
    batch(function () {
      const groupControl = newRow(attributes);
      props.control.push(groupControl);
      setSortedKeys((prev) => [...prev, groupControl.controls._id.value]);
    });
  });

  if (props.data) {
    const clonedData = props.data.map((att) => {
      const value = D.selectKeys(att, attributes.map(attrMeta => attrMeta.id));
      return newRow(attributes, klona(value), att.id);
    });
    // batch not work here:
    runWithOwner(owner!, () => {
      clonedData.forEach((attribute) => {
        props.control.push(attribute);
      });
    });
    setSortedKeys((props.control.controls as ReadonlyArray<IFormGroup>).map((a) => a.controls._id.value));
  }

  // Todo dont allow duplicate value in the select field
  const SortableRow = (p: { metaId: string }) => {
    const sortable = createSortable(p.metaId);

    const control = createMemo(() => (props.control.controls as ReadonlyArray<IFormGroup>).find((control) => control.controls._id.value === p.metaId));

    const DisplayProperties = (p: { attributes: FieldAttribute[], control: IFormGroup }) => {
      const setValue = (id: string, value: any) => {
        p.control.controls[id].setValue(value);
      };
      const clearControl = (id: string) => {
        p.control.controls[id].setValue(undefined);
      };
      const clearSelectControl = (id: string) => {
        p.control.controls[id].setValue(null);
      };
      return <For each={p.attributes}>
        {(meta) => (
          <Switch>
            <Match when={meta.hidden}>
              <></>
            </Match>
            <Match when={meta.id === "properties"}>
              <DisplayProperties attributes={(meta as TableField).attributes} control={p.control.controls['properties'] as IFormGroup}/>
            </Match>
            <Match when={meta.component === "TextInput" || (!meta.component && meta.serverType === ServerFormAttributeType.String)}>
              <OverWriteableCell
                meta={meta}
                defaultValueFn={props.defaultValueFn}
                control={p.control}
                onClearOverWriteClick={() => clearControl(meta.id)}
                onOverwriteClick={() => setValue(meta.id, "")}
              >
                <TextInputField label="" control={p.control.controls[meta.id] as IFormControl} />
              </OverWriteableCell>
            </Match>
            <Match when={meta.component === "NumberInput" || (!meta.component && (meta.serverType === ServerFormAttributeType.Integer || meta.serverType === ServerFormAttributeType.Float))}>
              <OverWriteableCell
                meta={meta}
                defaultValueFn={props.defaultValueFn}
                control={p.control}
                onClearOverWriteClick={() => clearControl(meta.id)}
                onOverwriteClick={() => setValue(meta.id, "")}
              >
                <NumberInputField label="" control={p.control.controls[meta.id] as IFormControl} />
              </OverWriteableCell>
            </Match>
            <Match when={meta.component === "Select"}>
              <OverWriteableCell
                meta={meta}
                defaultValueFn={props.defaultValueFn}
                control={p.control}
                onClearOverWriteClick={() => clearControl(meta.id)}
                onOverwriteClick={() => clearSelectControl(meta.id)}
              >
                <SelectInputField
                  control={p.control.controls[meta.id] as IFormControl}
                  displayExpr={(meta as SelectField).displayExpr}
                  fetchOptions={async (inputValue: string) => (meta as SelectField).fetchOptions(props.formValues, p.control, inputValue)}
                />
              </OverWriteableCell>
            </Match>
            <Match when={meta.serverType === "Boolean"}>
              <OverWriteableCell
                meta={meta}
                defaultValueFn={props.defaultValueFn}
                control={p.control}
                onClearOverWriteClick={() => clearControl(meta.id)}
                onOverwriteClick={() => setValue(meta.id, false)}
              >
                <BooleanInputField control={p.control.controls[meta.id] as IFormControl}/>
              </OverWriteableCell>
            </Match>
            <Match when={meta.serverType === ServerFormAttributeType.Map || meta.component === "Json"}>
              <td>
                <OverWriteableCell
                  meta={meta}
                  defaultValueFn={props.defaultValueFn}
                  control={p.control}
                  onClearOverWriteClick={() => clearControl(meta.id)}
                  onOverwriteClick={() => setValue(meta.id, {})}
                >
                  <ModalInput btnContent={<Icon icon="material-symbols:edit-square-outline-sharp" />}>
                    <JsonInput control={p.control.controls[meta.id] as IFormControl}/>
                  </ModalInput>
                </OverWriteableCell>
              </td>
            </Match>
            <Match when={meta.component === "JsCode"}>
              <OverWriteableCell
                meta={meta}
                defaultValueFn={props.defaultValueFn}
                control={p.control}
                onClearOverWriteClick={() => clearControl(meta.id)}
                onOverwriteClick={() => setValue(meta.id, "")}
              >
                <ModalInput btnContent={<Icon icon="material-symbols:edit-square-outline-sharp" />}>
                  <TextAreaField control={p.control.controls[meta.id] as IFormControl}/>
                </ModalInput>
              </OverWriteableCell>
            </Match>
          </Switch>
        )}
      </For>
    }

    return (
      <Show when={control()}>
        {/* @ts-ignore */}
        <tr use:sortable class="" classList={{"opacity-25": sortable.isActiveDraggable}}>
          <td>{/* <DynGlyph x="swap_vert" class="hidden group-hover:block" /> */}</td>
          <DisplayProperties attributes={attributes} control={control()!}/>
          <td>
            <button type="button" onclick={(_) => props.control.removeControl(control()!)} title="Delete Row">
              <Icon icon="ion:close-circle-outline"/>
            </button>
          </td>
        </tr>
      </Show>
    );
  };
  const SortableRowForm = (p: { metaId: string }) => {
    const sortable = createSortable(p.metaId);

    const control = createMemo(() => (props.control.controls as ReadonlyArray<IFormGroup>).find((control) => control.controls._id.value === p.metaId));
    if(!control()) return <>Cant Find SortableRow Form</>

    const setValue = (id: string, value: any) => {
      control()!.controls[id].setValue(value);
    };
    const clearControl = (id: string) => {
      control()!.controls[id].setValue(undefined);
    };
    const clearSelectControl = (id: string) => {
      control()!.controls[id].setValue(null);
    };

    return (
      <Show when={control()}>
        {/* @ts-ignore */}
        <div ref={el=>props.noSort ? undefined : sortable(el)} class="border rounded-2 border-gray-300 p-2"
             classList={{"opacity-25": sortable.isActiveDraggable}}>
          <Dynamic component={props.component!} formMetaData={props.formMetaData!}
                   postSubmit={(values: FormResult) => props.postSubmit?.(control()!, values)}
                   id={(control()!.controls['end'] as IFormControl).value}
                   txnId={props.txnId}
          />
          <div>
            <button type="button" onclick={(_) => props.control.removeControl(control()!)} title="Delete Row">
              <Icon icon="ion:close-circle-outline"/>
            </button>
          </div>
        </div>
      </Show>
    );
  };

  const [activeDragItem, setActiveDragItem] = createSignal<number | string | null>(null);
  const ids = () => sortedIds();
  const onDragStart: DragEventHandler = ({draggable}) => {
    setActiveDragItem(draggable.id);
  };
  const onDragEnd: DragEventHandler = ({draggable, droppable}) => {
    if (draggable && droppable) {
      const currentItems = ids();
      const fromIndex = currentItems.indexOf(draggable.id as string);
      const toIndex = currentItems.indexOf(droppable.id as string);
      if (fromIndex !== toIndex) {
        const updatedItems = currentItems.slice();
        updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
        setSortedKeys(updatedItems);
        // runWithOwner(owner, () => {
        batch(() => {
          // Cannot mutate a Store directly
          // props.control.controls.splice(toIndex, 0, ...props.control.controls.splice(fromIndex, 1));
          updatedItems.forEach((_id, index) => {
            const control = (props.control.controls as ReadonlyArray<IFormGroup>).find((control) => control.controls._id.value === _id);
            (control!.controls.properties as IFormGroup).controls.pos.setValue(index + 1);
          });
        });
        // });
      }
    }
    setActiveDragItem(null);
  };

  if (props.type === "form") {
    return (
      <div
        classList={{
          "is-invalid": !!p.control.errors,
          "is-touched": p.control.isTouched,
          "is-required": p.control.isRequired,
          "is-disabled": p.control.isDisabled,
        }}
      >
        <div>
          <div>
            {/* @ts-ignore */}
            <button type="button" design="Default" onclick={addNew}>Add New</button>
          </div>
          <div>
            {/* @ts-ignore */}
            <DragDropProvider onDragStart={onDragStart} onDragEnd={onDragEnd}
                              collisionDetector={closestCenter}>
              <DragDropSensors/>
              {/* @ts-ignore */}
              <SortableProvider ids={ids()}>
                <div class="flex flex-col gap-2">
                  <For each={sortedIds()} fallback={<div>No Attributes</div>}>
                    {(_id) => <SortableRowForm metaId={_id}/>}
                  </For>
                </div>
              </SortableProvider>
            </DragDropProvider>
          </div>
          {DEBUG && JSON.stringify(props.control.value)}
        </div>

        <Show when={p.control.isTouched && !p.control.isValid && p.control.errors}>
          <For each={Object.values(p.control.errors!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>
        </Show>
      </div>
    );
  }

  return (
    <div
      classList={{
        "is-invalid": !!p.control.errors,
        "is-touched": p.control.isTouched,
        "is-required": p.control.isRequired,
        "is-disabled": p.control.isDisabled,
      }}
    >
      <div>
        {/* <SectionHeaderWithAction border-b={false}> */}
        {/* <h3 >Layout Editor</h3> */}
        {/* </SectionHeaderWithAction> */}
        <div>
          {/* @ts-ignore */}
          <button type="button" design="Default" onclick={addNew}>Add New</button>
        </div>
        <div
          class={css`
            table,
            th,
            td {
              border: 1px solid rgba(0, 0, 0, 0.1);
              border-collapse: collapse;
            }
          `}
        >
          <table>
            <thead>
            <tr>
              <th></th>
              <For each={props.attributes}>
                {(attribute) => (
                  <Show when={!attribute.hidden}>
                    <th>{toTitle(attribute.label || attribute.id)}</th>
                  </Show>
                )}
              </For>
              <th></th>
            </tr>
            </thead>
            <tbody>
            {/* @ts-ignore */}
            <DragDropProvider onDragStart={onDragStart} onDragEnd={onDragEnd}
                              collisionDetector={closestCenter}>
              <DragDropSensors/>
              {/* @ts-ignore */}
              <SortableProvider ids={ids()}>
                <For each={sortedIds()} fallback={<div>No Attributes</div>}>
                  {(_id) => <SortableRow metaId={_id}/>}
                </For>
              </SortableProvider>
            </DragDropProvider>
            </tbody>
          </table>
        </div>
        {DEBUG && JSON.stringify(props.control.value)}
      </div>

      <Show when={p.control.isTouched && !p.control.isValid && p.control.errors}>
        <For each={Object.values(p.control.errors!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>
      </Show>
    </div>
  );
}
