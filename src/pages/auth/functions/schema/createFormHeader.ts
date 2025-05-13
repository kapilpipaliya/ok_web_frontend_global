import { getLogoSchema } from "~/routes/internal/page/(email)/baseEmailTemplate";
import { css } from "~/lib/styles";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

/**
 * Creates a form header with logo and title
 * @param title - Form title
 * @param subheader - Optional subheader text
 * @returns Form header schema
 */
export function createFormHeader(title: string, subheader?: string) {
  return [
    getLogoSchema(
      css`display:grid; place-items:center;`,
      css`height:80px;`,
      css`color: \${args.theme.var.color.base_40};`,
    ),
    {
      as: "h1",
      css: SETTINGS_CONSTANTS.TITLE_CSS,
      componentName: "Html",
      displayOrder: 2,
      text: title,
    },
    ...(subheader
      ? [
          {
            as: "p",
            css: css`
        color: \${args.theme.var.color.base_60};
        text-align: center;
        margin-top: 8px;
        font-size: 16px;
      `,
            componentName: "Html",
            displayOrder: 3,
            text: subheader,
          },
        ]
      : []),
  ];
}
