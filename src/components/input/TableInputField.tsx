import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  For,
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
import {
  getChildVertex,
  getChildVertexes,
  getOptionLabel,
  getSelectionOptions,
  SelectInputField
} from "./SelectInputField";
import { ComponentProps, Vertex } from "./Form";
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
import { klona } from "klona";

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

export function newRow(txnId: number, parentVertex: Vertex, type: string) {
  const vertexNew = newVertex(getNewGraphId(), [type], {});
  const insertVertex = addNewVertex(txnId, vertexNew);
  if (insertVertex.error) {
    alert(insertVertex.error);
    return {
      error: true,
    };
  }

  const edgeNew = newEdge(getNewGraphId(), type, {}, parentVertex.id, vertexNew.id);
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

  // const owner = getOwner();

  // todo check bindOwner and fix it
  const addNew = bindOwner(() => {
    batch(function() {
      const txnId = getNewTxnId();

      const name = capitalizeFirstLetter(props.meta.properties.id);
      const type = props.vertex.labels[0] + name;

      newRow(txnId, props.vertex, type);
      commitTxn(txnId, Ws);
    });
  });

  const [sortedVertexes, setSortedIds] = createSignal([] as Vertex[]);

  createEffect(() => {
    const type = props.vertex.labels[0] + capitalizeFirstLetter(props.meta.properties.id);
    const vertexes = getSelectionOptions(props.vertex, `->${type}`, "").sort((a, b) => a.properties.pos - b.properties.pos);
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
      commitTxn(txnId, Ws);
    }

    // columns
    const tableColumnsTemplate = getSelectionOptions(props.meta, "->MetaAttribute", ""); //.sort((a, b) => a.properties.pos - b.properties.pos);

    const rowMetaAttributeInstance = getChildVertex(["AttributeInstance"], p.joinVertex );

    if(rowMetaAttributeInstance.error) {
      batch(() => {
        const metaInstanceResult = newRow(getNewTxnId(), p.joinVertex, "AttributeInstance");
        if (metaInstanceResult.error) {
          alert("Error creating a row for attribute instance");
        }
        mergeVertexProperties(getNewTxnId(), metaInstanceResult.vertexId!, { templateId: props.meta.id });

        for (const attrColumn of tableColumnsTemplate) {
          const attrInstanceResult = newRow(getNewTxnId(), graph.vertexes[metaInstanceResult.vertexId!], "MetaAttribute");
          if (attrInstanceResult.error) {
            alert(attrInstanceResult.error);
          }
          mergeVertexProperties(getNewTxnId(), attrInstanceResult.vertexId!, klona(attrColumn.properties));
          mergeVertexProperties(getNewTxnId(), attrInstanceResult.vertexId!, { templateId: attrColumn.id });
        }
      });
    }

    const attributesResult = getChildVertexes(["AttributeInstance", "MetaAttribute"], [p.joinVertex]);
    if(attributesResult.error) alert("Error getting attributes");
    const rowColumnsMetaAttributes = attributesResult.vertexes!;

    const DisplayProperties = () => {
      const setValue = (attribute: Vertex, value: any) => {
        const txnId = getNewTxnId();
        mergeVertexProperties(txnId, p.joinVertex.id, { [attribute.properties.id]: value });
        commitTxn(txnId, Ws);
      };

      return <For each={rowColumnsMetaAttributes}>
        {(metaVertex) => {
          const component = createMemo(() => {
            if(metaVertex.properties.component.includes('->') || metaVertex.properties.component.includes('<-')) {
              // return getOptionLabel(metaVertex, metaVertex.properties.component);
              return getOptionLabel(p.joinVertex, metaVertex.properties.component);
            } else {
              return metaVertex.properties.component;
            }
          })
          return (
           <Switch>
             <Match when={metaVertex.properties.props?.hidden}>
               <td>
                 <div
                  class="flex">{metaVertex.properties.props?.defaultValue && getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}</div>
               </td>
             </Match>

             <Match
              when={component() === "TextInput"}>
               <td>
                 <div
                  class="flex align-items:center">{metaVertex.properties.props?.defaultValue && getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}
                   <TextInputField
                    // name=
                    meta={metaVertex}
                    vertex={p.joinVertex}
                    setValue={setValue}
                   />

                 </div>
               </td>
             </Match>
             <Match
              when={component() === "TextArea"}>
               <td>
                 <div
                  class="flex align-items:center">{metaVertex.properties.props?.defaultValue && getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}
                   <TextAreaField
                    meta={metaVertex}
                    vertex={p.joinVertex}
                    setValue={setValue}
                   />

                 </div>
               </td>
             </Match>
             <Match
              when={component() === "NumberInput"}>
               <td>
                 <div
                  class="flex align-items:center">{metaVertex.properties.props?.defaultValue && getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}
                   <NumberInputField
                    meta={metaVertex}
                    vertex={p.joinVertex}
                    setValue={setValue}
                   />

                 </div>
               </td>
             </Match>
             <Match when={component() === "Select"}>
               <td>
                 <div
                  class="flex align-items:center">{metaVertex.properties.props?.defaultValue && getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}
                   <SelectInputField

                    vertex={p.joinVertex}
                    meta={metaVertex}
                    // name={props.form.id + metaVertex.properties.id}
                    // form={props.form}

                   />

                 </div>
               </td>
             </Match>
             <Match when={component() === "Tag"}>
               <td>
                 <div
                  class="flex align-items:center">{metaVertex.properties.props?.defaultValue && getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}
                   <TagField

                    vertex={p.joinVertex}
                    meta={metaVertex}
                    // name={props.form.id + metaVertex.properties.id}
                    // form={props.form}

                   />

                 </div>
               </td>
             </Match>
             <Match when={component() === "CheckBox"}>
               <td>
                 <div
                  class="flex">{metaVertex.properties.props?.defaultValue && getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}
                   <BooleanInputField
                    meta={metaVertex}
                    vertex={p.joinVertex}
                    setValue={setValue} />

                 </div>
               </td>
             </Match>
             <Match
              when={component() === "Json"}>

               <td>
                 <div
                  class="flex">{metaVertex.properties.props?.defaultValue && getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}
                   <ModalInput btnContent={<Icon
                    icon="material-symbols:edit-square-outline-sharp" />}>
                     <JsonInput
                      meta={metaVertex}
                      vertex={p.joinVertex}
                      setValue={setValue}
                     />
                   </ModalInput>


                 </div>
               </td>
             </Match>
             <Match when={component() === "JsCode"}>
               <td>
                 <div
                  class="flex">{metaVertex.properties.props?.defaultValue && getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}
                   <ModalInput btnContent={<Icon
                    icon="material-symbols:edit-square-outline-sharp" />}>
                     <TextAreaField
                      meta={metaVertex}
                      vertex={p.joinVertex}
                      setValue={setValue}
                     />
                   </ModalInput>

                 </div>
               </td>
             </Match>
             <Match when={component() === "Table"}>
               <td>
                 <div
                  class="flex">{metaVertex.properties.props?.defaultValue && getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}
                   <TableInputField
                    // id={props.form.id + metaVertex.properties.id}

                    meta={graph.vertexes[metaVertex.properties.templateId]}
                    vertex={p.joinVertex}

                   />

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
      commitTxn(txnId, Ws);
    }
    setActiveDragItem(null);
  };

  return (
    <div>
      <div>
        {/*<Show when={props.meta.properties.attributes}>*/}
        {/*  <DynamicForm form={{title: '', label: props.meta.properties.label || props.meta.properties.id, attributes: props.meta.properties.attributes}} vertex={props.vertex}/>*/}
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
