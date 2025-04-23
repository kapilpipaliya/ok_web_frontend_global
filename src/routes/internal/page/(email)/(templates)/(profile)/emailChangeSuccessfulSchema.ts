import { createEmailTemplate } from "~/routes/internal/page/(email)/baseEmailTemplate";
import { returnCSS } from "~/lib/styles";

const content = [
  {
    as: "h1",
    css: returnCSS`
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
    `,
    componentName: "Html",
    pos: 1,
    text: "Email Change Successful",
  },
  {
    as: "p",
    css: returnCSS`
      margin-bottom: 16px;
    `,
    componentName: "Html",
    pos: 2,
    text: "Your email address has been successfully updated. This is now your primary email for account notifications and communications.",
  },
  {
    as: "p",
    css: returnCSS`
      margin-bottom: 16px;
    `,
    componentName: "Html",
    pos: 3,
    text: "If you need to make any additional changes to your account, please visit your account settings.",
  },
  {
    as: "a",
    css: returnCSS`
      background-color: \${args.theme.var.color.primary};
      border: none;
      border-radius: 4px;
      color: \${args.theme.var.color.base_10};
      cursor: pointer;
      display: inline-block;
      padding: 8px 16px;
      text-decoration: none;
      &:hover {
        opacity: 0.9;
      }
    `,
    componentName: "Html",
    pos: 4,
    props: `return {
      // href: window.location.origin + "/admin/UserSettings",
      href: "${typeof window !== "undefined" ? window.location.origin : ""}/"
    }`,
    target: "_blank",
    text: "Go to Account Settings",
  },
];

export const emailChangeSuccessfulForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Confirmation email sent after an email address change has been successfully completed",
  key: "EmailChangeSuccessful",
  title: "Email Change Successful",
};
