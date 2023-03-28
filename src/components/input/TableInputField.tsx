import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  Show,
  Switch, untrack,
  useContext
} from "solid-js";
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
import {
  getChildVertex,
  getChildVertexes,
  getOptionLabel,
  getSelectionOptions
} from "./SelectInputField";
import { ComponentProps } from "./Type";
import { toTitle } from "case-switcher-js";
import {
  addNewVertex,
  deleteVertex,
  mergeVertexProperties,
  newVertex
} from "../../lib/Vertex";
import { capitalizeFirstLetter } from "../../utils/utils";
import { addNewEdge, deleteEdge, newEdge } from "../../lib/Edge";
import {
 commitTxn,
 getNewGraphId,
 getNewTxnId,
 graph,
 Vertex
} from "../../lib/graph";
import { bindOwner } from "solid-forms";
import { WsContext } from "../ws_events_dispatcher";
import { klona } from "klona";
import { DynamicComponent, FormContext } from "../dynamicForm";

// import { onChangeHandler } from "../core/dynamicForm";

export function newRow(txnId: number, parentVertex: Vertex, edgeType: string, label?: string) {
  const vertexNew = newVertex(getNewGraphId(), [label || edgeType], {});
  const insertVertex = addNewVertex(txnId, vertexNew);
  if (insertVertex.error) {
    alert(insertVertex.error);
    return {
      error: true
    };
  }

  const edgeNew = newEdge(getNewGraphId(), edgeType, {}, parentVertex.id, vertexNew.id);
  const insertEdgeResult = addNewEdge(txnId, edgeNew);
  if (insertEdgeResult.error) {
    alert(insertEdgeResult.error);
    return {
      error: true,
      vertexId: vertexNew.id,
    };
  }
  return {
    error: false,
    vertexId: vertexNew.id,
    edgeId: edgeNew.id
  };
  }

export function TableInputField(props: Omit<ComponentProps, "setValue">) {
  const { Ws } = useContext(WsContext);
  const { local } = useContext(FormContext);

  // const owner = getOwner();

  // todo check bindOwner and fix it
  const addNew = bindOwner(() => {
    batch(function() {
      const txnId = getNewTxnId();

      const type = props.data.labels[0] + capitalizeFirstLetter(props.meta.properties.id);
      const label = props.meta.properties.props?.label;

      newRow(txnId, props.data, type, label);
      if(!local) commitTxn(txnId, Ws);
    });
  });

  const [sortedVertexes, setSortedIds] = createSignal([] as Vertex[]);

  createEffect(() => {
    const type = props.data.labels[0] + capitalizeFirstLetter(props.meta.properties.id);
    const vertexes = (getChildVertexes([`${type}`], [props.data]).vertexes || []).sort((a, b) => a.properties.pos - b.properties.pos);
    setSortedIds(vertexes);
  })

  // Todo dont allow duplicate value in the select field
  const SortableRow = (p: { joinVertex: Vertex }) => {

    const sortable = createSortable(p.joinVertex.id);

    const deleteRow = () => {
      const txnId = getNewTxnId();
      // delete all vertex in edges
      const inEdges = p.joinVertex.in_edges;
      for (const type in inEdges) {
        for (const edgeId of inEdges[type]) {
          const deleteEdgeResult = deleteEdge(txnId, edgeId)
          if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
        }
      }
      // delete all outEdges of vertex
      const outEdge = p.joinVertex.out_edges;
      for (const type in outEdge) {
        for (const edgeId of outEdge[type]) {
          const deleteEdgeResult = deleteEdge(txnId, edgeId)
          if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
        }
      }

      // delete vertex:
      const deleteResult = deleteVertex(txnId, p.joinVertex.id);
      if (deleteResult.error) alert(deleteResult.error)
      if(!local) commitTxn(txnId, Ws);
    }

    // columns
    const tableColumnsTemplate = getChildVertexes(["MetaAttr"], [props.meta]); //.sort((a, b) => a.properties.pos - b.properties.pos);
    if(tableColumnsTemplate.error){
      return "Cant find table columns";
    }
    const rowMetaAttrInst = getChildVertex(["AttrInst"], p.joinVertex );

    if(rowMetaAttrInst.error) {
      batch(() => {
        const metaInstanceResult = newRow(getNewTxnId(), p.joinVertex, "AttrInst");
        if (metaInstanceResult.error) {
          alert("Error creating a row for attribute instance");
        }
        mergeVertexProperties(getNewTxnId(), metaInstanceResult.vertexId!, { templateId: props.meta.id });

        for (const attrColumn of tableColumnsTemplate.vertexes!) {
          const AttrInstResult = newRow(getNewTxnId(), graph.vertexes[metaInstanceResult.vertexId!], "MetaAttr");
          if (AttrInstResult.error) {
            alert(AttrInstResult.error);
          }
          mergeVertexProperties(getNewTxnId(), AttrInstResult.vertexId!, klona(attrColumn.properties));
          mergeVertexProperties(getNewTxnId(), AttrInstResult.vertexId!, { templateId: attrColumn.id });
        }
      });
    }

    const attributesResult = getChildVertexes(["AttrInst", "MetaAttr"], [p.joinVertex]);
    if(attributesResult.error) alert("Error getting attributes");
    const rowColumnsMetaAttrs = attributesResult.vertexes!;


    const DisplayProperties = () => {
      const setValue = (attribute: Vertex, value: any) => {
        const txnId = getNewTxnId();
        mergeVertexProperties(txnId, p.joinVertex.id, { [attribute.properties.id]: value });
        if(!local) commitTxn(txnId, Ws);
      };

      return <For each={rowColumnsMetaAttrs}>
        {(metaVertex) => {
          const component = createMemo(() => {
            if(metaVertex.properties.component.includes('->') || metaVertex.properties.component.includes('<-')) {
              // return getOptionLabel(metaVertex, metaVertex.properties.component);
              return getOptionLabel(p.joinVertex, metaVertex.properties.component);
            } else {
              return metaVertex.properties.component;
            }
          })
          // add meta from vertex value:
           // if mergeProps not keep reactivity use memo
          createEffect(()=>{
            if (metaVertex.properties.meta) {
              const metaRows = getSelectionOptions(p.joinVertex, metaVertex.properties.meta, "").vertexes || [];
              const metaData = metaRows.reduce((acc, curr) => {
                const key = getOptionLabel(curr, "->$0Key:properties.key");
                if(key) {
                  acc[key] = curr.properties.value;
                }
                return acc;
              }, {} as {[key: string]: any});
              untrack(() =>{
                const newMetaData = Object.assign({}, graph.vertexes[metaVertex.properties.templateId].properties.props || {}, metaData);
                mergeVertexProperties(getNewTxnId(), metaVertex.id, {props: newMetaData});
              })
            }
          });

          return (
           <Switch>
             <Match when={metaVertex.properties.props?.hidden}>
               <td>
                 <div class="flex">
                   {metaVertex.properties.props?.defaultValue && getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}</div>
               </td>
             </Match>
             <Match when={component() === "TableField"}>
               <td>
                 <div class="flex">
                   {metaVertex.properties.props?.defaultValue && getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}
                   <DynamicComponent id={""} component={component()} meta={graph.vertexes[metaVertex.properties.templateId]} data={p.joinVertex} setValue={setValue} />
                 </div>
               </td>
             </Match>
             <Match when={true}>
               <td>
                 <div
                  class="flex align-items:center">
                   {metaVertex.properties.props?.defaultValue && getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}
                   <DynamicComponent id={""} component={component()} meta={metaVertex} data={p.joinVertex} setValue={setValue} />
                 </div>
               </td>
             </Match>


           </Switch>
          );
        }}
      </For>
    }

    return (
     // @ts-ignore
     <tr use:sortable class="" classList={{"opacity-25": sortable.isActiveDraggable}}>
          <td>
            <div
             class="flex">{/* <DynGlyph x="swap_vert" class="hidden group-hover:block" /> */}</div>
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

  // @ts-ignore
  const [activeDragItem, setActiveDragItem] = createSignal<number | string | null>(null);
  const ids = () => sortedVertexes().map(vertex=>vertex.id);
  const onDragStart: DragEventHandler = ({draggable}) => {
    setActiveDragItem(draggable.id);
  };
  const onDragEnd: DragEventHandler = ({draggable, droppable}) => {
    if (draggable && droppable) {
      const currentItems = ids();
      const fromIndex = currentItems.indexOf(draggable.id as number);
      const toIndex = currentItems.indexOf(droppable.id as number);
      const txnId = getNewTxnId();
      if (fromIndex !== toIndex) {
        const updatedItems = currentItems.slice();
        updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
        // runWithOwner(owner, () => {
        batch(() => {
          updatedItems.forEach((vertexId, index) => {
            const {error} = mergeVertexProperties(txnId, vertexId, { pos: index + 1 });
            if(error) alert(error)
          });
        });
      }
      if(!local) commitTxn(txnId, Ws);
    }
    setActiveDragItem(null);
  };

  return (
    <div>
      <div>
        {/*<Show when={props.meta.properties.attributes}>*/}
        {/*  <DynamicForm form={{title: '', label: props.meta.properties.props.title || props.meta.properties.id, attributes: props.meta.properties.attributes}} vertex={props.vertex}/>*/}
        {/*</Show>*/}

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
              <For each={props.meta.properties.attributes}>
                {(attribute) => (
                 <Show when={!attribute.hidden || attribute.defaultValue} fallback={<th></th>}>
                   <th>{toTitle(attribute.title || attribute.id)}</th>
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
                <For each={sortedVertexes()} fallback={<div>No Columns</div>}>
                  {(vertex) => <SortableRow joinVertex={vertex} />}
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
