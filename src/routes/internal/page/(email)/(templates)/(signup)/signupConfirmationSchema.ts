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
    text: "Confirm Your Email Address",
  },
  {
    as: "p",
    css: returnCSS`
      margin-bottom: 16px;
    `,
    componentName: "Html",
    displayOrder: 2,
    text: "Thank you for signing up! Please confirm your email address to activate your account.",
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
    displayOrder: 3,
    props: `return {
      href: args.searchParams.url,
    }`,
    target: "_blank",
    text: "Confirm Email",
  },
  {
    as: "p",
    css: returnCSS`
      color: \${args.theme.var.color.base};
    `,
    componentName: "Html",
    displayOrder: 4,
    text: "If you didn't create an account, you can safely ignore this email.",
  },
];

export const signupConfirmationForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Initial email sent after user signup to confirm their email address",
  key: "SignupConfirmation",
  title: "Confirm Your Email Address",
};
