import type { FieldAttribute } from "~/lib/meta/FormMetadataType";
import { API } from "~/lib/api/endpoints";

export function getLogoSchema(
  containerCss = "",
  imageCss = `return \`._id {
  height:80px; margin-bottom:24px;
}\`;`,
  borderCss = `return \`._id {
  border: none;
  border-top: 1px solid \${args.theme.var.color.border_hex};
  margin-top:24px; margin-bottom:24px;
}\`;`,
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
            src: "${typeof window === "undefined" ? "" : window.location.origin}${API.file.downloadCompanyRectangularLogoUrl}"
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
            as: "div",
            attributes: content,
            componentName: "Html",
            css: `return \`._id {
  color: \${args.theme.var.color.text_hex};
}\`;`,
            displayOrder: 2,
          },
          {
            as: "div",
            attributes: [
              {
                as: "p",
                css: `return \`._id {
  color: \${args.theme.var.color.text_light_200_hex};
  font-size: 12px;
}\`;`,
                componentName: "Html",
                displayOrder: 1,
                text: "© 2025 ${args.globalSetting?.P.appName}. All rights reserved.",
              },
            ],
            css: `return \`._id {
  margin-top: 32px;
  text-align: center;
}\`;`,
            componentName: "Html",
            displayOrder: 3,
          },
        ],
        css: `return \`._id {
  max-width: 600px;
  margin: auto;
  padding: 32px;
  background-color: \${args.theme.var.color.background_light_100_hex};
  color: \${args.theme.var.color.text_hex};
}\`;`,
        componentName: "Html",
        displayOrder: 3,
      },
    ],
    css: `return \`._id {
  min-height: 100vh;
  background-color: \${args.theme.var.color.background_hex};
  color: \${args.theme.var.color.text_hex};
  padding: 32px;
}\`;`,
    componentName: "Html",
    displayOrder: 1,
  }) as FieldAttribute;
