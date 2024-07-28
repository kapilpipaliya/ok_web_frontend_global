import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";

// Sign out the current user



export async function signOutCall() {
  return await postAPI(API.logOutUrl, {});
}
