import {
 createEffect,
 createSignal,
 For,
 Match,
 Show,
 Switch,
 untrack,
 useContext
} from "solid-js";
import { useLocation, useNavigate } from "solid-app-router";
import { AttributesTableData, } from "../api";
import { FieldAttribute, FormMetaData, Id } from "../input/Form";
import { css } from "solid-styled-components";
import {
 commitTransaction,
 getNewTxnId,
 graph, ProcessStatus,
 transactions
} from "../../lib/graph";
import { deleteVertex, findVertexIdsByLabel } from "../../lib/Vertex";
import { WsContext } from "../ws_events_dispatcher";

export default function SchemaTable(props: {entity: string}) {
 const navigate = useNavigate();
 const location = useLocation();
 const {Ws} = useContext(WsContext);

 const [data, setData] = createSignal({
  data: [] as (Id[] | (() => Id[])),
  headers: [] as FieldAttribute[]
 });

 let [tableMetaData, setTableMetaData] = createSignal({} as FormMetaData);

 const getObjectData = () => {
  // use local variable because Signal is not updated instantly
  const tableMetaData_ = AttributesTableData[props.entity] as FormMetaData;
  setTableMetaData(tableMetaData_);
  const headers = [...tableMetaData_.attributes];
  // @ts-ignore
  headers.push({ key: "edit", dataType: "actions" });

  // For async data get operation, we will handle it differently
  setData({
   data: () => findVertexIdsByLabel(props.entity),
   headers
  });
 };

 createEffect(() => {
  // clear the state when routes parameter changes.
  if (props.entity) untrack(getObjectData);
 });

 const deleteObject = (vertexId: Id) => {
  if (confirm("are you sure")) {
    const txnId = getNewTxnId();
   const deleteResult = deleteVertex(txnId, vertexId);
    if (deleteResult?.error) alert(deleteResult.error);
    else getObjectData();
    transactions.get(txnId)!.status = ProcessStatus.Ready;
    commitTransaction(Ws);

  }
 };
 const TableBody = () => {
  return <tbody>
  <For each={typeof data().data === "function" ? (data().data as (() => Id[]))()
   : data().data as Id[]} fallback={<></>}>
   {(id) => {
    return (
     <tr>
      <td>{graph.vertexes[id]?.["id"]}</td>
      <For each={data().headers}>
       {(head) => (
        <Show when={graph.vertexes[id]}>
         <td>
          <Switch
           fallback={
            <div>{graph.vertexes[id]["properties"][head.id]}</div>
           }
          >
           <Match when={head.dataType === "Boolean"}>
            <div>{graph.vertexes[id]["properties"][head.id] ? "true" : "false"}</div>
           </Match>
           <Match when={head.dataType === "Map"}>
            <div>{graph.vertexes[id]["properties"][head.id]}</div>
           </Match>
           {/* @ts-ignore */}
           <Match when={head.dataType === "actions"}>
            <td>
             <a href={`${location.pathname}/${id}`}>Edit</a>
             <button onClick={() => deleteObject(id)}>Delete
             </button>
            </td>
           </Match>
          </Switch>
         </td>
        </Show>
       )}
      </For>
     </tr>
    );
   }}
  </For>
  </tbody>;
 };
 return (
  <div>
   <div>
    <div>
     <h1>{tableMetaData().title}</h1>
    </div>
    <div>
     <button onClick={() => navigate("./new")}>
      Add new
     </button>
    </div>
   </div>
   <div>
    <div>
     <div>
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
       {/* <Suspense fallback={<Loader />}> */}
       <Show when={!data().headers.length}>No Data</Show>
       <table style={{ "border-spacing": 0 }}>
        <thead>
        <tr>
         <th>ID</th>
         <For each={data().headers}>
          {(head) => (
           <th scope="col" title={head.dataType}>
            {head.id}
           </th>
          )}
         </For>
        </tr>
        </thead>
        <TableBody />
       </table>
       {/* </Suspense> */}
      </div>
     </div>
    </div>
   </div>
  </div>
 );
}
