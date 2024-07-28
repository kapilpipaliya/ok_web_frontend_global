import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";

// Sign in a user with email and password



export async function signInCall(formData: any) {
  return await postAPI(API.loginUrl, {
    email: formData().email.toLowerCase(),
    password: formData().password,
  });
}
