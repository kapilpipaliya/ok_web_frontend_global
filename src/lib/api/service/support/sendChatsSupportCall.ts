import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";

// Send a new chat message for support

export async function sendChatsSupportCall(
  parentVertexId: any,
  newMessage: any,
) {
  return await postAPI(API.profileUrl, {
    action: "chat",
    newMessage,
    panel: "supportTicket",
    parentVertexId,
    subAction: "send",
  });
}
