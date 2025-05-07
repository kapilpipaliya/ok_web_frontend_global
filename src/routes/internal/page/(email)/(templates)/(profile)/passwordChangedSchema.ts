import { returnCSS } from "~/lib/styles";
import { createEmailTemplate } from "~/routes/internal/page/(email)/baseEmailTemplate";

const content = [
  {
    as: "h1",
    css: returnCSS`
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
    `,
    componentName: "Html",
    displayOrder: 1,
    text: "Password Changed Successfully",
  },
  {
    as: "p",
    css: returnCSS`
      margin-bottom: 24px;
    `,
    componentName: "Html",
    displayOrder: 2,
    text: "Your password has been successfully changed. If you did not make this change, please contact our support team immediately.",
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
    displayOrder: 3,
    props: `return {
      href: "${typeof window !== "undefined" ? window.location.origin : ""}/support/contact"
    }`,
    target: "_blank",
    text: "Contact Support",
  },
];

export const passwordChangedForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Notification sent after a user's password has been successfully changed",
  key: "PasswordChanged",
  title: "Password Changed Successfully",
};
