import { BooleanInputField, Button, TextInputField } from "ok_web_components";
import {
  bindOwner,
  createFormArray,
  createFormControl,
  createFormGroup,
  IFormControl,
} from "solid-forms";
import { batch, createSignal, createUniqueId, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { createAsyncOptions, Select } from "@thisbeyond/solid-select";

import {
  addCollection,
  addFormLayout,
  fetchCollectionData,
  fetchDocument,
  updateCollection,
  updateFormLayout,
} from "./api";
import {
  closestCenter,
  createSortable,
  DragDropProvider,
  DragDropSensors,
  DragEventHandler,
  SortableProvider,
} from "@thisbeyond/solid-dnd";
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

interface FormLayoutEditorProps {
  id?: string;
}

export const FormLayoutEditor = (props: FormLayoutEditorProps) => {
  const params = useParams();
  const navigate = useNavigate();
  const formLayoutHasAttributesControl = createFormArray([]);
  const [sortedKeys, setSortedKeys] = createSignal([]);
  const newRow = (obj?: { [key: string]: any }) => {
    return createFormGroup({
      _key: createFormControl(obj?._key || createUniqueId()),
      attribute: createFormControl(obj?.attribute || ""),
      selector: createFormControl(obj?.selector || null), //if undefined its internal createEffect not applied
      type: createFormControl(obj?.type || ""),
      label: createFormControl(obj?.label || ""),
      internal: createFormControl(obj?.internal || false),
      required: createFormControl(obj?.required || false),
      props: createFormControl(obj?.props || {}),
      relation: createFormControl(obj?.relation || {}),
    });
  };
  const addNew = bindOwner(() => {
    batch(() => {
      formLayoutHasAttributesControl.push(newRow());
      setSortedKeys((prev) => [...prev, createUniqueId()]);
    });
  });

  if (params.id && params.id !== "new") {
    fetchDocument("formLayouts", params.id).then((body) => {
      if (body.success) {
        _key.setValue(body.data._key);
        body.data.attributes.forEach((attribute) =>
          formLayoutHasAttributesControl.push(newRow(attribute))
        );
        setSortedKeys(body.data.attributes.map((a) => a._key));
      }
    });
  }
  const fetchData = async (inputValue: string): Promise<any> => {
    return fetchCollectionData("attributes").then((d) => d.data);
  };

  const selectOptionProps = createAsyncOptions(fetchData);
  console.log(selectOptionProps);
  const types = {
    _key: createFormControl(createUniqueId()),
    id: "text",
    selector: "text",
    type: "text",
    internal: "checkbox",
    label: "text",
    props: "json",
    relation: "json",
    required: "checkbox",
  };

  // Todo dont allow duplicate value in the select field
  const SortableRow = (p: { index: () => number; metaKey: string }) => {
    const sortable = createSortable(p.metaKey);

    const clearControl = (id: string) => {
      formLayoutHasAttributesControl.controls[p.index()].controls[id].setValue(undefined);
    };

    const onSelectChange = (control: IFormControl) => (selected: null | string) => {
      control.setValue(selected);
    };

    return (
      <Show when={formLayoutHasAttributesControl.controls[p.index()]}>
        <tr
          use:sortable
          class="group sortable"
          classList={{ "opacity-25": sortable.isActiveDraggable }}
        >
          <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
            {/* <DynGlyph x="swap_vert" class="hidden group-hover:block" /> */}
          </td>
          <td class="whitespace-nowrap px-1 py-2 text-sm text-gray-500">
            <TextInputField
              label=""
              control={formLayoutHasAttributesControl.controls[p.index()].controls._key}
              type={"text"}
              suffixElement={
                <button type="button" onclick={() => clearControl("_key")}>
                  x
                </button>
              }
            />
          </td>
          <td
            class={css`
              display: flex;
            `}
          >
            <Select
              {...selectOptionProps}
              initialValue={
                formLayoutHasAttributesControl.controls[p.index()].controls.attribute.value
              }
              onChange={onSelectChange(
                formLayoutHasAttributesControl.controls[p.index()].controls.attribute
              )}
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
          </td>
          <td>
            <TextInputField
              label=""
              control={formLayoutHasAttributesControl.controls[p.index()].controls.selector}
              type={"text"}
              suffixElement={
                <button type="button" onclick={() => clearControl("selector")}>
                  x
                </button>
              }
            />
          </td>
          <td>
            <TextInputField
              label=""
              control={formLayoutHasAttributesControl.controls[p.index()].controls.type}
              type={"text"}
              suffixElement={
                <button type="button" onclick={() => clearControl("type")}>
                  x
                </button>
              }
            />
          </td>
          <td>
            <TextInputField
              label=""
              control={formLayoutHasAttributesControl.controls[p.index()].controls.label}
              type={"text"}
              suffixElement={
                <button type="button" onclick={() => clearControl("label")}>
                  x
                </button>
              }
            />
          </td>
          <td>
            <BooleanInputField
              label=""
              control={formLayoutHasAttributesControl.controls[p.index()].controls.internal}
            />
          </td>
          <td>
            <BooleanInputField
              label=""
              control={formLayoutHasAttributesControl.controls[p.index()].controls.required}
            />
          </td>
          {/* <td }/>}</td> */}
          {/* <td }/>}</td> */}
          <td>
            <button onclick={(_) => formLayoutHasAttributesControl.removeControl(p.index())}>
              x
            </button>
          </td>
        </tr>
      </Show>
    );
  };

  const [activeDragItem, setActiveDragItem] = createSignal<number | string | null>(null);
  const ids = () => sortedKeys();
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
      }
    }
    setActiveDragItem(null);
  };
  const onSubmit = () => {
    if (params.id && params.id !== "new") {
      updateFormLayout(_key.value, formLayoutHasAttributesControl.value)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      addFormLayout(_key.value, formLayoutHasAttributesControl.value)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.error(err);
        });
    }

    console.log({ name: _key.value });
    console.log([...formLayoutHasAttributesControl.value]);
  };

  const _key = createFormControl("");

  return (
    <div>
      {/* <SectionHeaderWithAction border-b={false}> */}
      {/* <h3 >Layout Editor</h3> */}
      {/* </SectionHeaderWithAction> */}
      <div>
        <div>
          <TextInputField control={_key} label={"Key"}></TextInputField>
        </div>
        <Button text={"Add New"} onclick={addNew} color="primary" size="md" variant="solid" />
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
              <th>key</th>
              <th>Attributes</th>
              <th>Selector</th>
              <th>Type</th>

              <th>Label</th>
              <th>Internal</th>
              <th>Required</th>
              {/* <th >Props</th> */}
              {/* <th >Relation</th> */}
              <th></th>
            </tr>
          </thead>
          <tbody>
            <DragDropProvider
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              collisionDetectionAlgorithm={closestCenter}
            >
              <DragDropSensors />
              <SortableProvider ids={ids()}>
                <For each={sortedKeys()} fallback={<div>No Attributes</div>}>
                  {(key, index) => <SortableRow index={index} metaKey={key} />}
                </For>
              </SortableProvider>
            </DragDropProvider>
          </tbody>
        </table>
      </div>
      <div>
        <Button text={"Submit"} onclick={onSubmit} color="primary" variant="solid" size="md" />
        <Button
          text={"Cancel"}
          onclick={() => history.back()}
          color="primary"
          variant="outline"
          size="md"
        />
      </div>
    </div>
  );
};
