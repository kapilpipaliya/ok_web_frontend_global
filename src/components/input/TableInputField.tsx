import {
  batch,
  createEffect,
  createSignal,
  For,
  getOwner,
  JSXElement,
  Match,
  Show,
  Switch,
  useContext
} from "solid-js";
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
import { getOptionLabel, SelectInputField } from "./SelectInputField";
import {
  DataType,
  FieldAttribute,
  Id,
  SelectField,
  TableField,
  Vertex
} from "./Form";
import { toTitle } from "case-switcher-js";
import usePopper from "solid-popper";
import { JsonInput } from "./JsonInput";
import { TextAreaField } from "./TextAreaField";
import { NumberInputField } from "./NumberInputField";
import {
  addNewVertex,
  deleteVertex,
  mergeVertexProperties,
  newVertex
} from "../../lib/Vertex";
import { capitalizeFirstLetter } from "../utils";
import { addNewEdge, deleteEdge, newEdge } from "../../lib/Edge";
import { commitTxn, getNewGraphId, getNewTxnId, graph } from "../../lib/graph";
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
  meta: TableField
  vertex: Vertex;
}

function newRow(txnId: number, vertex: Vertex, meta: TableField) {
  const name = capitalizeFirstLetter(meta.id);
  const type = vertex.labels[0] + name;

  const vertexNew = newVertex(getNewGraphId(), [type], {});
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
  return (vertex.out_edges[type] || []).map(edgeId => [edgeId, graph.vertexes[graph.edges[edgeId].end]] as [number, Vertex]).filter(tuple => tuple[1]).sort((tuple1, tuple2) => (tuple1[1].properties.pos || 0) - (tuple2[1].properties.pos || 0)).map(tuple => tuple[0]);
}

export function TableInputField(props: TableInputFieldProps) {
  const { Ws } = useContext(WsContext);

  const owner = getOwner();

  // todo check bindOwner and fix it
  const addNew = bindOwner(() => {
    batch(function() {
      const txnId = getNewTxnId();
      newRow(txnId, props.vertex, props.meta);
      commitTxn(txnId, Ws);
    });
  });

  const [sortedIds, setSortedIds] = createSignal([] as number[]);

  createEffect(() => {
    setSortedIds(getTableValue(props.vertex, props.meta));
  })


  // Todo dont allow duplicate value in the select field
  const SortableRow = (p: { edgeId: Id }) => {

    const sortable = createSortable(p.edgeId);
    const edge = graph.edges[p.edgeId];
    if (!edge) return "NO edge Found";

    const joinVertex = graph.vertexes[edge.end];

    const deleteRow = () => {
      const txnId = getNewTxnId();
      // delete all vertex in edges
      const inEdges = joinVertex.in_edges;
      for (const type in inEdges) {
        for (const edgeId of inEdges[type]) {
          const deleteEdgeResult = deleteEdge(txnId, edgeId)
          if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
        }
      }
      // delete all outEdges of vertex
      const outEdge = joinVertex.out_edges;
      for (const type in outEdge) {
        for (const edgeId of outEdge[type]) {
          const deleteEdgeResult = deleteEdge(txnId, edgeId)
          if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
        }
      }

      // delete vertex:
      deleteVertex(txnId, joinVertex.id);
      commitTxn(txnId, Ws);
    }

    const DisplayProperties = () => {
      const setValue = (attribute: FieldAttribute, value: any) => {
        const txnId = getNewTxnId();
        mergeVertexProperties(txnId, joinVertex.id, { [attribute.id]: value });
        commitTxn(txnId, Ws);
      };

      return <For each={props.meta.columns}>
        {(meta) => (
         <Switch>
           <Match when={meta.hidden}>
             <td>
               <div
                class="flex">{meta.defaultValue && getOptionLabel(joinVertex, meta.defaultValue)}</div>
             </td>
            </Match>

           <Match
            when={meta.component === "TextInput" || (!meta.component && meta.dataType === DataType.String)}>

             <td>
               <div
                class="flex align-items:center">{meta.defaultValue && getOptionLabel(joinVertex, meta.defaultValue)}
                 <TextInputField
                  label=""
                  // name=
                  value={joinVertex.properties[meta.id]}
                  setValue={(value) => setValue(meta, value)}
                 />

               </div>
             </td>
           </Match>
           <Match
            when={meta.component === "NumberInput" || (!meta.component && (meta.dataType === DataType.Integer || meta.dataType === DataType.Float))}>
             <td>
               <div
                class="flex align-items:center">{meta.defaultValue && getOptionLabel(joinVertex, meta.defaultValue)}
                 <NumberInputField
                  label=""
                  value={joinVertex.properties[meta.id]}
                  setValue={(value) => setValue(meta, value)}
                 />

               </div>
             </td>
           </Match>
           <Match when={meta.component === "Select"}>
             <td>
               <div
                class="flex align-items:center">{meta.defaultValue && getOptionLabel(joinVertex, meta.defaultValue)}
                 <SelectInputField

                  vertex={joinVertex}
                  meta={meta as SelectField}
                  // name={props.form.id + meta.id}
                  // form={props.form}

                 />

               </div>
             </td>
           </Match>
           <Match when={meta.component === "Tag"}>
             <td>
               <div
                class="flex align-items:center">{meta.defaultValue && getOptionLabel(joinVertex, meta.defaultValue)}
                 <TagField

                  vertex={joinVertex}
                  meta={meta as SelectField}
                  // name={props.form.id + meta.id}
                  // form={props.form}

                 />

               </div>
             </td>
           </Match>
           <Match when={meta.dataType === "Boolean"}>
             <td>
               <div
                class="flex">{meta.defaultValue && getOptionLabel(joinVertex, meta.defaultValue)}
                 <BooleanInputField value={joinVertex.properties[meta.id]}
                                    setValue={(value) => setValue(meta, value)} />

               </div>
             </td>
           </Match>
           <Match
            when={meta.dataType === DataType.Map || meta.component === "Json"}>

             <td>
               <div
                class="flex">{meta.defaultValue && getOptionLabel(joinVertex, meta.defaultValue)}
                 <ModalInput btnContent={<Icon
                  icon="material-symbols:edit-square-outline-sharp" />}>
                   <JsonInput
                    value={joinVertex.properties[meta.id]}
                    setValue={(value) => setValue(meta, value)}
                   />
                 </ModalInput>


               </div>
             </td>
           </Match>
           <Match when={meta.component === "JsCode"}>
             <td>
               <div
                class="flex">{meta.defaultValue && getOptionLabel(joinVertex, meta.defaultValue)}
                 <ModalInput btnContent={<Icon
                  icon="material-symbols:edit-square-outline-sharp" />}>
                   <TextAreaField
                    value={joinVertex.properties[meta.id]}
                    setValue={(value) => setValue(meta, value)}
                   />
                 </ModalInput>

               </div>
             </td>
           </Match>
          </Switch>
        )}
      </For>
    }

    return (
        <tr use:sortable class="" classList={{"opacity-25": sortable.isActiveDraggable}}>
          <td>
            <div
             class="flex">{/* <DynGlyph x="swap_vert" class="hidden group-hover:block" /> */}{p.edgeId}</div>
          </td>
          <DisplayProperties />
          <td>
            <div class="flex">
              <button type="button" onclick={deleteRow} title="Delete Row">
                <Icon icon="ion:close-circle-outline" />
              </button>
            </div>
          </td>
        </tr>
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
      const txnId = getNewTxnId();
      if (fromIndex !== toIndex) {
        const updatedItems = currentItems.slice();
        updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
        // runWithOwner(owner, () => {
        batch(() => {
          updatedItems.forEach((_id, index) => {
            const vertexId = graph.edges[_id].end;
            const {error} = mergeVertexProperties(txnId, vertexId, { pos: index + 1 });
            if(error) alert(error)
          });
        });
      }
      commitTxn(txnId, Ws);
    }
    setActiveDragItem(null);
  };

  return (
    <div>
      <div>


        <div>
          <button type="button" onclick={addNew}>Add New</button>
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
              <For each={props.meta.columns}>
                {(attribute) => (
                 <Show when={!attribute.hidden || attribute.defaultValue} fallback={<th></th>}>
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
                <For each={sortedIds()} fallback={<div>No Columns</div>}>
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
