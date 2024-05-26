import { postAPI } from "~/components/api/postApi";
import { API } from "~/components/api/DataFetcher";
import { ProcessStatus, transactions } from "~/lib/graph/transaction";

// General function to make API calls with a payload
async function makeAPICall(url: string, payload: object) {
  return await postAPI(url, payload);
}

// Fetch data for a specific page by name
export async function getPagesDataCall(pageName: string) {
  return await makeAPICall(API.getPagesDataUrl, { pageName });
}

// Submit generic data to the server
export async function submitDataCall(data: any, txnId: number) {
  const result = await makeAPICall(API.SubmitDataUrl, data);
  if (transactions.has(txnId))
    transactions.get(txnId)!.status = ProcessStatus.AckReceived;
  return result;
}

// Fetch form data by form name and ID
export async function getFormData(formName: string, formId: number) {
  return await makeAPICall(API.getFormDataUrl, { formName, formId });
}

// Register a new user with form data
export async function registerUserCall(formData: any) {
  return await makeAPICall(API.signUpUrl, {
    username: formData().username.toLowerCase(),
    email: formData().email.toLowerCase(),
    password: formData().password,
    subdomain: formData().subdomain,
  });
}

// Sign in a user with email and password
export async function signInCall(formData: any) {
  return await makeAPICall(API.loginUrl, {
    email: formData().email.toLowerCase(),
    password: formData().password,
  });
}

// Sign out the current user
export async function signOutCall() {
  return await makeAPICall(API.logOutUrl, {});
}

// Send a contact us form to support
export async function contactUsCall(formData: any) {
  return await makeAPICall(API.profileUrl, {
    panel: "supportTicket",
    action: "create",
    uId: formData().uId,
    name: formData().name,
    email: formData().email.toLowerCase(),
    subject: formData().subject,
    message: formData().message,
  });
}

// Reset user's password with new credentials
export async function resetPasswordCall(passwordData: any, profileData: any) {
  return await makeAPICall(API.profileUrl, {
    panel: "password",
    currentPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
    username: profileData.username,
  });
}

// Retrieve chat history for support tickets
export async function getChatsSupportCall(parentVertexId: any) {
  return await makeAPICall(API.profileUrl, {
    parentVertexId,
    panel: "supportTicket",
    action: "chat",
    subAction: "get",
  });
}

// Send a new chat message for support
export async function sendChatsSupportCall(
  parentVertexId: any,
  newMessage: any,
) {
  return await makeAPICall(API.profileUrl, {
    newMessage,
    parentVertexId,
    panel: "supportTicket",
    action: "chat",
    subAction: "send",
  });
}

// Delete a support ticket
export async function deleteSupportTicketCall(ticketId: any) {
  return await makeAPICall(API.profileUrl, {
    panel: "supportTicket",
    action: "delete",
    id: ticketId,
  });
}
