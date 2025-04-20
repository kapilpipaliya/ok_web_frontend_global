import type { FieldAttribute } from "~/lib/meta/FormMetadataType";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { API } from "~/lib/api/endpoints";
import { css } from "~/lib/styles";

export function getLogoSchema(
  containerCss = "",
  imageCss = css`height:80px; margin-bottom:24px;`,
  borderCss = css`color: \${args.theme.var.color.base_80}; margin-top:24px; margin-bottom:24px;`,
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
            pos: 1,
            props: `return {
            alt: "Logo",
            src: "${typeof window !== "undefined" ? window.location.origin : ""}${API.file.downloadCompanyRectangularLogoUrl}"
            }`,
          },
        ],
        componentName: "Html",
        href: "/",
        pos: 1,
      },
      {
        as: "hr",
        css: borderCss,
        componentName: "Html",
        pos: 2,
      },
    ],
    css: containerCss,
    componentName: "Html",
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
            pos: 1,
          },
          {
            as: "div",
            attributes: [
              {
                as: "p",
                css: css`
  color: grey;
  font-size: 12px;
`,
                componentName: "Html",
                pos: 1,
                text: "© 2024 Your Company. All rights reserved.",
              },
            ],
            css: css`
  margin-top: 32px;
  text-align: center;
`,
            componentName: "Html",
            pos: 2,
          },
        ],
        css: css`
  max-width: 600px;
  margin: auto;
  padding: 32px;
  background-color: \${args.theme.var.color.base_2};
`,
        componentName: "Html",
        pos: 1,
      },
    ],
    css: css`
  min-height: 100vh;
  background-color: \${args.theme.var.color.base_4};
  padding: 32px;
`,
    componentName: "Html",
    pos: 1,
  }) as FieldAttribute;
