import postAPI from "~/lib/auth/PostApi";
import { API } from "~/components/api/DataFetcher";

// General function to make API calls with a payload
async function makeAPICall(url: string, payload: object) {
  return await postAPI(url, payload);
}

// Fetch data for a specific page by name
export const getPagesDataCall = async (pageName: string) =>
  await makeAPICall(API.getPagesDataUrl, { pageName });

// Submit generic data to the server
export const submitDataCall = async (data: string, id: number) =>
  await makeAPICall(API.SubmitDataUrl, { data, id });

// Fetch form data by form name and ID
export const getFormData = async (formName: string, formId: number) =>
  await makeAPICall(API.getFormDataUrl, { formName, formId });

// Register a new user with form data
export const registerUserCall = async (formData: any) =>
  await makeAPICall(API.signUpUrl, {
    username: formData().username.toLowerCase(),
    email: formData().email.toLowerCase(),
    password: formData().password,
    subdomain: formData().subdomain,
  });

// Sign in a user with email and password
export const signInCall = async (formData: any) =>
  await makeAPICall(API.loginUrl, {
    email: formData().email.toLowerCase(),
    password: formData().password,
  });

// Sign out the current user
export const signOutCall = async () => await makeAPICall(API.logOutUrl, {});

// Send a contact us form to support
export const contactUsCall = async (formData: any) =>
  await makeAPICall(API.profileUrl, {
    panel: "supportTicket",
    action: "create",
    name: formData().name,
    email: formData().email.toLowerCase(),
    subject: formData().subject,
    message: formData().message,
  });

// Reset user's password with new credentials
export const resetPasswordCall = async (passwordData: any, profileData: any) =>
  await makeAPICall(API.profileUrl, {
    panel: "password",
    currentPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
    username: profileData.username,
  });

// Retrieve chat history for support tickets
export const getChatsSupportCall = async (parentVertexId: any) =>
  await makeAPICall(API.profileUrl, {
    parentVertexId,
    panel: "supportTicket",
    action: "chat",
    subAction: "get",
  });

// Send a new chat message for support
export const sendChatsSupportCall = async (
  parentVertexId: any,
  newMessage: any,
) =>
  await makeAPICall(API.profileUrl, {
    newMessage,
    parentVertexId,
    panel: "supportTicket",
    action: "chat",
    subAction: "send",
  });

// Delete a support ticket
export const deleteSupportTicketCall = async (ticketId: any) =>
  await makeAPICall(API.profileUrl, {
    panel: "supportTicket",
    action: "delete",
    id: ticketId,
  });
