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
    text: "Verify Your Email Address",
  },
  {
    as: "p",
    css: returnCSS`
      margin-bottom: 16px;
    `,
    componentName: "Html",
    pos: 2,
    text: "Thank you for signing up! Please verify your email address by clicking the button below:",
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
    text: "Verify Email Address",
  },
  {
    as: "p",
    css: returnCSS`
      color: \${args.theme.var.color.base};
      margin-bottom: 16px;
    `,
    componentName: "Html",
    pos: 4,
    text: "This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.",
  },
];

export const signupEmailVerificationForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Sent during the signup process to verify the user's email address, containing a verification link valid for 24 hours",
  key: "SignupEmailVerification",
  title: "Verify Your Email Address",
};
