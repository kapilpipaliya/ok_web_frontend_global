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
        componentName: "TextArea",
        displayName: "Replies",
        key: "replies",
        props: (options: FunctionArgumentType) => ({
          readonly: true,
          value: options.data.P.replies
            ?.map(
              (reply: Vertex) =>
                `${new Date(reply.P.createdAt).toLocaleString()} - ${
                  reply.P.message
                } (by ${reply.P.createdBy})`,
            )
            .join("\n"),
        }),
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
