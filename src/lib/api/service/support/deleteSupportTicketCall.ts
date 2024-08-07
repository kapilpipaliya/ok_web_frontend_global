import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";

// Delete a support ticket

export async function deleteSupportTicketCall(ticketId: any) {
  return await postAPI(API.profileUrl, {
    action: "delete",
    id: ticketId,
    panel: "supportTicket",
  });
}
