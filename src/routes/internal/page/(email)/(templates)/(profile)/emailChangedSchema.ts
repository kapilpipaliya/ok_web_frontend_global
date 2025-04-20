import { createEmailTemplate } from "~/routes/internal/page/(email)/baseEmailTemplate";
import { css } from "~/lib/styles";

const content = [
  {
    as: "h1",
    css: css`
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
    `,
    componentName: "Html",
    pos: 1,
    text: "Email Change Notification",
  },
  {
    as: "p",
    css: css`
      margin-bottom: 16px;
    `,
    componentName: "Html",
    pos: 2,
    text: "We're writing to let you know that a request has been made to change the email address associated with your account.",
  },
  {
    as: "p",
    css: css`
      margin-bottom: 16px;
    `,
    componentName: "Html",
    pos: 3,
    text: "If you initiated this change, no further action is required. The new email address will be activated after verification.",
  },
  {
    as: "p",
    css: css`
      color: \${args.theme.var.color.error};
      font-weight: bold;
      margin-bottom: 16px;
    `,
    componentName: "Html",
    pos: 4,
    text: "If you did not request this change, please contact our support team immediately.",
  },
  {
    as: "a",
    css: css`
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
    pos: 5,
    props: `return {
      href: "${typeof window !== "undefined" ? window.location.origin : ""}/support/contact"
    }`,
    target: "_blank",
    text: "Contact Support",
  },
];

export const emailChangedForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Sent to notify users that a request has been made to change their email address, with instructions if they didn't initiate the change",
  key: "EmailChanged",
  title: "Email Change Notification",
};
