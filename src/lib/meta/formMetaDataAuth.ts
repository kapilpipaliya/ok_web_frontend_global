import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { Perm } from "./auth/Perm";
import { Role } from "./auth/Role";
import { User } from "./auth/User";
import { Import } from "./other/Import";
import { Nav } from "./other/Nav";
import { Dashboard } from "./page/Dashboard";

export const FormMetaDataAuth: { [key: string]: IFormMetaData; } = {
  Dashboard: Dashboard,
  Import: Import,
  Nav: Nav,
  Perm: Perm,
  Role: Role,
  User: User,
  // TODO: Dynamic Filter on Grid: Role->Filter
};
