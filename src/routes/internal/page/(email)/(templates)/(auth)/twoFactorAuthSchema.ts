import { css } from "~/lib/styles";
import { createEmailTemplate } from "~/routes/internal/page/(email)/baseEmailTemplate";

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
    text: "Two-Factor Authentication Code",
  },
  {
    as: "p",
    css: css`
      margin-bottom: 16px;
    `,
    componentName: "Html",
    pos: 2,
    text: "Here is your two-factor authentication code:",
  },
  {
    as: "div",
    attributes: [
      {
        as: "p",
        css: css`
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 4px;
        `,
        componentName: "Html",
        pos: 1,
        text: "847291",
      },
    ],
    css: css`
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
    css: css`
      color: \${args.theme.var.color.base};
    `,
    componentName: "Html",
    pos: 4,
    text: "This code will expire in 5 minutes. Do not share this code with anyone.",
  },
];

export const twoFactorAuthForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Sent when two-factor authentication is required, containing a verification code",
  key: "TwoFactorAuth",
  title: "Two-Factor Authentication Code",
};
