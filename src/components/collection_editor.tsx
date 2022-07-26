import { BooleanInputField, Button, TextInputField } from "ok_web_components";

import { bindOwner, createFormArray, createFormControl, createFormGroup, IFormControl, IFormGroup } from "solid-forms";
import { batch, createEffect, createMemo, createSignal, createUniqueId, For, getOwner, runWithOwner, Show } from "solid-js";
import { createAsyncOptions, Select } from "@thisbeyond/solid-select";
import "./select.css";
import { addCollection, fetchCollectionData, fetchDocument, updateCollection } from "./api";
import { closestCenter, createSortable, DragDropProvider, DragDropSensors, DragEventHandler, SortableProvider } from "@thisbeyond/solid-dnd";

import { Option } from "@thisbeyond/solid-select/dist/types/create-select";
import { css } from "solid-styled-components";
import { useNavigate, useParams } from "solid-app-router";

export interface Attribute {
  _key?: string;
  attribute: string;
  id: string;
  selector: string;
  type: string;
  internal: boolean;
  label: string;
  props: Props;
  relation: Relation;
  required: boolean;
}

export interface Props {
  e?: number;
  a?: number;
}

export interface Relation {
  rel?: number;
  a?: number;
  b?: number;
}

interface CollectionEditorProps { }

export const CollectionEditor = (props: CollectionEditorProps) => {
  const params = useParams();

  const collectionHasAttributesControl = createFormArray([]);
  const [sortedIds, setSortedKeys] = createSignal([]);
  function newCollectionHasAttributeRow(obj?: { [key: string]: any }, isEdit = false) {
    return createFormGroup({
      _id: createFormControl(obj?._id || createUniqueId(), { disabled: true }),
      _key: createFormControl(obj?._key, { readonly: isEdit && params.id && params.id !== "new" ? true : false }),
      pos: createFormControl(obj?.pos || collectionHasAttributesControl.controls.length + 1),
      attribute: createFormControl(obj?.attribute),
      id: createFormControl(obj?.id),
      selector: createFormControl(obj?.selector),
      type: createFormControl(obj?.type),
      label: createFormControl(obj?.label),
      internal: createFormControl(obj?.internal),
      unique: createFormControl(obj?.unique),
      required: createFormControl(obj?.required),
      readonly: createFormControl(obj?.readonly),
      props: createFormControl(obj?.props),
      relation: createFormControl(obj?.relation),
    });
  }
  const addCollectionHasAttributeNew = bindOwner(() => {
    batch(function () {
      const groupControl = newCollectionHasAttributeRow();
      collectionHasAttributesControl.push(groupControl);
      setSortedKeys((prev) => [...prev, groupControl.controls._id.value]);
    });
  });
  const isEdit = () => params.id && params.id !== "new"
  if (isEdit()) {
    const owner = getOwner();
    fetchDocument("collections", params.id).then((data) => {
      if (data.success) {
        _key.setValue(data.data._key);
        // batch not work here:
        runWithOwner(owner, () => {
          data.data.attributes.forEach((attribute) => collectionHasAttributesControl.push(newCollectionHasAttributeRow(attribute, true)));
        });
        setSortedKeys(data.data.attributes.map((a) => a._id));
      }
    });
  }
  const fetchData = async (inputValue: string): Promise<any> => {
    return fetchCollectionData("attributes").then((d) => d.data);
  };

  const selectOptionProps = createAsyncOptions(fetchData);

  const [normalizedSelectOptions, setNormalizedSelectOptions] = createSignal({});
  createEffect(() => {
    if (selectOptionProps.options) {
      setNormalizedSelectOptions(
        selectOptionProps.options.reduce((acc, curr) => {
          acc[curr._key] = curr;
          return acc;
        }, {})
      );
    }
  });

  // const types = {
  //   _key: createFormControl(createUniqueId()),
  //   id: "text",
  //   pos: "integer",
  //   selector: "text",
  //   type: "text",
  //   internal: "checkbox",
  //   label: "text",
  //   props: "json",
  //   relation: "json",
  //   required: "checkbox",
  // };

  // Todo dont allow duplicate value in the select field
  const SortableRow = (p: { metaId: string }) => {
    const sortable = createSortable(p.metaId);

    const control = createMemo<IFormGroup>(() => collectionHasAttributesControl.controls.find((control) => control.controls._id.value === p.metaId));

    const setValue = (id: string, value: any) => {
      control().controls[id].setValue(value);
    };
    const clearControl = (id: string) => {
      control().controls[id].setValue(undefined);
    };

    const onSelectChange = (control: IFormControl) => (selected: null | string) => {
      control.setValue(selected);
    };

    return (

      <Show when={control()}>
        {/* @ts-ignore */}
        <tr use:sortable class="" classList={{ "opacity-25": sortable.isActiveDraggable }}>
          <td>{/* <DynGlyph x="swap_vert" class="hidden group-hover:block" /> */}</td>
          <td
            class={css`
              max-width: 100px;
            `}
          >
            <TextInputField label="" control={control().controls.pos as IFormControl} type={"number"} />
          </td>
          <td>
            <div
              class={css`
                display: flex;
              `}
            >
              <Select
                {...selectOptionProps}
                initialValue={control().controls.attribute.value}
                onChange={onSelectChange(control().controls.attribute as IFormControl)}
                optionToValue={(option: Option) => {
                  return option._key; // ["id"]
                }}
                format={(optionOrValue, type) => {
                  // value is displayed in the input; option is displayed in the list
                  return type === "option" ? optionOrValue._key : optionOrValue;
                }}
              />
              <button type="button" onclick={() => clearControl("attribute")}>
                x
              </button>
            </div>
          </td>
          <td>
            <div
              class={css`
                display: flex;
              `}
            >
              <TextInputField label="" control={control().controls._key as IFormControl} type={"text"} />
              <Show when={!control().controls._key.isReadonly}>
                <button type="button" onclick={() => clearControl("_key")}>
                  x
                </button>
              </Show>
            </div>
          </td>
          <td>
            <div
              class={css`
                display: flex;
              `}
            >
              {normalizedSelectOptions()?.[control().controls.attribute.value]?.["id"]}
              <Show
                when={control().controls.id.value === undefined}
                fallback={
                  <>
                    <TextInputField label="" control={control().controls.id as IFormControl} type={"text"} />
                    <button type="button" onclick={() => clearControl("id")}>
                      x
                    </button>
                  </>
                }
              >
                <button type="button" onclick={() => setValue("id", "")}>
                  O
                </button>
              </Show>
            </div>
          </td>
          <td>
            <div
              class={css`
                display: flex;
              `}
            >
              {normalizedSelectOptions()?.[control().controls.attribute.value]?.["selector"]}
              <Show
                when={control().controls.selector.value === undefined}
                fallback={
                  <>
                    <TextInputField label="" control={control().controls.selector as IFormControl} type={"text"} />
                    <button type="button" onclick={() => clearControl("selector")}>
                      x
                    </button>
                  </>
                }
              >
                <button type="button" onclick={() => setValue("selector", "")}>
                  O
                </button>
              </Show>
            </div>
          </td>
          <td>
            <div
              class={css`
                display: flex;
              `}
            >
              {normalizedSelectOptions()?.[control().controls.attribute.value]?.["type"]}
              <Show
                when={control().controls.type.value === undefined}
                fallback={
                  <>
                    <TextInputField label="" control={control().controls.type as IFormControl} type={"text"} />
                    <button type="button" onclick={() => clearControl("type")}>
                      x
                    </button>
                  </>
                }
              >
                <button type="button" onclick={() => setValue("type", "")}>
                  O
                </button>
              </Show>
            </div>
          </td>
          <td>

            <div
              class={css`
                display: flex;
              `}
            >
              {normalizedSelectOptions()?.[control().controls.attribute.value]?.["label"]}
              <Show
                when={control().controls.label.value === undefined}
                fallback={
                  <>
                    <TextInputField label="" control={control().controls.label as IFormControl} type={"text"} />
                    <button type="button" onclick={() => clearControl("label")}>
                      x
                    </button>
                  </>
                }
              >
                <button type="button" onclick={() => setValue("label", "")}>
                  O
                </button>
              </Show>
            </div>
          </td>
          <td>

            <div
              class={css`
                display: flex;
              `}
            >
              {normalizedSelectOptions()?.[control().controls.attribute.value]?.["internal"] ? "true" : "false"}
              <Show
                when={control().controls.internal.value === undefined}
                fallback={
                  <>
                    <BooleanInputField label="" control={control().controls.internal as IFormControl} />
                    <button type="button" onclick={() => clearControl("internal")}>
                      x
                    </button>
                  </>
                }
              >
                <button type="button" onclick={() => setValue("internal", "")}>
                  O
                </button>
              </Show>
            </div>
          </td>
          <td>

            <div
              class={css`
                display: flex;
              `}
            >
              {normalizedSelectOptions()?.[control().controls.attribute.value]?.["unique"] ? "true" : "false"}
              <Show
                when={control().controls.unique.value === undefined}
                fallback={
                  <>
                    <BooleanInputField label="" control={control().controls.unique as IFormControl} />
                    <button type="button" onclick={() => clearControl("unique")}>
                      x
                    </button>
                  </>
                }
              >
                <button type="button" onclick={() => setValue("unique", "")}>
                  O
                </button>
              </Show>
            </div>
          </td>
          <td>
            <div
              class={css`
                display: flex;
              `}
            >
              {normalizedSelectOptions()?.[control().controls.attribute.value]?.["required"] ? "true" : "false"}
              <Show
                when={control().controls.required.value === undefined}
                fallback={
                  <>
                    <BooleanInputField label="" control={control().controls.required as IFormControl} />
                    <button type="button" onclick={() => clearControl("required")}>
                      x
                    </button>
                  </>
                }
              >
                <button type="button" onclick={() => setValue("required", "")}>
                  O
                </button>
              </Show>
            </div>
          </td>
          <td>

            <div
              class={css`
                display: flex;
              `}
            >
              {normalizedSelectOptions()?.[control().controls.attribute.value]?.["readonly"] ? "true" : "false"}
              <Show
                when={control().controls.readonly.value === undefined}
                fallback={
                  <>
                    <BooleanInputField label="" control={control().controls.readonly as IFormControl} />
                    <button type="button" onclick={() => clearControl("readonly")}>
                      x
                    </button>
                  </>
                }
              >
                <button type="button" onclick={() => setValue("readonly", "")}>
                  O
                </button>
              </Show>
            </div>
          </td>
          {/* TODO: <td /></td> */}
          {/* TODO: <td /></td> */}
          <td>
            <button onclick={(_) => collectionHasAttributesControl.removeControl(control())}>x</button>
          </td>
        </tr>
      </Show>
    );
  };

  const [activeDragItem, setActiveDragItem] = createSignal<number | string | null>(null);
  const ids = () => sortedIds();
  const onDragStart: DragEventHandler = ({ draggable }) => {
    setActiveDragItem(draggable.id);
  };
  const onDragEnd: DragEventHandler = ({ draggable, droppable }) => {
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
          // collectionHasAttributesControl.controls.splice(toIndex, 0, ...collectionHasAttributesControl.controls.splice(fromIndex, 1));
          updatedItems.forEach((_id, index) => {
            const control = collectionHasAttributesControl.controls.find((control) => control.controls._id.value === _id);
            control.controls.pos.setValue(index + 1);
          });
        });
        // });
      }
    }
    setActiveDragItem(null);
  };
  const onSubmit = () => {
    if (params.id && params.id !== "new") {
      updateCollection(_key.value, collectionHasAttributesControl.value)
        .then((res) => {
          if (res.success)
            console.log(res);
          else
            alert(res.error)
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      addCollection(_key.value, collectionHasAttributesControl.value)
        .then((res) => {
          if (res.success)
            console.log(res);
          else
            alert(res.error)
        })
        .catch((err) => {
          console.error(err);
        });
    }

  };

  const _key = createFormControl("", { readonly: params.id && params.id !== "new" ? true : false });

  return (
    <div>
      {/* <SectionHeaderWithAction border-b={false}> */}
      {/* <h3 >Layout Editor</h3> */}
      {/* </SectionHeaderWithAction> */}
      <div>
        <div>
          <TextInputField control={_key} label={"Key"}></TextInputField>
        </div>
        <Button text={"Add New"} onclick={addCollectionHasAttributeNew} color="primary" size="md" />
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
              <th>Pos</th>
              <th>Attributes</th>
              <th>key (Optional)</th>
              <th>ID</th>
              <th>Selector</th>
              <th>Type</th>

              <th>Label</th>
              <th>Internal</th>
              <th>Unique</th>
              <th>Required</th>
              <th>Read Only</th>
              {/*TODO: <th >Props</th> */}
              {/* <th >Relation</th> */}
              <th></th>
            </tr>
          </thead>
          <tbody>

            {/* @ts-ignore */}
            <DragDropProvider onDragStart={onDragStart} onDragEnd={onDragEnd} collisionDetectionAlgorithm={closestCenter}>
              <DragDropSensors />
              {/* @ts-ignore */}
              <SortableProvider ids={ids()}>
                <For each={sortedIds()} fallback={<div>No Attributes</div>}>
                  {(_id) => <SortableRow metaId={_id} />}
                </For>
              </SortableProvider>
            </DragDropProvider>
          </tbody>
        </table>
      </div>
      <div>
        <Button text={"Submit"} onclick={onSubmit} color="primary" size="md" />
        <Button text={"Cancel"} onclick={() => history.back()} color="primary" size="md" />
      </div>
    </div>
  );
};
// TODO: add two columns 1.props 2.relation
// default value is {}
// when click on "O" button dislpay a "*" gear icon.
// when click on a gear icon display a modal with json editor and save button.
// on hover of gear icon show existing json.
