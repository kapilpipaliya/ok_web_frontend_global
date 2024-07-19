import type { IFormMetaData } from "~/lib/FormMetadataType";

import { Coll } from "./Coll";
import { CollCategory } from "./CollCategory";
import { Comp } from "./Comp";
import { CompCategory } from "./CompCategory";
import { DataType } from "./DataType";
import { FormCategory } from "./FormCategory";
import { Login } from "./Login";
import { Page } from "./Page";
import { SignUp } from "./SignUp";

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
