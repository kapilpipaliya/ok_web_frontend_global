import {API} from "~/lib/api/endpoints";
import {FieldAttribute} from "~/lib/meta/FormMetadataType";

export const createEmailTemplate = (content: FieldAttribute[]) => ({
  as: "div",
  attributes: [
    {
      as: "div",
      attributes: [
        {
          as: "img",
          class: "w:100px mb:24",
          componentName: "Html",
          props: `return {
            alt: "Logo",
            src: \`\${window.location.origin}/${API.file.downloadCompanyLogoUrl}\`
          }`
        },
        {
          as: "hr",
          class: "fg:base-20 my:24",
          componentName: "Html"
        },

        ...content,
        {
          as: "div",
          attributes: [
            {
              as: "p",
              class: "color:grey font-size:12px",
              componentName: "Html",
              text: "© 2024 Your Company. All rights reserved."
            }
          ],
          class: "mt:32 text-align:center",
          componentName: "Html"
        }
      ],
      class: "max-w:600px m:auto p:32 bg:base-1",
      componentName: "Html"
    }
  ],
  class: "min-h:100vh bg:base-2 p:32",
  componentName: "Html"
} as FieldAttribute);