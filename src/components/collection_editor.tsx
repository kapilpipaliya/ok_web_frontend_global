import { Field, TextInputField } from "ok_web_components";
import { createFormArray, createFormControl, createFormGroup, bindOwner, IFormGroup } from "solid-forms";
import { batch, createSignal, createUniqueId, For, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { fetchAttributes, fetchCollectionData, fetchDocument } from "./api";
import { closestCenter, createSortable, DragDropProvider, DragDropSensors, DragEventHandler, SortableProvider } from "@thisbeyond/solid-dnd";

export interface Attribute {
  _key?: string;
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
interface CollectionEditorProps {
  id: string;
}
export const CollectionEditor = (props: CollectionEditorProps) => {
  const [attributes, setAttributes] = createStore({ data: [] as Attribute[] });
  const [sortedKeys, setSortedKeys] = createSignal(attributes.data.map((a) => a._key));
  const attributesControl = createFormArray([]);
  const addNew = bindOwner(() => {
    batch(() => {
      attributesControl.push(newRow());
      setSortedKeys((prev) => [...prev, createUniqueId()]);
    });
  });

  if (props.id) {
    fetchDocument("collection", props.id).then((data) => {
      if (data.success) {
        // TODO Fix this:
        setAttributes(data.data);
        setSortedKeys(data.data.map((a) => a._key));
      }
    });
  }

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
  const newRow = () => {
    return createFormGroup({
      _key: createFormControl(createUniqueId()),
      id: createFormControl(""),
      selector: createFormControl(""),
      type: createFormControl(""),
      label: createFormControl(""),
      internal: createFormControl(false),
      required: createFormControl(false),
      props: createFormControl({}),
      relation: createFormControl({}),
    });
  };

  const SortableRow = (p: { index: () => number; metaKey: string }) => {
    const sortable = createSortable(p.metaKey);

    return (
      <tr use:sortable class="group sortable" classList={{ "opacity-25": sortable.isActiveDraggable }}>
        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{/* <DynGlyph x="swap_vert" class="hidden group-hover:block" /> */}</td>
        <td class="whitespace-nowrap px-1 py-2 text-sm text-gray-500">
          {<TextInputField label="Key" control={attributesControl.controls[p.index()].controls._key} type={"text"} />}
        </td>
        <td class="whitespace-nowrap px-1 py-2 text-sm text-gray-500">{<TextInputField label="ID" control={attributesControl.controls[p.index()].controls.id} type={"text"} />}</td>
        <td class="whitespace-nowrap px-1 py-2 text-sm text-gray-500">
          {<TextInputField label="Selector" control={attributesControl.controls[p.index()].controls.selector} type={"text"} />}
        </td>
        <td class="whitespace-nowrap px-1 py-2 text-sm text-gray-500">
          {<TextInputField label="Type" control={attributesControl.controls[p.index()].controls.type} type={"text"} />}
        </td>
        <td class="whitespace-nowrap px-1 py-2 text-sm text-gray-500">
          {<TextInputField label="Label" control={attributesControl.controls[p.index()].controls.label} type={"text"} />}
        </td>
        <td class="whitespace-nowrap px-1 py-2 text-sm text-gray-500">
          {<TextInputField label="Internal" control={attributesControl.controls[p.index()].controls.internal} type={"checkbox"} />}
        </td>
        <td class="whitespace-nowrap px-1 py-2 text-sm text-gray-500">
          {<TextInputField label="Required" control={attributesControl.controls[p.index()].controls.required} type={"checkbox"} />}
        </td>
        {/* <td class="whitespace-nowrap px-1 py-2 text-sm text-gray-500">{<TextInputField label="Props" control={attributesControl.controls[p.index()].controls.id} type={"json"}/>}</td> */}
        {/* <td class="whitespace-nowrap px-1 py-2 text-sm text-gray-500">{<TextInputField label="Relation" control={attributesControl.controls[p.index()].controls.id} type={"json"}/>}</td> */}
      </tr>
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
    console.log([...attributesControl.value]);
  };

  const name = createFormControl("");
  return (
    <div>
      {/*<SectionHeaderWithAction border-b={false}>*/}
      {/*  <h3 class="text-lg leading-6 font-medium text-gray-900">Layout Editor</h3>*/}
      {/*</SectionHeaderWithAction>*/}
      <div class="flex gap-2">
        <div class="max-w-xs mb-2">
          <TextInputField control={name} label={"Name"}></TextInputField>
        </div>
        <button onclick={addNew}>Add New</button>
      </div>
      <div class="overflow-x-auto sm:overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"></th>
              <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">key</th>
              <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">ID</th>
              <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Selector</th>
              <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Type</th>

              <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Label</th>
              <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Internal</th>
              <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Required</th>
              {/* <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Props</th> */}
              {/* <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Relation</th> */}
              <th></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <DragDropProvider onDragStart={onDragStart} onDragEnd={onDragEnd} collisionDetectionAlgorithm={closestCenter}>
              <DragDropSensors />
              <SortableProvider ids={ids()}>
                <For each={sortedKeys()} fallback={<div>Loading...</div>}>
                  {(key, index) => <SortableRow index={index} metaKey={key} />}
                </For>
              </SortableProvider>
            </DragDropProvider>
          </tbody>
        </table>
      </div>
      <div class="mt-4 pt-5 border-t border-t-gray-200 flex gap-2">
        <button type="button" class="daisy-btn daisy-btn-primary daisy-btn-sm mr-2" onclick={onSubmit}>
          Submit
        </button>
        <button type="button" class="daisy-btn daisy-btn-accent daisy-btn-sm" onClick={onSubmit}>
          Cancel
        </button>
      </div>
    </div>
  );
};
