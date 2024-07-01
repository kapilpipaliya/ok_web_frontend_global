import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/graph";

import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { onMutatDataGet } from "~/lib/websocket/onMutatDataGet";

// General function to make API calls with a payload
async function makeAPICall(url: string, payload: object) {
  return await postAPI(url, payload);
}

// Submit generic data to the server
export async function submitDataCall(data: any, graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>, txnId: number) {
  const result = await makeAPICall(API.submitDataUrl, data);
  // @ts-ignore
  onMutatDataGet(graph, setGraph, result);
  return result;
}

// Register a new user with form data
export async function registerUserCall(formData: any) {
  return await makeAPICall(API.signUpUrl, {
    email: formData().email.toLowerCase(),
    password: formData().password,
    subdomain: formData().subdomain,
    username: formData().username.toLowerCase(),
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
    action: "create",
    email: formData().email.toLowerCase(),
    message: formData().message,
    name: formData().name,
    panel: "supportTicket",
    subject: formData().subject,
    uId: formData().uId,
  });
}

// Reset user's password with new credentials
export async function resetPasswordCall(passwordData: any, profileData: any) {
  return await makeAPICall(API.profileUrl, {
    currentPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
    panel: "password",
    username: profileData.username,
  });
}

// Retrieve chat history for support tickets
export async function getChatsSupportCall(parentVertexId: any) {
  return await makeAPICall(API.profileUrl, {
    action: "chat",
    panel: "supportTicket",
    parentVertexId,
    subAction: "get",
  });
}

// Send a new chat message for support
export async function sendChatsSupportCall(
  parentVertexId: any,
  newMessage: any,
) {
  return await makeAPICall(API.profileUrl, {
    action: "chat",
    newMessage,
    panel: "supportTicket",
    parentVertexId,
    subAction: "send",
  });
}

// Delete a support ticket
export async function deleteSupportTicketCall(ticketId: any) {
  return await makeAPICall(API.profileUrl, {
    action: "delete",
    id: ticketId,
    panel: "supportTicket",
  });
}
