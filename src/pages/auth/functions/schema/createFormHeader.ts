import {getLogoSchema} from "~/routes/internal/page/(email)/baseEmailTemplate";
import {css} from "~/lib/styles";
import {SETTINGS_CONSTANTS} from "~/pages/settings/constants";

/**
 * Creates a form header with logo and title
 * @param title - Form title
 * @returns Form header schema
 */
export function createFormHeader(title: string) {
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
      pos: 2,
      text: title,
    },
  ];
}