import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { Login } from "./auth/Login";
import { Perm } from "./auth/Perm";
import { Role } from "./auth/Role";
import { SignUp } from "./auth/SignUp";
import { User } from "./auth/User";
import { Comp } from "./base/Comp";
import { CompCategory } from "./base/CompCategory";
import { DataType } from "./base/DataType";
import { GlobalSetting } from "./base/GlobalSetting";
import { File, FileTag, Folder } from "./file/File";
import { Import } from "./other/Import";
import { Nav } from "./other/Nav";
import { Coll } from "./page/Coll";
import { CollCategory } from "./page/CollCategory";
import { Dashboard } from "./page/Dashboard";
import { FormCategory } from "./page/FormCategory";
import { Page } from "./page/Page";

const FormMetaDataAuth: { [key: string]: IFormMetaData } = {
  Dashboard: Dashboard,
  Import: Import,
  Nav: Nav,
  Perm: Perm,
  Role: Role,
  User: User,
  // TODO: Dynamic Filter on Grid: Role->Filter
};

export const FormMetaData: { [key: string]: IFormMetaData } = {
  ...FormMetaDataAuth,
  // TODO: Coll has only one Attr. Add validation for that.
  Coll: Coll,
  CollCategory: CollCategory,
  Comp: Comp,
  CompCategory: CompCategory,
  DataType: DataType,
  File: File,
  FileTag: FileTag,
  Folder: Folder,
  FormCategory: FormCategory,
  GlobalSetting: GlobalSetting,
  LogIn: Login,
  Page: Page,
  SignUp: SignUp,
};
for (const key in FormMetaData) {
  // @ts-expect-error ignore
  FormMetaData[key].isNoPermissionCheck = true;
  // @ts-expect-error ignore
  FormMetaData[key].addActionButtons = true;
}

const rulesMetaAttribute = FormMetaData.Coll.attributes.find(
  (x) => x.key === "Rule",
);
const permissionMetaAttribute = FormMetaData.Coll.attributes.find(
  (x) => x.key === "Perm",
);
FormMetaData.Page.attributes.push(permissionMetaAttribute!);

FormMetaData.Form = {
  attributes: [
    ...FormMetaData.Page.attributes,
    {
      collection: "g:'FormCategory'",
      componentName: "SelectBox",
      displayName: "Form Category",
      inward: true,
      key: "form",
      parentLabel: "FormCategory",
    },
    {
      attributes: [
        {
          componentName: "TagBox",
          key: "key",
        },
      ],
      componentName: "DynamicTable",
      key: "Unique",
    },
    rulesMetaAttribute!,
  ],
  key: "Form",
  title: "Form",
};

FormMetaData.CompExample = {
  attributes: [
    ...FormMetaData.Page.attributes,
    // TODO: Fix this. It will select Parent Comp.
    {
      collection: "g:'Comp'",
      componentName: "SelectBox",
      displayName: "Parent Component",
      key: "Comp",
      // validation: { required: true },
    },
    rulesMetaAttribute!,
  ],
  key: "CompExample",
  title: "Comp Example",
};

FormMetaData.ThankYouPage = {
  attributes: [...FormMetaData.Page.attributes],
  key: "ThankYouPage",
  title: "Thank You Page",
};
FormMetaData.ErrorPage = {
  attributes: [...FormMetaData.Page.attributes],
  key: "ErrorPage",
  title: "Error Page",
};
FormMetaData.TemplatePage = {
  attributes: [...FormMetaData.Page.attributes],
  key: "TemplatePage",
  title: "Templates",
};
