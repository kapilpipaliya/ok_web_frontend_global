import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";

// Register a new user with form data

export async function registerUserCall(formData: any) {
  return await postAPI(API.signUpUrl, {
    email: formData().email.toLowerCase(),
    password: formData().password,
    subDomain: formData().subDomain,
    username: formData().username.toLowerCase(),
  });
}
