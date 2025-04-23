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
    pos: 1,
    text: "Confirm Your New Email Address",
  },
  {
    as: "p",
    css: returnCSS`
      margin-bottom: 16px;
    `,
    componentName: "Html",
    pos: 2,
    text: "Please confirm your new email address by clicking the button below:",
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
      margin-bottom: 16px;
      padding: 8px 16px;
      text-decoration: none;
      &:hover {
        opacity: 0.9;
      }
    `,
    componentName: "Html",
    pos: 3,
    props: `return {
      href: args.searchParams.url,
    }`,
    target: "_blank",
    text: "Confirm Email Change",
  },
  {
    as: "p",
    css: returnCSS`
      color: \${args.theme.var.color.base};
      margin-bottom: 16px;
    `,
    componentName: "Html",
    pos: 4,
    text: "This link will expire in 24 hours. If you did not request this change, please ignore this email or contact support if you have concerns.",
  },
];

export const emailConfirmationForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Sent when users request to change their email address, containing a verification link to confirm the new email",
  key: "EmailConfirmation",
  title: "Confirm Your New Email Address",
};
