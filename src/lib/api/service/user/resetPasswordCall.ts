import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";

// Reset user's password with new credentials

export async function resetPasswordCall(passwordData: any, profileData: any) {
  return await postAPI(API.profileUrl, {
    currentPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
    username: profileData.username,
  });
}
