import {
  batch,
  createMemo,
  createSignal,
  For,
  getOwner,
  JSX,
  JSXElement,
  Match,
  Show,
  splitProps,
  Switch, useContext
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { ulid } from "ulid";
import { BooleanInputField } from "./BooleanInputField";
import { TextInputField } from "./TextInputField";
import { Icon } from "@iconify-icon/solid";


import {
  closestCenter,
  createSortable,
  DragDropProvider,
  DragDropSensors,
  DragEventHandler,
  SortableProvider
} from "@thisbeyond/solid-dnd";
import { css } from "solid-styled-components";
import { SelectInputField, setSelectionValueOne } from "./SelectInputField";
import {
  FieldAttribute,
  FormResult, Id,
  SelectField,
  DataType, TableField,
  TableFieldAttributes,
  Vertex
} from "./Form";
import { toTitle } from "case-switcher-js";
import { DEBUG } from "../../utils/config";
import usePopper from "solid-popper";
import { JsonInput } from "./JsonInput";
import { TextAreaField } from "./TextAreaField";
import { NumberInputField } from "./NumberInputField";
import {
  addNewVertex, deleteVertex,
  mergeVertexProperties,
  newVertex
} from "../../lib/Vertex";
import { capitalizeFirstLetter } from "../utils";
import { addNewEdge, deleteEdge, newEdge } from "../../lib/Edge";
import {
  commitTransaction,
  commitTxn,
  getNewGraphId,
  graph
} from "../../lib/graph";
import { bindOwner } from "solid-forms";
import { TagField } from "./TagField";
import { WsContext } from "../ws_events_dispatcher";

const ModalInput = (props: { btnContent: JSXElement; children: JSXElement }) => {
  const [isVisible, setIsVisible] = createSignal(false);
  const [target, setTarget] = createSignal<HTMLDivElement>();
  const [popper, setPopper] = createSignal<HTMLDivElement>();
  usePopper(target, popper, {
    placement: "bottom"
  });
  return <>
    <button type="button" ref={setTarget} onClick={()=>setIsVisible(true)}>{props.btnContent}</button>
    <Show when={isVisible()}>
      <div ref={setPopper}>
        {props.children}
        <button type="button" onClick={()=>setIsVisible(false)}>Close</button>
      </div>
    </Show>
  </>
}

export interface TableInputFieldProps {
  txnId: number,
  meta: TableField
  vertex: Vertex;
  commit: boolean

  // attributes: FieldAttribute[];
  // defaultValue: "undefined" | "default";
  // data: any[];
  // defaultValueFn: (control: IFormGroup, key: string) => JSXElement;
  // type?: string;
  // component?: Component<any>;
  // form?: FormMetaData[];
  // postSubmit?: (tableItemFormGroup: IFormGroup, values: FormResult) => void
  //
  // noSort?: boolean;

}

function OverWriteableCell(props: {
  txnId: number;
  cellMeta: TableFieldAttributes;
  defaultValueFn: (joinVertex: Vertex, key: string) => JSXElement;
  onOverwriteClick: () => void;
  children?: JSX.Element;
  joinVertex: Vertex;
  commit: boolean
}) {
  const clearValue = () => {
    mergeVertexProperties(props.txnId, props.joinVertex.id, { [props.cellMeta.id]: undefined });
  };
  return (
   <Switch>
     <Match when={props.cellMeta.noInput}>
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
           {props.defaultValueFn?.(props.joinVertex, props.cellMeta.id)}
          </div>
        </td>
      </Match>
      <Match when={props.cellMeta.disabled}>
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
            {props.defaultValueFn?.(props.joinVertex, props.cellMeta.id)}
            {props.children}
          </div>
        </td>
      </Match>
      <Match when={props.cellMeta.noOverWrite}>
        <td
          class={css`
            max-width: 100px;
          `}
        >
          {props.children}
        </td>
      </Match>
      <Match when={props.cellMeta.id}>
        <td>
          <div
            class={css`
              max-width: 100px;
              display: flex;
            `}
          >
            {props.defaultValueFn?.(props.joinVertex, props.cellMeta.id)}
            <Show
              when={props.joinVertex.properties[props.cellMeta.id] === undefined}
              fallback={
                <>
                  {props.children}
                  <button type="button" onClick={clearValue}>
                    <Icon icon="mdi:close-circle-outline" />
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

function newRow(txnId: number, vertex: Vertex, meta: TableField) {
  const name = capitalizeFirstLetter(meta.id);
  const type = vertex.labels[0] + name;

  const vertexNew = newVertex(getNewGraphId(), [name], {});
  const insertVertex = addNewVertex(txnId, vertexNew);
  if (insertVertex.error) {
    alert(insertVertex.error);
    return;
  }

  const edgeNew = newEdge(getNewGraphId(), type, {}, vertex.id, vertexNew.id);
  const insertEdgeResult = addNewEdge(txnId, edgeNew);
  if (insertEdgeResult.error) {
    alert(insertEdgeResult.error);
    return;
  }
  return edgeNew.id;
}


function getTableValue(vertex: Vertex, attribute: TableField) {
  const type = vertex.labels[0] + capitalizeFirstLetter(attribute.id);
  return (vertex.out_edges[type] || []);
}

export function TableInputField(props: TableInputFieldProps) {
  const { Ws } = useContext(WsContext);

  // const [p, customProps] = splitProps(props, ["vertex"]);

  const [sortedIds, setSortedIds] = createSignal([] as number[]);

  const owner = getOwner();

  // todo check bindOwner and fix it
  const addNew = bindOwner(() => {
    batch(function() {
      const edgeId = newRow(props.txnId, props.vertex, props.meta);
      if(props.commit) commitTxn(props.txnId, Ws);
      if (edgeId) {
        setSortedIds((prev) => [...prev, edgeId]);
      }
    });
  });

  setSortedIds(getTableValue(props.vertex, props.meta));

  // Todo dont allow duplicate value in the select field
  const SortableRow = (p: { edgeId: Id }) => {

    const sortable = createSortable(p.edgeId);
    const edge = graph.edges[p.edgeId];
    if (!edge) return "NO edge Found";

    const joinVertex = graph.vertexes[edge.end];

    const deleteRow = () => {
      // delete all vertex in edges
      const inEdges = joinVertex.in_edges;
      for (const type in inEdges) {
        for (const edgeId of inEdges[type]) {
          const deleteEdgeResult = deleteEdge(props.txnId, edgeId)
          if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
        }
      }
      // delete all outEdges of vertex
      const outEdge = joinVertex.out_edges;
      for (const type in outEdge) {
        for (const edgeId of outEdge[type]) {
          const deleteEdgeResult = deleteEdge(props.txnId, edgeId)
          if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
        }
      }

      // delete vertex:
      deleteVertex(props.txnId, joinVertex.id);
      setSortedIds(prev=>prev.filter(edgeId => edgeId !== p.edgeId))
      if(props.commit) commitTxn(props.txnId, Ws);
    }

    const DisplayProperties = (p: { attributes: FieldAttribute[] }) => {
      const setValue = (attribute: FieldAttribute, value: any) => {
        mergeVertexProperties(props.txnId, joinVertex.id, { [attribute.id]: value });
        if(props.commit) commitTxn(props.txnId, Ws);
      };

      // TODO: Fix all setValue functions, it should set as undefined or null, make sure all components support null.
      return <For each={p.attributes}>
        {(meta) => (
         <Switch>
           <Match when={meta.hidden}>
              <></>
            </Match>

           <Match when={meta.component === "TextInput" || (!meta.component && meta.serverType === DataType.String)}>
             <OverWriteableCell
              txnId={props.txnId}
              joinVertex={joinVertex}
              cellMeta={meta}
              defaultValueFn={props.defaultValueFn}
              onOverwriteClick={() => setValue(meta, "")}
             >
               <TextInputField
                label=""
                // name=
                value={joinVertex.properties[meta.id]}
                setValue={(value) => setValue(meta, value)}
               />
             </OverWriteableCell>
            </Match>
            <Match when={meta.component === "NumberInput" || (!meta.component && (meta.serverType === DataType.Integer || meta.serverType === DataType.Float))}>
              <OverWriteableCell
               txnId={props.txnId}
               joinVertex={joinVertex}
               cellMeta={meta}
               defaultValueFn={props.defaultValueFn}
               onOverwriteClick={() => setValue(meta, "")}
              >
                <NumberInputField
                 label=""
                 value={joinVertex.properties[meta.id]}
                 setValue={(value) => setValue(meta, value)}
                />
              </OverWriteableCell>
            </Match>
            <Match when={meta.component === "Select"}>
              <OverWriteableCell
               txnId={props.txnId}
               joinVertex={joinVertex}
               cellMeta={meta}
               defaultValueFn={props.defaultValueFn}
               onOverwriteClick={() => setSelectionValueOne(props.txnId, joinVertex, meta, 0, 0)}
              >
                <SelectInputField
                 txnId={props.txnId}
                 vertex={joinVertex}
                 meta={meta as SelectField}
                 // name={props.form.id + meta.id}
                 // form={props.form}
                 commit={props.commit}
                />
              </OverWriteableCell>
            </Match>
            <Match when={meta.component === "Tag"}>
              <OverWriteableCell
               txnId={props.txnId}
               joinVertex={joinVertex}
               cellMeta={meta}
               defaultValueFn={props.defaultValueFn}
               onOverwriteClick={() => setSelectionValueOne(props.txnId, joinVertex, meta, 0, 0)}
              >
                <TagField
                 txnId={props.txnId}
                 vertex={joinVertex}
                 meta={meta as SelectField}
                 // name={props.form.id + meta.id}
                 // form={props.form}
                 commit={props.commit}
                />
              </OverWriteableCell>
            </Match>
            <Match when={meta.serverType === "Boolean"}>
              <OverWriteableCell
               txnId={props.txnId}
               joinVertex={joinVertex}
               cellMeta={meta}
               defaultValueFn={props.defaultValueFn}
               onOverwriteClick={() => setValue(meta, false)}
              >
                <BooleanInputField value={joinVertex.properties[meta.id]}
                                   setValue={(value) => setValue(meta, value)} />
              </OverWriteableCell>
            </Match>
            <Match when={meta.serverType === DataType.Map || meta.component === "Json"}>
              <td>
                <OverWriteableCell
                 txnId={props.txnId}
                 joinVertex={joinVertex}
                 cellMeta={meta}
                 defaultValueFn={props.defaultValueFn}
                 onOverwriteClick={() => setValue(meta, {})}
                >
                  <ModalInput btnContent={<Icon
                   icon="material-symbols:edit-square-outline-sharp" />}>
                    <JsonInput
                     value={joinVertex.properties[meta.id]}
                     setValue={(value) => setValue(meta, value)}
                    />
                  </ModalInput>
                </OverWriteableCell>
              </td>
            </Match>
            <Match when={meta.component === "JsCode"}>
              <OverWriteableCell
               txnId={props.txnId}
               joinVertex={joinVertex}
               cellMeta={meta}
               defaultValueFn={props.defaultValueFn}
               onOverwriteClick={() => setValue(meta, "")}
              >
                <ModalInput btnContent={<Icon icon="material-symbols:edit-square-outline-sharp" />}>
                  <TextAreaField
                   value={joinVertex.properties[meta.id]}
                   setValue={(value) => setValue(meta, value)}
                  />
                </ModalInput>
              </OverWriteableCell>
            </Match>
          </Switch>
        )}
      </For>
    }

    return (
        <tr use:sortable class="" classList={{"opacity-25": sortable.isActiveDraggable}}>
          <td>{/* <DynGlyph x="swap_vert" class="hidden group-hover:block" /> */}</td>
          <DisplayProperties attributes={props.meta.attributes}/>
          <td>
            <button type="button" onclick={deleteRow} title="Delete Row">
              <Icon icon="ion:close-circle-outline"/>
            </button>
          </td>
        </tr>
    );
  };
  const SortableRowForm = (p: { edgeId: Id }) => {
    const sortable = createSortable(p.edgeId);

    const edge = graph.edges[p.edgeId];
    if (!edge) return "NO edge Found";

    const vertex = graph.vertexes[edge.end];

    const setValue = (attribute: FieldAttribute, value: any) => {
      mergeVertexProperties(props.txnId, vertex.id, { [attribute.id]: value });
    };
    const clearControl = (id: string) => {
      mergeVertexProperties(props.txnId, vertex.id, { [id]: undefined });
    };
    const clearSelectControl = (id: string) => {

    };

    return (
        <div ref={el=>props.meta.noSort ? undefined : sortable(el)} class="border rounded-2 border-gray-300 p-2"
             classList={{"opacity-25": sortable.isActiveDraggable}}>
          <Dynamic component={props.component!}
                   form={props.form!}
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
        // runWithOwner(owner, () => {
        batch(() => {
          setSortedIds(updatedItems);
          updatedItems.forEach((_id, index) => {
            const vertex = graph.edges[_id];
            mergeVertexProperties(props.txnId, vertex.id, { pos: index + 1 });
          });
        });
      }
      if(props.commit) commitTxn(props.txnId, Ws);
    }
    setActiveDragItem(null);
  };

  if (props.meta.component === "TableForm") {
    return (
      <div>
        <div>
          <div>
            <button type="button" onclick={addNew}>Add New</button>
          </div>
          <div>
            <DragDropProvider onDragStart={onDragStart} onDragEnd={onDragEnd}
                              collisionDetector={closestCenter}>
              <DragDropSensors/>
              <SortableProvider ids={ids()}>
                <div class="flex flex-col gap-2">
                  <For each={sortedIds()} fallback={<div>No Attributes</div>}>
                    {(edgeId) => <SortableRowForm edgeId={edgeId}/>}
                  </For>
                </div>
              </SortableProvider>
            </DragDropProvider>
          </div>
        </div>

        {/*<Show when={props.page}>*/}
        {/*  <For each={Object.values(props.page!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>*/}
        {/*</Show>*/}
      </div>
    );
  }

  return (
    <div>
      <div>
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
              <For each={props.meta.attributes}>
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
            <DragDropProvider onDragStart={onDragStart} onDragEnd={onDragEnd}
                              collisionDetector={closestCenter}>
              <DragDropSensors/>
              <SortableProvider ids={ids()}>
                <For each={sortedIds()} fallback={<div>No Attributes</div>}>
                  {(edgeId) => <SortableRow edgeId={edgeId} />}
                </For>
              </SortableProvider>
            </DragDropProvider>
            </tbody>
          </table>
        </div>
      </div>

      {/*<Show when={props.page}>*/}
      {/*  <For each={Object.values(props.page!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>*/}
      {/*</Show>*/}
    </div>
  );
}
