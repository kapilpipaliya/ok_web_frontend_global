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
    text: "Your Verification Code",
  },
  {
    as: "p",
    css: returnCSS`
      margin-bottom: 16px;
    `,
    componentName: "Html",
    pos: 2,
    text: "Use the following code to verify your account:",
  },
  {
    as: "div",
    attributes: [
      {
        as: "p",
        css: returnCSS`
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 4px;
        `,
        componentName: "Html",
        pos: 1,
        text: "123456",
      },
    ],
    css: returnCSS`
      background-color: \${args.theme.var.color.base_10};
      border-radius: 4px;
      margin-bottom: 24px;
      padding: 16px;
      text-align: center;
    `,
    componentName: "Html",
    pos: 3,
  },
  {
    as: "p",
    css: returnCSS`
      color: \${args.theme.var.color.base};
    `,
    componentName: "Html",
    pos: 4,
    text: "This code will expire in 10 minutes.",
  },
];

export const verificationCodeForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Generic verification code email used for various authentication purposes, valid for 10 minutes",
  key: "VerificationCode",
  title: "Verification Code",
};
