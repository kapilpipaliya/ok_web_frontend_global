import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";

// Send a contact us form to support



export async function contactUsCall(formData: any) {
  return await postAPI(API.profileUrl, {
    action: "create",
    email: formData().email.toLowerCase(),
    message: formData().message,
    name: formData().name,
    panel: "supportTicket",
    subject: formData().subject,
    uId: formData().uId,
  });
}
