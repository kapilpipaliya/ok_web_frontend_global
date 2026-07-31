import { createEmailTemplate } from "~/routes/internal/page/(email)/baseEmailTemplate";

const content = [
  {
    as: "h1",
    css: `return \`._id {
      color: \${t.var.color.text_hex};
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 1,
    text: "Password Changed Successfully",
  },
  {
    as: "p",
    css: `return \`._id {
      color: \${t.var.color.text_hex};
      margin-bottom: 24px;
    }\`;`,
    componentName: "Html",
    displayOrder: 2,
    text: "Your password has been successfully changed. If you did not make this change, please contact our support team immediately.",
  },
  {
    as: "a",
    css: `return \`._id {
      background-color: \${t.var.color.primary_hex};
      border: none;
      border-radius: 4px;
      color: \${t.var.color.primary_text_hex};
      cursor: pointer;
      display: inline-block;
      padding: 8px 16px;
      text-decoration: none;
    }\`;`,
    componentName: "Html",
    displayOrder: 3,
    props: `return {
      href: "${typeof window === "undefined" ? "" : window.location.origin}/support/contact"
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
