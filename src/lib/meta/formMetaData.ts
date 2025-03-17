import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { Perm } from "./auth/Perm";
import { Role } from "./auth/Role";
import { User } from "./auth/User";
import { Comp } from "./base/Comp";
import { GlobalSetting } from "./base/GlobalSetting";
import { File, FileTag, Folder } from "./file/File";
import { Import } from "./other/Import";
import { Nav } from "./other/Nav";
import { Coll } from "./page/Coll";
import { FormCategory } from "./page/FormCategory";
import { Page, variantAttributes } from "./page/Page";

const FormMetaDataAuth: { [key: string]: IFormMetaData } = {
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
  // Coll: Coll("Page"),
  // CollCategory: CollCategory,
  Comp: Comp,
  // CompCategory: CompCategory,
  // DataType: DataType,
  File: File,
  FileTag: FileTag,
  Folder: Folder,
  FormCategory: FormCategory,
  GlobalSetting: GlobalSetting,
  Page: Page,
};
for (const key in FormMetaData) {
  // @ts-expect-error ignore
  FormMetaData[key].isNoPermissionCheck = true;
  // @ts-expect-error ignore
  FormMetaData[key].addActionButtons = true;
}

FormMetaData.Form = {
  attributes: [
    ...FormMetaData.Page.attributes,
    Coll("Form").attributes.find((x) => x.key === "PermGlobal")!,
    // {
    //   collection: "g:'FormCategory'",
    //   componentName: "Select",
    //   displayName: "Form Category",
    //   hideInGrid: true,
    //   inward: true,
    //   key: "form",
    //   parentLabel: "FormCategory",
    // },
    {
      attributes: [
        {
          componentName: "MultiSelect",
          key: "key",
        },
      ],
      componentName: "DynamicTable",
      hide: true,
      key: "Unique",
    },
    // rulesMetaAttribute!,
  ],
  key: "Form",
  title: "Form",
};

FormMetaData.Page.attributes.push({
  ...Coll("Page").attributes.find((x) => x.key === "PermGlobal")!,
});

export const ComponentLabel = "Component";
FormMetaData.Component = {
  attributes: [...FormMetaData.Page.attributes, variantAttributes!],
  key: "Component",
  title: "Component",
};

FormMetaData.CompExample = {
  attributes: [
    ...FormMetaData.Page.attributes,
    // TODO: Fix this. It will select Parent Comp.
    {
      collection: "g:'Comp'",
      componentName: "Select",
      displayName: "Parent Component",
      key: "Comp",
      // validation: { required: true },
    },
  ],
  key: "CompExample",
  title: "Comp Example",
};

// FormMetaData.ThankYouPage = {
//   attributes: [...FormMetaData.Page.attributes],
//   key: "ThankYouPage",
//   title: "Thank You Page",
// };
// FormMetaData.ErrorPage = {
//   attributes: [...FormMetaData.Page.attributes],
//   key: "ErrorPage",
//   title: "Error Page",
// };
FormMetaData.TemplatePage = {
  attributes: [...FormMetaData.Page.attributes],
  key: "TemplatePage",
  title: "Templates",
};
FormMetaData.EmailTemplate = {
  attributes: [...FormMetaData.Page.attributes],
  key: "EmailTemplate",
  title: "Email Template",
};
