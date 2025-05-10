import { SYSTEM_DB_NAME } from "~/cypher/core/boltConstant";

export const superUserData = {
  email: `admin@${process.env.DOMAIN || "decodeui.io"}`,
  password: process.env.SUPER_USER_PASSWORD || "",
  subDomain: SYSTEM_DB_NAME,
  username: "admin",
};
