import type { IFormMetaData } from "~/lib/FormMetadataType";

import { User } from "../User";
import { Dashboard } from "./Dashboard";
import { Import } from "./Import";
import { Nav } from "./Nav";
import { Perm } from "./Perm";
import { Role } from "./Role";

export const FormMetaDataAuth: { [key: string]: IFormMetaData; } = {
  Dashboard: Dashboard,
  Import: Import,
  Nav: Nav,
  Perm: Perm,
  Role: Role,
  User: User,
  // TODO: Dynamic Filter on Grid: Role->Filter
};
