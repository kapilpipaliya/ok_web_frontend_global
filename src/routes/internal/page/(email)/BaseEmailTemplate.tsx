import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { API } from "~/lib/api/endpoints";

export function getLogoSchema(containerClass = "", imageClass = "h:80px mb:24", borderClass = "fg:base-20 my:24") {
  return {
    as: "div",
    attributes: [
      {
        as: "img",
        class: imageClass,
        componentName: "Html",
        pos: 1,
        props: `return {
        alt: "Logo",
        src: "${typeof window !== 'undefined' ? window.location.origin : ""}${API.file.downloadCompanyRectangularLogoUrl}"
        }`,
      },
      {
        as: "hr",
        class: borderClass,
        componentName: "Html",
        pos: 2,
      },
    ],
    class: containerClass,
    componentName: "Html",
  };
}

export const createEmailTemplate = (content: FieldAttribute[]) =>
  ({
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          getLogoSchema(),
          {
            as: "",
            attributes: content,
            componentName: "Html",
            pos: 1,
          },
          {
            as: "div",
            attributes: [
              {
                as: "p",
                class: "color:grey font-size:12px",
                componentName: "Html",
                pos: 1,
                text: "© 2024 Your Company. All rights reserved.",
              },
            ],
            class: "mt:32 text-align:center",
            componentName: "Html",
            pos: 2,
          },
        ],
        class: "max-w:600px m:auto p:32 bg:base-1",
        componentName: "Html",
        pos: 1,
      },
    ],
    class: "min-h:100vh bg:base-2 p:32",
    componentName: "Html",
    pos: 1,
  }) as FieldAttribute;
