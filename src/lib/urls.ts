import { API } from "./api/endpoints";

export type HomeUrlContext = "default" | "system" | "admin";

export function getHomeUrl(context: HomeUrlContext = 'default'): string {
  switch (context) {
    case "system":
      return API.urls.system.root;
    case "admin":
      return API.urls.admin.root;
    case "default":
    default:
      return "/";
  }
} 