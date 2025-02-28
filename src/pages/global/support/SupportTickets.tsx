import { CellContext } from "@tanstack/solid-table";
import { For } from "solid-js";

import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import type { DataGridStore } from "~/features/grid/DataGridContext";
import type { Vertex } from "~/lib/graph/graph";

import { DataGrid } from "~/features/grid/DataGrid";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { getSupportTicketFormSchema } from "./functions/formSchema";

export function SupportTickets() {
  let gridStore: DataGridStore;

  const getTableData = async () => {
    return await postAPI(API.support.getTicketsUrl, {});
  };

  const SupportTicketSchema = {
    attributes: [
      {
        componentName: "TextInput",
        displayName: "Name",
        key: "name",
      },
      {
        componentName: "TextInput",
        displayName: "Email",
        key: "email",
      },
      {
        componentName: "TextInput",
        displayName: "Subject",
        key: "subject",
      },
      {
        componentName: "TextInput",
        displayName: "Message",
        key: "message",
      },
      {
        collection: "->$0SupportStatus",
        componentName: "Select",
        displayName: "Status",
        key: "SupportStatus",
      },
      {
        componentName: "TextInput",
        displayName: "Created At",
        key: "createdAt",
      },
      {
        cell: (info: CellContext<Vertex, unknown>) => {
          return (
            <div>
              <For each={info.row.original.P.replies}>
                {(reply: Vertex) => (
                  <div class="white-space:nowrap overflow:hidden text-overflow:ellipsis">
                    {new Date(reply.P.createdAt).toLocaleDateString()} {new Date(reply.P.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {reply.P.message.slice(0, 10)}... (by {reply.P.email.slice(0, 5)}...)
                  </div>
                )}
              </For>
            </div>
          );
        },
        componentName: "TextArea",
        displayName: "Replies",
        key: "replies",
      },
    ],
    isInlineEditable: true,
    key: "SupportTicket",
    title: "Support Tickets",
  };
  const onSuccess = () => {
    gridStore?.[0].fetchTableData();
  };
  const addSchema = getSupportTicketFormSchema(onSuccess);
  const editSchema = getSupportTicketFormSchema(onSuccess);
  return (
    <DataGrid
      CustomAddNewButton={() => <SchemaRenderer form={addSchema} />}
      editSchema={editSchema}
      formSchema={SupportTicketSchema}
      getTableData={getTableData}
      hideEditJsonAction={true}
      initializeGridStoreParent={(gridStore_) => {
        gridStore = gridStore_;
      }}
      isShowPagination={true}
      tableId="SupportTicket"
    />
  );
}
