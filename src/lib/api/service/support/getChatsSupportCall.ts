import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";

// Retrieve chat history for support tickets

export async function getChatsSupportCall(parentVertexId: any) {
  return await postAPI(API.profileUrl, {
    action: "chat",
    panel: "supportTicket",
    parentVertexId,
    subAction: "get",
  });
}
