import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { Login } from "./auth/Login";
import { SignUp } from "./auth/SignUp";
import { Comp } from "./base/Comp";
import { CompCategory } from "./base/CompCategory";
import { DataType } from "./base/DataType";
import { Coll } from "./page/Coll";
import { CollCategory } from "./page/CollCategory";
import { FormCategory } from "./page/FormCategory";
import { Page } from "./page/Page";

export const FormMetaData: { [key: string]: IFormMetaData } = {
  // TODO: Coll has only one Attr. Add validation for that.
  Coll: Coll,
  CollCategory: CollCategory,
  Comp: Comp,
  CompCategory: CompCategory,
  DataType: DataType,
  FormCategory: FormCategory,
  LogIn: Login,
  Page: Page,
  SignUp: SignUp,
};

const rulesMetaAttribute = FormMetaData.Coll.attributes.find(
  (x) => x.name === "Rule",
);
const permissionMetaAttribute = FormMetaData.Coll.attributes.find(
  (x) => x.name === "Perm",
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
      name: "form",
      parentLabel: "FormCategory",
    },
    {
      attributes: [
        {
          componentName: "TagBox",
          name: "key",
        },
      ],
      componentName: "DynamicTable",
      name: "Unique",
    },
    rulesMetaAttribute!,
  ],
  name: "Form",
  title: "Form",
};
FormMetaData.ThankYouPage = {
  attributes: [...FormMetaData.Page.attributes],
  name: "ThankYouPage",
  title: "Thank You Page",
};
FormMetaData.ErrorPage = {
  attributes: [...FormMetaData.Page.attributes],
  name: "ErrorPage",
  title: "Error Page",
};
FormMetaData.TemplatePage = {
  attributes: [...FormMetaData.Page.attributes],
  name: "TemplatePage",
  title: "Templates",
};
