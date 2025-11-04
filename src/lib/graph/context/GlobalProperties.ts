import type { Id } from "~/lib/graph/type/id";

export interface GlobalProperties {
  activeClickOutside: string[];
  initialDataFetchError: string;
  initialDataRefreshCount?: number; // Counter to trigger refetch of initial data
  isDevelopment: boolean;
  isSideBarOpen?: boolean;
  isSubSideBarOpen?: boolean;
  newVertexId_: number;
  txnId_: number;
  url: string;

  // User-related properties
  userId?: Id; // ID of the current user vertex
  userRoles?: Id[]; // IDs of user role vertices
  userSettingId?: Id; // ID of user setting vertex
  profileImageId?: Id; // ID of profile image vertex

  tooltipRegistry?: { [key: string]: string[] }; // which tooltips belong to which group
  activeTooltips?: { [key: string]: boolean };
  subdomain?: string; // Current subdomain
  domain?: string; // Current domain
  // isAuthenticated: false,
  // theme: "light" as "light" | "dark",
  // notifications: [] as Array<{ id: number; message: string; type: "info" | "warning" | "error" }>,
  // language: "en" as string,
}
