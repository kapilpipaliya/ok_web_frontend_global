import type { FieldAttribute } from "~/lib/meta/FormMetadataType";
import { API } from "~/lib/api/endpoints";
import { returnCSS } from "~/lib/styles";

export function getLogoSchema(
  containerCss = "",
  imageCss = returnCSS`height:80px; margin-bottom:24px;`,
  borderCss = returnCSS`color: \${args.theme.var.color.base_80}; margin-top:24px; margin-bottom:24px;`,
) {
  return {
    as: "div",
    attributes: [
      {
        as: "a",
        attributes: [
          {
            as: "img",
            css: imageCss,
            componentName: "Html",
            displayOrder: 1,
            props: `return {
            alt: "Logo",
            src: "${typeof window !== "undefined" ? window.location.origin : ""}${API.file.downloadCompanyRectangularLogoUrl}"
            }`,
          },
        ],
        componentName: "Html",
        href: "/",
        displayOrder: 1,
      },
      {
        as: "hr",
        css: borderCss,
        componentName: "Html",
        displayOrder: 2,
      },
    ],
    css: containerCss,
    componentName: "Html",
    displayOrder: 1,
  } as FieldAttribute;
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
            displayOrder: 2,
          },
          {
            as: "div",
            attributes: [
              {
                as: "p",
                css: returnCSS`
  color: grey;
  font-size: 12px;
`,
                componentName: "Html",
                displayOrder: 1,
                text: "© 2024 Your Company. All rights reserved.",
              },
            ],
            css: returnCSS`
  margin-top: 32px;
  text-align: center;
`,
            componentName: "Html",
            displayOrder: 3,
          },
        ],
        css: returnCSS`
  max-width: 600px;
  margin: auto;
  padding: 32px;
  background-color: \${args.theme.var.color.base_2};
`,
        componentName: "Html",
        displayOrder: 1,
      },
    ],
    css: returnCSS`
  min-height: 100vh;
  background-color: \${args.theme.var.color.base_4};
  padding: 32px;
`,
    componentName: "Html",
    displayOrder: 1,
  }) as FieldAttribute;
