import { SYSTEM_DB_NAME } from "~/cypher/core/boltConstant";

export const adminUserData = {
  email: `admin@${process.env.DOMAIN || "decodeui.io"}`,
  password: process.env.admin_USER_PASSWORD || "",
  subDomain: SYSTEM_DB_NAME,
  username: "admin",
};
