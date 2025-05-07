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
    text: "Reset Your Password",
  },
  {
    as: "p",
    css: returnCSS`
      margin-bottom: 16px;
    `,
    componentName: "Html",
    displayOrder: 2,
    text: "We received a request to reset your password. Please use the following verification code to complete the process:",
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
        displayOrder: 1,
        props: `return {
            text: args.searchParams.otp,
          }`,
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
    displayOrder: 3,
  },
  {
    as: "p",
    css: returnCSS`
      color: \${args.theme.var.color.base};
    `,
    componentName: "Html",
    displayOrder: 4,
    text: "This code will expire in 10 minutes. If you didn't request this password reset, please ignore this email or contact support if you have concerns.",
  },
];

export const passwordResetForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Sent when users request a password reset, containing a verification code valid for 10 minutes",
  key: "PasswordReset",
  title: "Reset Your Password",
};
