import type { IFormMetaData } from "~/lib/FormMetadataType";

import { Dashboard } from "./Dashboard";
import { Import } from "./Import";
import { Nav } from "./Nav";
import { Perm } from "./Perm";
import { Role } from "./Role";
import { User } from "./User";

export const FormMetaDataAuth: { [key: string]: IFormMetaData; } = {
  Dashboard: Dashboard,
  Import: Import,
  Nav: Nav,
  Perm: Perm,
  Role: Role,
  User: User,
  // TODO: Dynamic Filter on Grid: Role->Filter
};
