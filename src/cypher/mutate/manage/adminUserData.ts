import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getPrimaryAppDomain } from "~/lib/envDomains";

export const adminUserData = {
  email: `admin@${getPrimaryAppDomain() ?? "decodeui.io"}`,
  password: process.env.ADMIN_USER_PASSWORD || "",
  subDomain: ADMIN_DB_NAME,
  username: "admin",
};
