// Comment This Lines in web build
import { Link, useNavigate, useParams } from "@solidjs/router";
import {
  ColumnDef,
  createSolidTable,
  flexRender,
  getCoreRowModel,
} from '@tanstack/solid-table';
import {
  For,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  splitProps,
  useContext
} from "solid-js";
import {
  Id,
  IdAttr,
  ProcessStatus,
  Vertex,
  commitTransaction,
  getNewTxnId,
  graph,
  transactions
} from "../lib/graph";

import { Icon } from "@iconify-icon/solid";
import { GenericField } from "../components/input/GenaricField";
import {
  collectionNameDisplayExpr,
  selectedValue
} from "../components/input/SelectInputField";
import { FormMetaData, PageContext, getFormApiFromForm } from "../lib/Record";
import { getChildVertexes, getSelectionOptions } from "../lib/Traverse";
import { deleteVertex, findVertexByLabelAndUniqueId } from "../lib/Vertex";
import { AttrsTableData } from "../lib/api";
import { AttrsAdminTableData } from "../lib/apiAdmin";
import { capitalizeFirstLetter, isNumber } from "../utils/utils";
import { WsContext } from "../utils/ws_events_dispatcher";


interface DataGridProps {
  tableId: string;
}

// TODO: add filter like: https://js.devexpress.com/Demos/WidgetsGallery/Demo/FilterBuilder/WithDataGrid/jQuery/Light/
export const DataGrid = (props: DataGridProps) => {
  const form = getFormApiFromForm(props.tableId);

  let formNew: FormMetaData;
  let collection: string;

  if (form.error) {
    if (AttrsTableData[props.tableId] || AttrsAdminTableData[props.tableId]) {
      formNew = AttrsTableData[props.tableId] || AttrsAdminTableData[props.tableId];
      collection = props.tableId;
    } else {
      return form.error;
    }
  } else {
    formNew = form.form!;
    // @ts-ignore
    collection = form.form.collection as string;
  }
  console.log(formNew);

  const deleteObject = (id: Id) => {
    if (confirm("are you sure")) {
      const txnId = getNewTxnId();
      const deleteResult = deleteVertex(txnId, id);
      // @ts-ignore
      if (deleteResult?.error) {
        alert(data);
        return;
      }
      transactions.get(txnId)!.status = ProcessStatus.Ready;
      commitTransaction(Ws);
    }
  };

  const tableColumns = [] as ColumnDef<any>[];
  for (const attribute of formNew!.attributes) {
    const column = { ...attribute } as unknown as ColumnDef<any>;
    if (attribute.component === "Table") continue;
    // if (attribute.props?.skip) continue;

    // @ts-ignore
    column.accessorKey = `P.${attribute.name}`;
    // column.accessorFn = row => row.lastName;
    column.id = attribute.name;
    column.cell = info => {
      if (attribute.component === "SelectBox" && !attribute.props?.items) {
        const vertex = selectedValue(
          {
            P: attribute,
          } as unknown as Vertex,
          info.row.original,
        );
        if (vertex[0]) {
          return getSelectionOptions([graph.vertexes[vertex[0]]], attribute.props?.displayExpr || collectionNameDisplayExpr(attribute.props?.collection) || `::'P.${IdAttr}'`).vertexes;
        }
        return "";
      }

      if (attribute.component === "TagBox" && !attribute.props?.items) {
        const vertex = selectedValue(
          {
            P: attribute,
          } as unknown as Vertex,
          info.row.original,
        );
        if (vertex) {
          const textArray = [];
          for (const v of vertex) {
            const text = getSelectionOptions([graph.vertexes[v]], attribute.props?.displayExpr || `::'P.${IdAttr}'`).vertexes;
            textArray.push(text);
          }
          return textArray.join(', ');
        }
        return "";

      }
      return <i>{info.getValue<string>()}</i>;
    };
    // @ts-ignore
    column.header = (info) => capitalizeFirstLetter(info.column.columnDef.displayName || info.column.columnDef.name);
    // @ts-ignore
    column.footer = info => capitalizeFirstLetter(info.column.columnDef.displayName || info.column.columnDef.name);

    // @ts-ignore
    tableColumns.push(column);
  }
  tableColumns.push({
    accessorKey: 'Edit',
    header: '',
    footer: '',
    cell: info => {
      return <Link href={`/${props.tableId}/${info.row.original.id}`}><Icon icon="tabler:edit" />Edit</Link>;
    }
  });
  tableColumns.push({
    accessorKey: 'Delete',
    header: '',
    footer: '',
    cell: info => <button onClick={/*@once*/ () => deleteObject(info.row.original.id as any)}><Icon icon="fluent:delete-12-regular" />Delete</button>
  });
  console.log(tableColumns)

  if (!collection) {
    return <>Incorrect Configuration</>
  }
  // console.log(1, JSON.stringify(props))
  const { Ws } = useContext(WsContext);
  let { events } = useContext(PageContext);
  events?.setTitle(formNew.title);
  onCleanup(() => events?.setTitle(''));



  const coll = isNumber(collection) ? graph.vertexes[collection].P[IdAttr] : collection;
  // if(!graph.vertexLabelIdMap[coll]) {
  //  alert(`collection not found ${coll}`)
  //  return;
  // }
  const [_] = splitProps(props, ["tableId"]);

  const [data] = createSignal((graph.vertexLabelIdMap[coll] || []).map(vertexId => graph.vertexes[vertexId]))

  const table = createSolidTable({
    get data() {
      return data()
    },
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  // const calculateRowStyle = (index: any) => {
  //   return {
  //     background: index.index % 2 === 0 ? "white" : "#e1dfdf",
  //   };
  // };
  return (
    <div class="py:5">
      <div class="p:2 " >
        <table class="w:full  bg:#f0f7fe " >
          <thead class="b:1  ">
            <For each={table.getHeaderGroups()}>
              {headerGroup => (
                <tr class="p:10   text:center h:50  ">
                  <For each={headerGroup.headers}>
                    {header => (
                      <th class="w:10% ">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </th>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </thead>
          <tbody class="bx:1">
            <For each={table.getRowModel().rows}>
              {(row) => (
                <tr
                 
                  class="h:50 text:center f:sans bg:white bb:0.5"
                  
                >
                  <For each={row.getVisibleCells()}>
                    {cell => (
                      <td>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface AbstractSingleGridProps {
  tableId: string;
}

export const AbstractSingleGrid = (props: AbstractSingleGridProps) => {
  const navigate = useNavigate();
  // used to refresh table:
  const [tableId, setTableId] = createSignal("");
  createEffect(() => {
    // clear the state when routes parameter changes.
    setTableId("");
    props.tableId;
    setTimeout(() => setTableId(props.tableId));
  });

  return (
    <>
      <div class="flex justify-content:right	">
        <GenericField
          meta={
            {
              P: {
                component: "Button",
                [IdAttr]: "meta",
                props: {
                  class:"bg:blue bg:rgb(24,98,234):hover text-fill:white ",
                  icon:"add",
                  
                 
                },
              },
            } as unknown as Vertex
          }
          data={{ P: { meta: "Add new" } } as unknown as Vertex}
          onClick={() => {
            navigate("./new");
          }}
        />
      </div>
      <Show when={tableId()}>
        <DataGrid tableId={tableId()} />
      </Show>
    </>
  );
};

export const TableDashboard = () => {
  const params = useParams();
  const dashboard = findVertexByLabelAndUniqueId('Dashboard', IdAttr, params.name);
  if (!dashboard) {
    return "No Dashboard Found";
  }
  const allFormTableLayouts = getChildVertexes(['$0Form'], [dashboard]).vertexes || [];
  const allCollTableLayouts = getChildVertexes(['$0Coll'], [dashboard]).vertexes || [];

  const allTableLayouts = () => [...new Set([...allCollTableLayouts, ...allFormTableLayouts])];
  return (
    <div class="">
      <div class="grid-cols:2 grid-cols:3@xs grid-cols:4@sm grid-cols:5@md gap:15 gap:20@sm">
        <For each={allTableLayouts()}>
          {(tableLayout) => (
            <div class="bg:gray-22 p:10 r:10 max-w:350 bg:gray-28:hover flex ji:center ai:center h:5rem">
              <h3 class="f:18@md font:semibold"></h3>
              <p class="mt:5 mb:0 mx:auto f:18@md font:semibold"><Link href={`/${tableLayout.P[IdAttr]}`}>{tableLayout.P.title || tableLayout.P[IdAttr]}</Link></p>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export const AllDashboards = () => {
  const vertexes = () => graph.vertexLabelIdMap["Dashboard"] || [];

  return (
    <div class="">
      <For each={vertexes()}>{(vertexId) => <Link href={`/grid/${graph.vertexes[vertexId].P[IdAttr]}`}>{graph.vertexes[vertexId].P[IdAttr]}</Link>}</For>
    </div>
  );
}
